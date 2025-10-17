import { z } from 'zod';

export const reportSchema = z.object({
  targetId: z.string().uuid(),
  targetType: z.enum(['prayer', 'announcement', 'devotional', 'event', 'user']),
  reason: z.string().min(3).max(200),
  details: z.string().max(500).optional(),
});

export const prayerSchema = z.object({
  body: z.string().min(3).max(500),
  isAnonymous: z.boolean().default(false),
});

export const rsvpSchema = z.object({
  status: z.enum(['yes', 'no', 'maybe']),
});

export const notificationPrefsSchema = z.object({
  events: z.boolean(),
  announcements: z.boolean(),
  devotionals: z.boolean(),
  prayer_replies: z.boolean(),
});
