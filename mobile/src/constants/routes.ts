import type { Href } from 'expo-router';

export const ROUTES = {
  home: '/',
  events: '/events',
  announcementDetail: '/announcement/[id]',
  eventDetail: '/event/[id]',
  prayer: '/prayer',
  prayerDetail: '/prayer/[id]',
  settings: '/settings',
  adminReports: '/admin/reports',
  adminImpersonate: '/admin/impersonate',
} as const;

type EnsureRoutesAreHref<T extends Href> = T;
type _EnsureRoutesAreHref = EnsureRoutesAreHref<(typeof ROUTES)[keyof typeof ROUTES]>;
