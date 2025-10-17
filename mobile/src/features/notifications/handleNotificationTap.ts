import type { NotificationResponse } from 'expo-notifications';

import { navigateToDeepLink } from '../../lib/navigation';

export const handleNotificationTap = (response: NotificationResponse) => {
  const url = response.notification.request.content.data?.url as string | undefined;
  if (url) {
    navigateToDeepLink(url);
  }
};
