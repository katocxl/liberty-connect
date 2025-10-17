import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as Notifications from 'expo-notifications';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { initializeDeepLinking } from '../features/notifications/deeplinks';
import { handleNotificationTap } from '../features/notifications/handleNotificationTap';
import { configureNotificationHandler } from '../lib/notifications';
import { persistOptions, queryClient } from '../lib/queryClient';
import { hydrateAuth } from '../store/auth';

export const AppProviders = ({ children }: PropsWithChildren): JSX.Element => {
  useEffect(() => {
    configureNotificationHandler();
    const unsubscribeAuth = hydrateAuth();
    const removeDeepLinks = initializeDeepLinking();
    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationTap);

    return () => {
      removeDeepLinks?.();
      subscription.remove();
      unsubscribeAuth?.();
    };
  }, []);

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      {children}
    </PersistQueryClientProvider>
  );
};

export default AppProviders;
