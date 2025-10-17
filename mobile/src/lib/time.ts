import { format, formatDistanceToNowStrict, isAfter } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

export const toZonedTime = (date: string | Date, timezone?: string | null) => {
  const input = typeof date === 'string' ? new Date(date) : date;
  if (!timezone) {
    return input;
  }
  return utcToZonedTime(input, timezone);
};

export const formatDateTime = (
  date: string | Date,
  options?: { timezone?: string | null; pattern?: string },
) => format(toZonedTime(date, options?.timezone), options?.pattern ?? 'MMM d, yyyy • h:mm a');

export const formatDistance = (date: string | Date) =>
  formatDistanceToNowStrict(typeof date === 'string' ? new Date(date) : date, { addSuffix: true });

export const isInFuture = (date: string | Date) => isAfter(typeof date === 'string' ? new Date(date) : date, new Date());
