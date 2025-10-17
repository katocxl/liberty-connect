import type { Database } from '../../types/database.types';
import { supabase } from '../../lib/supabase';
import type { Devotional } from './types';

type DevotionalRow = Database['public']['Tables']['devotionals']['Row'];

const mapDevotional = (row: DevotionalRow): Devotional => ({
  id: row.id,
  title: row.title,
  scriptureReference: row.scripture_reference,
  body: row.body,
  publishedAt: row.published_at,
});

export const fetchLatestDevotional = async (orgId: string): Promise<Devotional | null> => {
  const { data, error } = await supabase
    .from('devotionals')
    .select('id, title, scripture_reference, body, published_at')
    .eq('org_id', orgId)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle<DevotionalRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapDevotional(data) : null;
};
