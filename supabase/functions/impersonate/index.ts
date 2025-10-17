import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

import {
  createServiceClient,
  createUserClient,
  errorResponse,
  jsonResponse,
  methodNotAllowed,
  requireOrgRole,
  requireUser,
} from '../_shared/mod.ts';

interface ImpersonatePayload {
  org_id?: string;
  target_user_id?: string;
  redirect_to?: string;
}

serve(async (request) => {
  if (request.method !== 'POST') {
    return methodNotAllowed(['POST']);
  }

  const supabase = createUserClient(request);
  const serviceClient = createServiceClient();

  try {
    const payload = (await request.json()) as ImpersonatePayload;
    const { org_id: orgId, target_user_id: targetUserId } = payload ?? {};
    const redirectTo = payload?.redirect_to;

    if (!orgId || !targetUserId) {
      return errorResponse('Missing required fields', 400, {
        required: ['org_id', 'target_user_id'],
      });
    }

    const actor = await requireUser(supabase, request);
    await requireOrgRole(supabase, orgId, actor.id, ['owner', 'moderator']);

    const { data: targetMembership, error: membershipError } = await supabase
      .from('organization_members')
      .select('status')
      .eq('org_id', orgId)
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (membershipError) {
      console.error('organization_members.select', membershipError);
      return errorResponse('Failed to verify target membership', 500);
    }

    if (!targetMembership || targetMembership.status !== 'active') {
      return errorResponse('Target user is not an active member', 400);
    }

    const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
      type: 'magiclink',
      user_id: targetUserId,
      options: {
        redirectTo: redirectTo ?? undefined,
      },
    });

    if (linkError) {
      console.error('generateLink', linkError);
      return errorResponse('Failed to generate impersonation link', 500);
    }

    const actionLink = linkData?.action_link;

    if (!actionLink) {
      return errorResponse('Missing action link from Supabase', 500);
    }

    const { error: logError } = await supabase.from('admin_actions').insert({
      org_id: orgId,
      actor_id: actor.id,
      action: 'impersonate',
      target_type: 'user',
      target_id: targetUserId,
      payload: {
        redirect_to: redirectTo ?? null,
        target_user_id: targetUserId,
        link_suffix: actionLink.slice(-16),
      },
    });

    if (logError) {
      console.error('admin_actions.insert', logError);
      return errorResponse('Failed to log impersonation attempt', 500);
    }

    return jsonResponse({
      status: 'ok',
      action_link: actionLink,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error(error);
    return errorResponse('Unexpected error', 500);
  }
});
