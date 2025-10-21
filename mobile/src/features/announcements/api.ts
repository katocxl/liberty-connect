import type { Database } from '../../types/database.types';
import { supabase } from '../../lib/supabase';
import type { AnnouncementDetail, AnnouncementSummary } from './types';

type AnnouncementRow = Database['public']['Tables']['announcements']['Row'];
type AnnouncementSelect = Pick<
  AnnouncementRow,
  'id' | 'title' | 'body' | 'hero_image_path' | 'pinned' | 'published_at' | 'expires_at'
>;

const ANNOUNCEMENT_COLUMNS = 'id, title, body, hero_image_path, pinned, published_at, expires_at';

const mapAnnouncement = (row: AnnouncementSelect): AnnouncementSummary => ({
  id: row.id,
  title: row.title,
  body: row.body,
  heroImagePath: row.hero_image_path,
  pinned: row.pinned,
  publishedAt: row.published_at,
  expiresAt: row.expires_at,
});

export const fetchAnnouncements = async (orgId: string): Promise<AnnouncementSummary[]> => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('announcements')
    .select(ANNOUNCEMENT_COLUMNS)
    .eq('org_id', orgId)
    .lte('published_at', now)
    .or('expires_at.is.null,expires_at.gt.' + now)
    .order('pinned', { ascending: false })
    .order('published_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as AnnouncementSelect[];
  return rows.map(mapAnnouncement);
};

export const fetchAnnouncement = async (id: string): Promise<AnnouncementDetail> => {
  const { data, error } = await supabase
    .from('announcements')
    .select(ANNOUNCEMENT_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Announcement not found');
  }

  return {
    ...mapAnnouncement(data as AnnouncementSelect),
    authorName: null,
  };
};
