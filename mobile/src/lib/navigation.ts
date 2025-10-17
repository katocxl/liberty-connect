import { router } from 'expo-router';

import { getRouteForLink } from '../constants/links';

export const navigateToDeepLink = (link: string) => {
  const destination = getRouteForLink(link);
  if (!destination) {
    return;
  }

  if (destination.params) {
    router.push({ pathname: destination.route, params: destination.params });
  } else {
    router.push(destination.route);
  }
};

export const openModal = (route: string, params?: Record<string, string>) => {
  router.push({ pathname: route, params });
};

export const goBack = () => router.back();
