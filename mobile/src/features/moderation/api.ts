import { callEdgeFunction } from '../../lib/apiClient';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import type { ModerationReport } from './types';

type ReportRow = Database['public']['Tables']['reports']['Row'];
type ReportInsert = Database['public']['Tables']['reports']['Insert'];
export type ReportTargetType = ReportInsert['target_type'];

export const fetchReports = async (orgId: string): Promise<ModerationReport[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('id, org_id, target_type, target_id, reason, status, created_at')
    .eq('org_id', orgId)
    .or('status.eq.open,status.eq.in_review')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as ReportRow[] | null)?.map((row) => ({
    id: row.id,
    orgId: row.org_id,
    targetType: row.target_type,
    targetId: row.target_id,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
  })) ?? [];
};

export const actOnReport = async (
  orgId: string,
  reportId: string,
  action: 'resolve' | 'dismiss' | 'reopen',
  options: { hideTarget?: boolean; resolutionNote?: string | null } = {},
) => {
  await callEdgeFunction('report_action', {
    org_id: orgId,
    report_id: reportId,
    action,
    hide_target: options.hideTarget ?? false,
    resolution_note: options.resolutionNote ?? null,
  });
};

export const createReport = async (
  orgId: string,
  reporterId: string,
  targetType: ReportTargetType,
  targetId: string,
  reason: string,
  details?: string,
) => {
  const { error } = await supabase.from('reports').insert({
    org_id: orgId,
    reporter_id: reporterId,
    target_type: targetType,
    target_id: targetId,
    reason,
    details: details ? { note: details } : null,
  });

  if (error) {
    throw new Error(error.message);
  }
};
