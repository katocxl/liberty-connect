import { useQuery } from '@tanstack/react-query';

import { TOKENS } from '../../../constants/tokens';
import { TTL } from '../../../constants/ttl';
import { useAuthStore } from '../../../store';
import { fetchEvents } from '../api';

export const useEvents = () => {
  const orgId = useAuthStore((state) => state.orgId);

  return useQuery({
    queryKey: [...TOKENS.events, orgId],
    queryFn: () => fetchEvents(orgId),
    staleTime: TTL.events,
  });
};
