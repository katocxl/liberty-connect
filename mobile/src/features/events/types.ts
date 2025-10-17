export type RsvpStatus = 'yes' | 'no' | 'maybe';

export interface EventSummary {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  locationUrl: string | null;
  startAt: string;
  endAt: string | null;
  coverImagePath: string | null;
  timezone: string | null;
}

export interface EventDetail extends EventSummary {
  createdBy: string;
  capacity: number | null;
  orgId: string;
  attendeeCount: number;
  userRsvp: RsvpStatus | null;
}
