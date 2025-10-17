import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.44.2';

import type { Database } from '../../mobile/src/types/database.types.ts';

type ClientHeaders = Record<string, string>;

const requiredEnv = (key: string): string => {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Missing required environment variable "${key}"`);
  }
  return value;
};

const buildHeaders = (request?: Request, override?: ClientHeaders): ClientHeaders | undefined => {
  const headers: ClientHeaders = { ...(override ?? {}) };

  if (request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers.Authorization = authHeader;
    }
  }

  return Object.keys(headers).length > 0 ? headers : undefined;
};

const baseClient = (
  apiKey: string,
  headers?: ClientHeaders,
): SupabaseClient<Database> =>
  createClient<Database>(requiredEnv('SUPABASE_URL'), apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers,
    },
  });

export const createUserClient = (request: Request): SupabaseClient<Database> => {
  const headers = buildHeaders(request);
  return baseClient(requiredEnv('SUPABASE_ANON_KEY'), headers);
};

export const createServiceClient = (
  request?: Request,
  headers?: ClientHeaders,
): SupabaseClient<Database> => {
  const mergedHeaders = buildHeaders(request, headers);
  return baseClient(requiredEnv('SERVICE_ROLE_KEY'), mergedHeaders);
};

export type SupabaseServerClient = SupabaseClient<Database>;
