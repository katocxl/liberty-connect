const get = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing environment variable ${key}`);
  }
  return value;
};

export const ENV = {
  supabaseUrl: get('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: get('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  defaultOrgId: get('EXPO_PUBLIC_DEFAULT_ORG_ID', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
};
