import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

import {
  createServiceClient,
  errorResponse,
  jsonResponse,
  methodNotAllowed,
  sendExpoPushMessages,
} from '../_shared/mod.ts';

interface ReminderPayload {
  window_minutes?: number;
  invoked_at?: string;
}

interface EventRecord {
  id: string;
  org_id: string;
  title: string;
  start_at: string;
  organizations?: {
    name?: string | null;
    timezone?: string | null;
  } | null;
}

const EVENT_URL_SCHEME = 'myapp://event';

const formatEventTime = (startAt: string, timeZone?: string | null) => {
  const date = new Date(startAt);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timeZone ?? 'UTC',
  }).format(date);
};

serve(async (request) => {
  if (request.method !== 'POST') {
    return methodNotAllowed(['POST']);
  }

  const supabase = createServiceClient();

  try {
    const payload = request.bodyUsed
      ? ((await request.json()) as ReminderPayload)
      : {};

    const windowMinutes = Number(payload?.window_minutes ?? 30);
    const invokedAt = payload?.invoked_at ? new Date(payload.invoked_at) : new Date();
    if (Number.isNaN(invokedAt.getTime())) {
      return errorResponse('Invalid invoked_at timestamp', 400);
    }

    const targetTime = new Date(invokedAt.getTime() + windowMinutes * 60_000);
    const windowStart = new Date(targetTime.getTime() - 60_000);
    const windowEnd = new Date(targetTime.getTime() + 60_000);

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, org_id, title, start_at, organizations(name, timezone)')
      .gte('start_at', windowStart.toISOString())
      .lte('start_at', windowEnd.toISOString());

    if (eventsError) {
      console.error('events.select', eventsError);
      return errorResponse('Failed to load events', 500);
    }

    const notifications = [];

    const messages = [];

    for (const event of (events ?? []) as EventRecord[]) {
      const { data: attendees, error: rsvpError } = await supabase
        .from('rsvps')
        .select('user_id')
        .eq('event_id', event.id)
        .eq('status', 'yes');

      if (rsvpError) {
        console.error('rsvps.select', rsvpError, { eventId: event.id });
        continue;
      }

      const userIds = Array.from(new Set((attendees ?? []).map((row) => row.user_id)));
      if (userIds.length === 0) {
        notifications.push({
          event_id: event.id,
          org_id: event.org_id,
          tokens: 0,
          sent: 0,
          skipped_reason: 'no_rsvps',
        });
        continue;
      }

      const [{ data: tokens, error: tokensError }, { data: preferences, error: prefsError }] =
        await Promise.all([
          supabase
            .from('device_tokens')
            .select('token, user_id')
            .eq('org_id', event.org_id)
            .is('disabled_at', null)
            .in('user_id', userIds),
          supabase
            .from('notification_preferences')
            .select('user_id, events')
            .eq('org_id', event.org_id)
            .in('user_id', userIds),
        ]);

      if (tokensError) {
        console.error('device_tokens.select', tokensError, { eventId: event.id });
        continue;
      }

      if (prefsError) {
        console.error('notification_preferences.select', prefsError, { eventId: event.id });
        continue;
      }

      const prefMap = new Map(preferences?.map((pref) => [pref.user_id, pref.events]));
      const activeTokens = (tokens ?? []).filter((row) => prefMap.get(row.user_id) !== false);

      const uniqueTokens = Array.from(
        activeTokens.reduce<Map<string, string>>(
          (acc, row) => acc.set(row.token, row.user_id),
          new Map(),
        ).keys(),
      );

      if (uniqueTokens.length === 0) {
        notifications.push({
          event_id: event.id,
          org_id: event.org_id,
          tokens: 0,
          sent: 0,
          skipped_reason: 'no_tokens',
        });
        continue;
      }

      const orgName = event.organizations?.name ?? 'Your community';
      const startTimeLabel = formatEventTime(event.start_at, event.organizations?.timezone);

      const title = `${event.title} • 30 minute reminder`;
      const body = `${orgName}: ${event.title} begins at ${startTimeLabel}`;

      for (const token of uniqueTokens) {
        messages.push({
          to: token,
          title,
          body,
          sound: 'default',
          data: {
            type: 'event',
            event_id: event.id,
            org_id: event.org_id,
            url: `${EVENT_URL_SCHEME}/${event.id}`,
          },
        });
      }

      notifications.push({
        event_id: event.id,
        org_id: event.org_id,
        tokens: uniqueTokens.length,
        sent: uniqueTokens.length,
      });
    }

    const { tickets } = await sendExpoPushMessages(messages);

    console.log(
      JSON.stringify({
        window_start: windowStart.toISOString(),
        window_end: windowEnd.toISOString(),
        events: notifications,
        messages: messages.length,
        tickets,
      }),
    );

    return jsonResponse({
      status: 'ok',
      events: notifications,
      tickets,
      messages: messages.length,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error(error);
    return errorResponse('Unexpected error', 500);
  }
});
