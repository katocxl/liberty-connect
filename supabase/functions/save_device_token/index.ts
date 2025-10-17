import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

import {
  createUserClient,
  errorResponse,
  jsonResponse,
  methodNotAllowed,
  requireActiveMembership,
  requireUser,
} from '../_shared/mod.ts';

interface SaveDeviceTokenPayload {
  org_id?: string;
  token?: string;
  platform?: 'ios' | 'android' | 'web';
  last_seen_at?: string;
}

serve(async (request) => {
  if (request.method !== 'POST') {
    return methodNotAllowed(['POST']);
  }

  const supabase = createUserClient(request);

  try {
    const payload = (await request.json()) as SaveDeviceTokenPayload;
    const { org_id: orgId, token, platform } = payload ?? {};

    if (!orgId || !token || !platform) {
      return errorResponse('Missing required fields', 400, {
        required: ['org_id', 'token', 'platform'],
      });
    }

    if (!['ios', 'android', 'web'].includes(platform)) {
      return errorResponse('Invalid platform', 400);
    }

    const user = await requireUser(supabase, request);
    await requireActiveMembership(supabase, orgId, user.id);

    const { error } = await supabase
      .from('device_tokens')
      .upsert(
        {
          org_id: orgId,
          user_id: user.id,
          token,
          platform,
          last_seen_at: payload.last_seen_at ?? new Date().toISOString(),
          disabled_at: null,
        },
        { onConflict: 'token' },
      )
      .select('id')
      .single();

    if (error) {
      console.error('device_tokens.upsert', error);
      return errorResponse('Failed to save device token', 500);
    }

    return jsonResponse({
      status: 'ok',
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error(error);
    return errorResponse('Unexpected error', 500);
  }
});
