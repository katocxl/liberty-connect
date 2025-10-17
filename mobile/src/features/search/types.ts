export interface SearchResult {
  id: string;
  org_id: string;
  type: 'announcement' | 'prayer';
  title: string;
  snippet: string;
  rank: number;
  publishedAt: string | null;
}
