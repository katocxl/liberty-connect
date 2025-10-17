import { useQuery } from '@tanstack/react-query';

import { TOKENS } from '../../../constants/tokens';
import { TTL } from '../../../constants/ttl';
import { useAuthStore } from '../../../store';
import { fetchPrayers } from '../api';

export const usePrayers = () => {
  const orgId = useAuthStore((state) => state.orgId);

  return useQuery({
    queryKey: [...TOKENS.prayers, orgId],
    queryFn: () => fetchPrayers(orgId),
    staleTime: TTL.prayers,
  });
};
