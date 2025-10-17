import AsyncStorage from '@react-native-async-storage/async-storage';

const prefix = '@libertyconnect:';

export const storage = {
  get: async <T>(key: string, fallback: T | null = null): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(`${prefix}${key}`);
      if (value === null) {
        return fallback;
      }
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  },
  set: async <T>(key: string, value: T): Promise<void> => {
    await AsyncStorage.setItem(`${prefix}${key}`, JSON.stringify(value));
  },
  remove: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(`${prefix}${key}`);
  },
};
