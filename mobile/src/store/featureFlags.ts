import { create } from 'zustand';

interface FeatureFlagsState {
  pushNotifications: boolean;
  adminTools: boolean;
  setFlag: <K extends keyof FeatureFlagsState>(flag: K, value: FeatureFlagsState[K]) => void;
}

export const useFeatureFlags = create<FeatureFlagsState>((set) => ({
  pushNotifications: true,
  adminTools: true,
  setFlag: (flag, value) => set({ [flag]: value }),
}));
