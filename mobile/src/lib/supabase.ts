import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient, type SupabaseClientOptions } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import type { Database } from '../types/database.types';

const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable ${key}`);
  }
  return value;
};

const SUPABASE_URL = requiredEnv('EXPO_PUBLIC_SUPABASE_URL');
const SUPABASE_ANON_KEY = requiredEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');

let client: SupabaseClient<Database> | null = null;

const authStorage = AsyncStorage as unknown as SupabaseClientOptions<Database>['auth']['storage'];

const createSupabaseClient = () =>
  createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storage: authStorage,
    },
  });

export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!client) {
    client = createSupabaseClient();
  }
  return client;
};

export const supabase = getSupabaseClient();
