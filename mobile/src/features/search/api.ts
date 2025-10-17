import { callEdgeFunction } from '../../lib/apiClient';
import type { SearchResult } from './types';

interface SearchResponse {
  results: SearchResult[];
}

export const searchContent = async (query: string, orgId: string) => {
  if (!query.trim()) {
    return [] as SearchResult[];
  }

  const response = await callEdgeFunction<SearchResponse, Record<string, string>>(
    'search',
    {
      q: query,
      org_id: orgId,
      limit: '20',
    },
    { method: 'GET' },
  );

  return response.results;
};
