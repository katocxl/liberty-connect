import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import type { PersistQueryClientProviderProps } from '@tanstack/react-query-persist-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 60,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export const persistOptions: PersistQueryClientProviderProps['persistOptions'] = {
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24,
};
