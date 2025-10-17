import type { User } from 'https://esm.sh/@supabase/supabase-js@2.44.2';

import { errorResponse } from './http.ts';
import type { SupabaseServerClient } from './supabase.ts';

export type MemberRole = 'owner' | 'moderator' | 'member';

export interface OrgMembership {
  org_id: string;
  user_id: string;
  role: MemberRole;
  status: 'active' | 'invited' | 'suspended';
}

export const extractBearerToken = (request: Request): string | null => {
  const header = request.headers.get('Authorization');
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
};

export const requireUser = async (
  supabase: SupabaseServerClient,
  request: Request,
): Promise<User> => {
  const token = extractBearerToken(request);

  if (!token) {
    throw errorResponse('Missing bearer token', 401);
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    throw errorResponse('Unauthorized', 401);
  }

  return data.user;
};

export const requireActiveMembership = async (
  supabase: SupabaseServerClient,
  orgId: string,
  userId: string,
): Promise<OrgMembership> => {
  const { data, error } = await supabase
    .from('organization_members')
    .select('org_id, user_id, role, status')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw errorResponse(`Failed to verify membership: ${error.message}`, 500);
  }

  if (!data || data.status !== 'active') {
    throw errorResponse('Membership required', 403);
  }

  return data as OrgMembership;
};

export const requireOrgRole = async (
  supabase: SupabaseServerClient,
  orgId: string,
  userId: string,
  allowedRoles: MemberRole[],
): Promise<OrgMembership> => {
  const membership = await requireActiveMembership(supabase, orgId, userId);

  if (!allowedRoles.includes(membership.role)) {
    throw errorResponse('Insufficient permissions', 403);
  }

  return membership;
};
