import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TOKENS } from '../../../constants/tokens';
import { useAuthStore } from '../../../store';
import { togglePrayerReaction } from '../api';

export const usePrayerReaction = (prayerId: string) => {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emoji: string) => {
      if (!userId) {
        throw new Error('Sign in to react to prayers');
      }

      return togglePrayerReaction(prayerId, userId, emoji);
    },
    onSuccess: (reactions) => {
      queryClient.setQueryData(TOKENS.prayer(prayerId), (current: any) =>
        current ? { ...current, reactions, reactionCount: reactions.length } : current,
      );
      queryClient.invalidateQueries({ queryKey: TOKENS.prayers, exact: false });
    },
  });
};
