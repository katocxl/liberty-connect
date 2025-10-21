import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { ENV } from '../constants/env';
import { supabase } from '../lib/supabase';

export type OrgRole = 'owner' | 'moderator' | 'member';

interface AuthState {
  session: Session | null;
  user: User | null;
  orgId: string;
  role: OrgRole | null;
  isReady: boolean;
  setSession: (session: Session | null) => void;
  setOrgContext: (orgId: string, role: OrgRole | null) => void;
  setReady: (isReady: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  orgId: ENV.defaultOrgId,
  role: null,
  isReady: false,
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),
  setOrgContext: (orgId, role) =>
    set({
      orgId,
      role,
    }),
  setReady: (isReady) => set({ isReady }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({
      session: null,
      user: null,
      role: null,
      orgId: ENV.defaultOrgId,
    });
  },
}));

export const loadOrgContext = async (userId: string | null) => {
  if (!userId) {
    useAuthStore.getState().setOrgContext(ENV.defaultOrgId, null);
    return;
  }

  const { data, error } = await supabase
    .from('organization_members')
    .select('org_id, role')
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('Failed to load org context', error);
    useAuthStore.getState().setOrgContext(ENV.defaultOrgId, null);
    return;
  }

  if (!data) {
    useAuthStore.getState().setOrgContext(ENV.defaultOrgId, null);
    return;
  }

  useAuthStore.getState().setOrgContext(data.org_id, data.role as OrgRole);
};

export const hydrateAuth = () => {
  supabase.auth.getSession().then(async (response) => {
    const { data } = response;
    useAuthStore.getState().setSession(data.session ?? null);
    await loadOrgContext(data.session?.user.id ?? null);
    useAuthStore.getState().setReady(true);
  });

  const { data: subscription } = supabase.auth.onAuthStateChange(
    async (_event: AuthChangeEvent, session: Session | null) => {
      useAuthStore.getState().setSession(session);
      await loadOrgContext(session?.user?.id ?? null);
    },
  );

  return () => subscription.subscription.unsubscribe();
};
