import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { TOKENS } from '../../../constants/tokens';
import { useAuthStore } from '../../../store';
import { searchContent } from '../api';

export const useSearch = (query: string) => {
  const orgId = useAuthStore((state) => state.orgId);
  const trimmed = query.trim();

  const enabled = trimmed.length >= 2;

  const result = useQuery({
    queryKey: TOKENS.search(trimmed, orgId),
    queryFn: () => searchContent(trimmed, orgId),
    enabled,
  });

  return useMemo(() => ({
    ...result,
    isSearchable: enabled,
  }), [enabled, result]);
};
