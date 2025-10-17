import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '../../../store';
import { fetchAnnouncements } from '../../announcements/api';
import { fetchLatestDevotional } from '../../devotional/api';
import { fetchEvents } from '../../events/api';

export const useHomeSnapshot = () => {
  const orgId = useAuthStore((state) => state.orgId);

  return useQuery({
    queryKey: ['home', orgId],
    queryFn: async () => {
      const [announcements, events, devotional] = await Promise.all([
        fetchAnnouncements(orgId),
        fetchEvents(orgId),
        fetchLatestDevotional(orgId),
      ]);

      return {
        announcements: announcements.slice(0, 3),
        events: events.slice(0, 3),
        devotional,
      };
    },
  });
};
