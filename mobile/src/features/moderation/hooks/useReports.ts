import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { TOKENS } from '../../../constants/tokens';
import { useAuthStore } from '../../../store';
import { actOnReport, fetchReports } from '../api';

export const useReports = () => {
  const orgId = useAuthStore((state) => state.orgId);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: TOKENS.reports(orgId),
    queryFn: () => fetchReports(orgId),
  });

  const mutation = useMutation({
    mutationFn: ({
      reportId,
      action,
      hideTarget,
      resolutionNote,
    }: {
      reportId: string;
      action: 'resolve' | 'dismiss' | 'reopen';
      hideTarget?: boolean;
      resolutionNote?: string | null;
    }) => actOnReport(orgId, reportId, action, { hideTarget, resolutionNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOKENS.reports(orgId) });
    },
  });

  return {
    ...query,
    act: mutation.mutate,
    acting: mutation.isPending,
  };
};
