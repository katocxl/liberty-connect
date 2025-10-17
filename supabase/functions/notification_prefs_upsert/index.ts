import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

import {
  createUserClient,
  errorResponse,
  jsonResponse,
  methodNotAllowed,
  requireActiveMembership,
  requireUser,
} from '../_shared/mod.ts';

interface NotificationPreferencesPayload {
  org_id?: string;
  events?: boolean;
  announcements?: boolean;
  devotionals?: boolean;
  prayer_replies?: boolean;
}

const defaultPreferences = {
  events: true,
  announcements: true,
  devotionals: true,
  prayer_replies: true,
};

serve(async (request) => {
  if (!['POST', 'PUT'].includes(request.method)) {
    return methodNotAllowed(['POST', 'PUT']);
  }

  const supabase = createUserClient(request);

  try {
    const payload = (await request.json()) as NotificationPreferencesPayload;
    const { org_id: orgId } = payload ?? {};

    if (!orgId) {
      return errorResponse('Missing org_id', 400);
    }

    const user = await requireUser(supabase, request);
    await requireActiveMembership(supabase, orgId, user.id);

    const { data: existing, error: readError } = await supabase
      .from('notification_preferences')
      .select('events, announcements, devotionals, prayer_replies')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (readError) {
      console.error('notification_preferences.select', readError);
      return errorResponse('Failed to read preferences', 500);
    }

    const nextPreferences = {
      events:
        payload.events ??
        existing?.events ??
        defaultPreferences.events,
      announcements:
        payload.announcements ??
        existing?.announcements ??
        defaultPreferences.announcements,
      devotionals:
        payload.devotionals ??
        existing?.devotionals ??
        defaultPreferences.devotionals,
      prayer_replies:
        payload.prayer_replies ??
        existing?.prayer_replies ??
        defaultPreferences.prayer_replies,
    };

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert(
        {
          org_id: orgId,
          user_id: user.id,
          ...nextPreferences,
        },
        { onConflict: 'org_id,user_id' },
      )
      .select('org_id, user_id, events, announcements, devotionals, prayer_replies')
      .single();

    if (error) {
      console.error('notification_preferences.upsert', error);
      return errorResponse('Failed to upsert notification preferences', 500);
    }

    return jsonResponse({
      status: 'ok',
      preferences: data,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error(error);
    return errorResponse('Unexpected error', 500);
  }
});
