
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TOKENS } from '../../../constants/tokens';
import { useAuthStore } from '../../../store';
import { upsertRsvp } from '../api';
import type { RsvpStatus } from '../types';

export const useRSVP = (eventId: string) => {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: RsvpStatus) => {
      if (!userId) {
        throw new Error('You need to be signed in to RSVP');
      }
      await upsertRsvp(eventId, userId, status);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: TOKENS.event(eventId) }),
        queryClient.invalidateQueries({ queryKey: TOKENS.events }),
      ]);
    },
  });
};
