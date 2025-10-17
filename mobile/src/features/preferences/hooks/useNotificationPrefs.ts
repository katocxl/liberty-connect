import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { TOKENS } from '../../../constants/tokens';
import { useAuthStore } from '../../../store';
import { fetchNotificationPreferences, updateNotificationPreferences } from '../api';
import type { NotificationPreferences } from '../types';

const DEFAULT_PREFS: NotificationPreferences = {
  events: true,
  announcements: true,
  devotionals: true,
  prayer_replies: true,
};

export const useNotificationPrefs = () => {
  const orgId = useAuthStore((state) => state.orgId);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: TOKENS.notificationPrefs(orgId, userId ?? undefined),
    queryFn: () => {
      if (!userId) {
        return DEFAULT_PREFS;
      }
      return fetchNotificationPreferences(orgId, userId);
    },
  });

  const mutation = useMutation({
    mutationFn: (prefs: NotificationPreferences) => {
      if (!userId) {
        throw new Error('Sign in to manage preferences');
      }
      return updateNotificationPreferences(orgId, prefs);
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(TOKENS.notificationPrefs(orgId, userId ?? undefined), variables);
    },
  });

  return {
    ...query,
    update: mutation.mutate,
    updating: mutation.isPending,
  };
};
