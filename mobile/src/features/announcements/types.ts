export interface AnnouncementSummary {
  id: string;
  title: string;
  body: string;
  heroImagePath: string | null;
  pinned: boolean;
  publishedAt: string;
  expiresAt: string | null;
}

export interface AnnouncementDetail extends AnnouncementSummary {
  authorName: string | null;
}
