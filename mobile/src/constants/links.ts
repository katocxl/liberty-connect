import { ROUTES } from './routes';

export type RouteMatch =
  | { route: typeof ROUTES.home }
  | { route: typeof ROUTES.events }
  | { route: typeof ROUTES.prayer }
  | { route: typeof ROUTES.settings }
  | { route: typeof ROUTES.adminReports }
  | { route: typeof ROUTES.adminImpersonate }
  | { route: typeof ROUTES.announcementDetail; params: { id: string } }
  | { route: typeof ROUTES.eventDetail; params: { id: string } }
  | { route: typeof ROUTES.prayerDetail; params: { id: string } };

const HOST_SCHEME = 'myapp://';

const withScheme = (path: string) => `${HOST_SCHEME}${path.replace(/^\//, '')}`;

export const LINKS = {
  home: () => withScheme(''),
  announcement: (id: string) => withScheme(`announcement/${id}`),
  event: (id: string) => withScheme(`event/${id}`),
  prayer: (id: string) => withScheme(`prayer/${id}`),
  settings: () => withScheme('settings'),
  adminReports: () => withScheme('admin/reports'),
  adminImpersonate: () => withScheme('admin/impersonate'),
};

export const getRouteForLink = (url: string): RouteMatch | null => {
  const cleaned = url.replace(HOST_SCHEME, '').replace(/^\/+/, '');

  if (!cleaned) {
    return { route: ROUTES.home };
  }

  const [first, second] = cleaned.split('/');

  switch (first) {
    case 'announcement':
      return second ? { route: ROUTES.announcementDetail, params: { id: second } } : null;
    case 'event':
      return second ? { route: ROUTES.eventDetail, params: { id: second } } : null;
    case 'prayer':
      return second ? { route: ROUTES.prayerDetail, params: { id: second } } : null;
    case 'settings':
      return { route: ROUTES.settings };
    case 'admin':
      if (second === 'reports') {
        return { route: ROUTES.adminReports };
      }
      if (second === 'impersonate') {
        return { route: ROUTES.adminImpersonate };
      }
      return null;
    default:
      return null;
  }
};
