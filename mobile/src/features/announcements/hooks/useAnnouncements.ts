import { useQuery } from '@tanstack/react-query';

import { TOKENS } from '../../../constants/tokens';
import { TTL } from '../../../constants/ttl';
import { useAuthStore } from '../../../store';
import { fetchAnnouncement, fetchAnnouncements } from '../api';

export const useAnnouncements = () => {
  const orgId = useAuthStore((state) => state.orgId);
  return useQuery({
    queryKey: [...TOKENS.announcements, orgId],
    queryFn: () => fetchAnnouncements(orgId),
    staleTime: TTL.announcements,
  });
};

export const useAnnouncement = (id: string) =>
  useQuery({
    queryKey: TOKENS.announcement(id),
    queryFn: () => fetchAnnouncement(id),
    enabled: Boolean(id),
    staleTime: TTL.announcements,
  });
