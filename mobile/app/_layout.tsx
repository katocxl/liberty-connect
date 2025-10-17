import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppProviders from '../src/providers/AppProviders';

export default function RootLayout(): JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(modals)/report" options={{ presentation: 'modal', title: 'Report Content' }} />
          <Stack.Screen name="(modals)/admin-announcement" options={{ presentation: 'modal', title: 'Announcement' }} />
          <Stack.Screen name="(modals)/admin-devotional" options={{ presentation: 'modal', title: 'Devotional' }} />
          <Stack.Screen name="(modals)/admin-event" options={{ presentation: 'modal', title: 'Event' }} />
        </Stack>
      </AppProviders>
    </GestureHandlerRootView>
  );
}
