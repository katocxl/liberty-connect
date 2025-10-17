import * as Linking from 'expo-linking';

import { navigateToDeepLink } from '../../lib/navigation';

export const initializeDeepLinking = () => {
  Linking.getInitialURL().then((url) => {
    if (url) {
      navigateToDeepLink(url);
    }
  });

  const subscription = Linking.addEventListener('url', ({ url }) => {
    if (url) {
      navigateToDeepLink(url);
    }
  });

  return () => subscription.remove();
};
