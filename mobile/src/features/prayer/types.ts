export interface PrayerSummary {
  id: string;
  body: string;
  authorId: string | null;
  isAnonymous: boolean;
  createdAt: string;
  hiddenAt: string | null;
  reactionCount: number;
}

export interface PrayerDetail extends PrayerSummary {
  reactions: PrayerReaction[];
}

export interface PrayerReaction {
  emoji: string;
  userId: string;
}
