import type { Database } from '../../types/database.types';
import { supabase } from '../../lib/supabase';
import type { PrayerDetail, PrayerReaction, PrayerSummary } from './types';

type ReactionRow = Database['public']['Tables']['prayer_reactions']['Row'];

type PrayerRow = Database['public']['Tables']['prayers']['Row'] & {
  prayer_reactions: ReactionRow[];
};

const mapPrayerSummary = (row: PrayerRow): PrayerSummary => ({
  id: row.id,
  body: row.body,
  authorId: row.author_id,
  isAnonymous: row.is_anonymous,
  hiddenAt: row.hidden_at,
  createdAt: row.created_at,
  reactionCount: row.prayer_reactions?.length ?? 0,
});

const mapPrayerDetail = (row: PrayerRow): PrayerDetail => ({
  ...mapPrayerSummary(row),
  reactions: row.prayer_reactions.map((reaction) => ({
    emoji: reaction.emoji,
    userId: reaction.user_id,
  })),
});

export const fetchPrayers = async (orgId: string): Promise<PrayerSummary[]> => {
  const { data, error } = await supabase
    .from('prayers')
    .select('id, body, author_id, is_anonymous, hidden_at, created_at, prayer_reactions(emoji, user_id)')
    .eq('org_id', orgId)
    .is('hidden_at', null)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return (data as PrayerRow[] | null)?.map(mapPrayerSummary) ?? [];
};

export const fetchPrayer = async (id: string): Promise<PrayerDetail> => {
  const { data, error } = await supabase
    .from('prayers')
    .select('id, body, author_id, is_anonymous, hidden_at, created_at, prayer_reactions(emoji, user_id)')
    .eq('id', id)
    .maybeSingle<PrayerRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Prayer not found');
  }

  return mapPrayerDetail(data);
};

export const createPrayer = async (
  orgId: string,
  userId: string | null,
  body: string,
  isAnonymous: boolean,
) => {
  const { error } = await supabase.from('prayers').insert({
    org_id: orgId,
    author_id: isAnonymous ? null : userId,
    body,
    is_anonymous: isAnonymous,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const togglePrayerReaction = async (
  prayerId: string,
  userId: string,
  emoji: string,
): Promise<PrayerReaction[]> => {
  const { data } = await supabase
    .from('prayer_reactions')
    .select('emoji')
    .eq('prayer_id', prayerId)
    .eq('user_id', userId)
    .maybeSingle();

  if (data?.emoji === emoji) {
    const { error: deleteError } = await supabase
      .from('prayer_reactions')
      .delete()
      .eq('prayer_id', prayerId)
      .eq('user_id', userId)
      .eq('emoji', emoji);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  } else {
    const { error: clearError } = await supabase
      .from('prayer_reactions')
      .delete()
      .eq('prayer_id', prayerId)
      .eq('user_id', userId);

    if (clearError) {
      throw new Error(clearError.message);
    }

    const { error: insertError } = await supabase
      .from('prayer_reactions')
      .insert({ prayer_id: prayerId, user_id: userId, emoji });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  const { data: reactions, error: reactionsError } = await supabase
    .from('prayer_reactions')
    .select('emoji, user_id')
    .eq('prayer_id', prayerId);

  if (reactionsError) {
    throw new Error(reactionsError.message);
  }

  return (reactions ?? []).map((reaction: ReactionRow) => ({
    emoji: reaction.emoji,
    userId: reaction.user_id,
  }));
};
