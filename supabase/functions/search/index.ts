import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

import {
  createUserClient,
  errorResponse,
  jsonResponse,
  methodNotAllowed,
} from '../_shared/mod.ts';

interface SearchResult {
  id: string;
  org_id: string;
  type: 'announcement' | 'prayer';
  title: string;
  snippet: string;
  rank: number;
  published_at: string | null;
}

const sanitizeQuery = (value: string): string =>
  value
    .replace(/['"]/g, ' ')
    .replace(/[&|!:*?\\/~^<>()[\]{}+-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildSnippet = (text: string, query: string, length = 160): string => {
  if (!text) {
    return '';
  }

  const lowerText = text.toLowerCase();
  const token = query.toLowerCase().split(/\s+/)[0] ?? '';

  if (!token) {
    return text.slice(0, length);
  }

  const index = lowerText.indexOf(token);
  if (index === -1) {
    return text.slice(0, length);
  }

  const start = Math.max(0, index - Math.floor(length / 2));
  const end = Math.min(text.length, start + length);

  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
};

serve(async (request) => {
  if (request.method !== 'GET') {
    return methodNotAllowed(['GET']);
  }

  const url = new URL(request.url);
  const rawQuery = url.searchParams.get('q') ?? '';
  const orgId = url.searchParams.get('org_id') ?? '';
  const limitParam = url.searchParams.get('limit');
  const offsetParam = url.searchParams.get('offset');

  const query = sanitizeQuery(rawQuery);
  const limit = Math.min(Math.max(Number(limitParam ?? 20), 1), 50);
  const offset = Math.max(Number(offsetParam ?? 0), 0);

  if (!query || query.length < 2) {
    return errorResponse('Query must contain at least 2 characters', 400);
  }

  if (!orgId) {
    return errorResponse('Missing org_id', 400);
  }

  const supabase = createUserClient(request);

  try {
    const escapedQuery = query.replace(/'/g, "''");
    const tsFilter = `'${escapedQuery}'`;
    const selectFields = `id, org_id, title, body, published_at, rank:ts_rank(search_vector, plainto_tsquery('english', '${escapedQuery}'))`;

    const take = Math.min(limit + offset, 100);

    const [{ data: announcements, error: announcementsError }, { data: prayers, error: prayersError }] =
      await Promise.all([
        supabase
          .from('announcements')
          .select(selectFields)
          .eq('org_id', orgId)
          .is('hidden_at', null)
          .textSearch('search_vector', tsFilter, { type: 'plain', config: 'english' })
          .limit(take),
        supabase
          .from('prayers')
          .select(`id, org_id, body, created_at, rank:ts_rank(search_vector, plainto_tsquery('english', '${escapedQuery}'))`)
          .eq('org_id', orgId)
          .is('hidden_at', null)
          .textSearch('search_vector', tsFilter, { type: 'plain', config: 'english' })
          .limit(take),
      ]);

    if (announcementsError) {
      console.error('announcements.search', announcementsError);
      return errorResponse('Failed to search announcements', 500);
    }

    if (prayersError) {
      console.error('prayers.search', prayersError);
      return errorResponse('Failed to search prayers', 500);
    }

    const combined: SearchResult[] = [
      ...(announcements ?? []).map((item) => ({
        id: item.id,
        org_id: item.org_id,
        type: 'announcement' as const,
        title: item.title,
        snippet: buildSnippet(item.body ?? '', query),
        rank: Number(item.rank ?? 0),
        published_at: item.published_at,
      })),
      ...(prayers ?? []).map((item) => ({
        id: item.id,
        org_id: item.org_id,
        type: 'prayer' as const,
        title: (item.body ?? '').slice(0, 80),
        snippet: buildSnippet(item.body ?? '', query),
        rank: Number(item.rank ?? 0),
        published_at: item.created_at ?? null,
      })),
    ].filter((result) => result.rank > 0);

    combined.sort((a, b) => {
      if (b.rank !== a.rank) {
        return b.rank - a.rank;
      }

      const dateA = a.published_at ? Date.parse(a.published_at) : 0;
      const dateB = b.published_at ? Date.parse(b.published_at) : 0;
      return dateB - dateA;
    });

    const paged = combined.slice(offset, offset + limit);

    return jsonResponse({
      results: paged,
      meta: {
        total: combined.length,
        limit,
        offset,
        returned: paged.length,
      },
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error(error);
    return errorResponse('Unexpected error', 500);
  }
});
