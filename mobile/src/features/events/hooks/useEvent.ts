import { useQuery } from '@tanstack/react-query';

import { TOKENS } from '../../../constants/tokens';
import { TTL } from '../../../constants/ttl';
import { useAuthStore } from '../../../store';
import { fetchEventDetail } from '../api';

export const useEvent = (eventId: string) => {
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useQuery({
    queryKey: TOKENS.event(eventId),
    queryFn: () => fetchEventDetail(eventId, userId),
    enabled: Boolean(eventId),
    staleTime: TTL.events,
  });
};
