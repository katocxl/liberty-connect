import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { callEdgeFunction } from './apiClient';
import { ENV } from '../constants/env';
import { supabase } from './supabase';

export interface RegisterPushOptions {
  orgId: string;
  platform?: 'ios' | 'android' | 'web';
}

export const configureNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const settings = await Notifications.getPermissionsAsync();

  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
};

const getExpoPushToken = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    return null;
  }

  const { data } = await Notifications.getExpoPushTokenAsync();
  return data ?? null;
};

export const registerDeviceToken = async ({ orgId, platform }: RegisterPushOptions) => {
  const permissionGranted = await requestNotificationPermissions();
  if (!permissionGranted) {
    throw new Error('Notification permission not granted');
  }

  const token = await getExpoPushToken();
  if (!token) {
    throw new Error('Unable to obtain Expo push token');
  }

  const targetPlatform: RegisterPushOptions['platform'] =
    platform ??
    (Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web');

  await callEdgeFunction('save_device_token', {
    org_id: orgId ?? ENV.defaultOrgId,
    token,
    platform: targetPlatform,
  });

  return token;
};

export const clearAllNotifications = () => Notifications.dismissAllNotificationsAsync();
