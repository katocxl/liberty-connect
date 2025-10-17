import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

import {
  createUserClient,
  errorResponse,
  jsonResponse,
  methodNotAllowed,
  requireOrgRole,
  requireUser,
} from '../_shared/mod.ts';

type ReportActionType = 'resolve' | 'dismiss' | 'reopen';

interface ReportActionPayload {
  org_id?: string;
  report_id?: string;
  action?: ReportActionType;
  hide_target?: boolean;
  resolution_note?: string | null;
}

const hideableTargets: Record<string, { table: string; column: string }> = {
  prayer: { table: 'prayers', column: 'hidden_at' },
  announcement: { table: 'announcements', column: 'hidden_at' },
};

const resolveAction = (action: ReportActionType, userId: string) => {
  const now = new Date().toISOString();

  switch (action) {
    case 'resolve':
      return {
        status: 'resolved' as const,
        resolved_at: now,
        resolved_by: userId,
      };
    case 'dismiss':
      return {
        status: 'dismissed' as const,
        resolved_at: now,
        resolved_by: userId,
      };
    case 'reopen':
      return {
        status: 'open' as const,
        resolved_at: null,
        resolved_by: null,
      };
    default:
      throw errorResponse('Unsupported action', 400);
  }
};

serve(async (request) => {
  if (request.method !== 'POST') {
    return methodNotAllowed(['POST']);
  }

  const supabase = createUserClient(request);

  try {
    const payload = (await request.json()) as ReportActionPayload;
    const { org_id: orgId, report_id: reportId, action, hide_target: hideTarget } = payload ?? {};

    if (!orgId || !reportId || !action) {
      return errorResponse('Missing required fields', 400, {
        required: ['org_id', 'report_id', 'action'],
      });
    }

    if (!['resolve', 'dismiss', 'reopen'].includes(action)) {
      return errorResponse('Invalid action', 400);
    }

    const user = await requireUser(supabase, request);
    await requireOrgRole(supabase, orgId, user.id, ['owner', 'moderator']);

    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id, org_id, target_type, target_id, status')
      .eq('id', reportId)
      .eq('org_id', orgId)
      .maybeSingle();

    if (reportError) {
      console.error('reports.select', reportError);
      return errorResponse('Failed to load report', 500);
    }

    if (!report) {
      return errorResponse('Report not found', 404);
    }

    const update = resolveAction(action as ReportActionType, user.id);
    const resolutionNote = action === 'reopen' ? null : payload.resolution_note ?? null;

    let nextHiddenAt = report.hidden_at;
    if (hideTarget === true) {
      nextHiddenAt = update.resolved_at ?? new Date().toISOString();
    } else if (hideTarget === false) {
      nextHiddenAt = null;
    }

    const { data: updatedReport, error: updateError } = await supabase
      .from('reports')
      .update({
        status: update.status,
        resolved_at: update.resolved_at,
        resolved_by: update.resolved_by,
        resolution_note: resolutionNote,
        hidden_at: nextHiddenAt,
      })
      .eq('id', reportId)
      .select('id, status, resolved_at, resolved_by, resolution_note, hidden_at, target_type, target_id')
      .single();

    if (updateError) {
      console.error('reports.update', updateError);
      return errorResponse('Failed to update report', 500);
    }

    const hideTargetConfig = hideableTargets[report.target_type];
    if (hideTargetConfig && hideTarget !== undefined) {
      const { table, column } = hideTargetConfig;
      const { error: targetError } = await supabase
        .from(table)
        .update({ [column]: nextHiddenAt })
        .eq('id', report.target_id);

      if (targetError) {
        console.error('target.update', targetError, {
          table,
          targetId: report.target_id,
        });
        return errorResponse('Failed to update target visibility', 500);
      }
    }

    const { error: logError } = await supabase.from('admin_actions').insert({
      org_id: orgId,
      actor_id: user.id,
      action: `report_${action}`,
      target_type: report.target_type,
      target_id: report.target_id,
      payload: {
        report_id: reportId,
        previous_status: report.status,
        status: update.status,
        hide_target: hideTarget ?? false,
        resolution_note: resolutionNote,
      },
    });

    if (logError) {
      console.error('admin_actions.insert', logError);
      return errorResponse('Failed to log admin action', 500);
    }

    return jsonResponse({
      status: 'ok',
      report: updatedReport,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error(error);
    return errorResponse('Unexpected error', 500);
  }
});
