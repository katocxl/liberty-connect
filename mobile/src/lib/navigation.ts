import { router } from "expo-router";

import { ROUTES } from "../constants/routes";
import { getRouteForLink, type RouteMatch } from "../constants/links";

type RouterPushArgument = Parameters<typeof router.push>[0];

const push = (argument: RouterPushArgument) => {
  router.push(argument);
};

export const navigateToDeepLink = (link: string) => {
  const destination = getRouteForLink(link);
  if (!destination) {
    return;
  }

  switch (destination.route) {
    case ROUTES.announcementDetail:
    case ROUTES.eventDetail:
    case ROUTES.prayerDetail:
      push({ pathname: destination.route, params: destination.params });
      break;
    case ROUTES.home:
      push(ROUTES.home);
      break;
    case ROUTES.events:
      push(ROUTES.events);
      break;
    case ROUTES.prayer:
      push(ROUTES.prayer);
      break;
    case ROUTES.settings:
      push(ROUTES.settings);
      break;
    case ROUTES.adminReports:
      push(ROUTES.adminReports);
      break;
    case ROUTES.adminImpersonate:
      push(ROUTES.adminImpersonate);
      break;
  }
};

export const openModal = (route: RouteMatch["route"], params?: Record<string, string>) => {
  if (params) {
    push({ pathname: route, params } as RouterPushArgument);
    return;
  }

  push(route);
};

export const goBack = () => router.back();
