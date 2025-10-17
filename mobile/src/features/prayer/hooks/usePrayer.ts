import { useQuery } from '@tanstack/react-query';

import { TOKENS } from '../../../constants/tokens';
import { TTL } from '../../../constants/ttl';
import { fetchPrayer } from '../api';

export const usePrayer = (id: string) =>
  useQuery({
    queryKey: TOKENS.prayer(id),
    queryFn: () => fetchPrayer(id),
    enabled: Boolean(id),
    staleTime: TTL.prayers,
  });
