import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TOKENS } from '../../../constants/tokens';
import { useAuthStore } from '../../../store';
import { createPrayer } from '../api';

interface Variables {
  body: string;
  isAnonymous: boolean;
}

export const useComposePrayer = () => {
  const orgId = useAuthStore((state) => state.orgId);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body, isAnonymous }: Variables) => createPrayer(orgId, userId, body, isAnonymous),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOKENS.prayers, exact: false });
    },
  });
};
