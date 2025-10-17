
import type { Database } from '../../types/database.types';
import { supabase } from '../../lib/supabase';
import type { EventDetail, EventSummary, RsvpStatus } from './types';

type EventRow = Database['public']['Tables']['events']['Row'] & {
  organizations?: {
    timezone: string | null;
  } | null;
};

const mapEvent = (row: EventRow): EventSummary => ({
  id: row.id,
  title: row.title,
  description: row.description,
  location: row.location,
  locationUrl: row.location_url,
  startAt: row.start_at,
  endAt: row.end_at,
  coverImagePath: row.cover_image_path,
  timezone: row.organizations?.timezone ?? null,
});

export const fetchEvents = async (orgId: string): Promise<EventSummary[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('id, title, description, location, location_url, start_at, end_at, cover_image_path, org_id, organizations(timezone)')
    .eq('org_id', orgId)
    .order('start_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapEvent);
};

export const fetchEventDetail = async (eventId: string, userId?: string | null): Promise<EventDetail> => {
  const { data, error } = await supabase
    .from('events')
    .select('id, org_id, title, description, location, location_url, start_at, end_at, cover_image_path, capacity, created_by, organizations(timezone)')
    .eq('id', eventId)
    .maybeSingle<EventRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Event not found');
  }

  const { count, error: countError } = await supabase
    .from('rsvps')
    .select('user_id', { head: true, count: 'exact' })
    .eq('event_id', eventId)
    .eq('status', 'yes');

  if (countError) {
    throw new Error(countError.message);
  }

  let userRsvp: RsvpStatus | null = null;
  if (userId) {
    const { data: rsvpData } = await supabase
      .from('rsvps')
      .select('status')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    userRsvp = (rsvpData?.status as RsvpStatus | undefined) ?? null;
  }

  return {
    ...mapEvent(data),
    createdBy: data.created_by,
    capacity: data.capacity,
    orgId: data.org_id,
    attendeeCount: count ?? 0,
    userRsvp,
  };
};

export const upsertRsvp = async (eventId: string, userId: string, status: RsvpStatus) => {
  const { error } = await supabase
    .from('rsvps')
    .upsert({
      event_id: eventId,
      user_id: userId,
      status,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'event_id,user_id' });

  if (error) {
    throw new Error(error.message);
  }
};
