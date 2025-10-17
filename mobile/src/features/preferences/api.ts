import { callEdgeFunction } from '../../lib/apiClient';
import { supabase } from '../../lib/supabase';
import type { NotificationPreferences } from './types';

export const fetchNotificationPreferences = async (
  orgId: string,
  userId: string,
): Promise<NotificationPreferences> => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('events, announcements, devotionals, prayer_replies')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return {
      events: true,
      announcements: true,
      devotionals: true,
      prayer_replies: true,
    } satisfies NotificationPreferences;
  }

  return data as NotificationPreferences;
};

export const updateNotificationPreferences = async (
  orgId: string,
  preferences: NotificationPreferences,
) => {
  await callEdgeFunction('notification_prefs_upsert', {
    org_id: orgId,
    ...preferences,
  });
};
