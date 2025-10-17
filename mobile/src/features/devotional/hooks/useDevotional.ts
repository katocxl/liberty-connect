import { useQuery } from '@tanstack/react-query';

import { TOKENS } from '../../../constants/tokens';
import { TTL } from '../../../constants/ttl';
import { useAuthStore } from '../../../store';
import { fetchLatestDevotional } from '../api';

export const useDevotional = () => {
  const orgId = useAuthStore((state) => state.orgId);

  return useQuery({
    queryKey: [...TOKENS.devotionals, orgId],
    queryFn: () => fetchLatestDevotional(orgId),
    staleTime: TTL.devotionals,
  });
};
