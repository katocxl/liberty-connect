import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useNotificationPrefs } from '../../src/features/preferences/hooks/useNotificationPrefs';
import { useRegisterPush } from '../../src/features/notifications/registerPush';
import { Button } from '../../src/ui/Button';
import { useAuthStore } from '../../src/store';

export default function Settings(): JSX.Element {
  const { data, isLoading, update } = useNotificationPrefs();
  const registerPush = useRegisterPush();
  const user = useAuthStore((state) => state.user);

  const preferences = data ?? {
    events: true,
    announcements: true,
    devotionals: true,
    prayer_replies: true,
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Notifications</Text>
        {isLoading ? (
          <Text>Loading preferences…</Text>
        ) : (
          <View>
            {Object.entries(preferences).map(([key, value]) => (
              <View style={styles.row} key={key}>
                <Text style={styles.label}>{key.replace('_', ' ')}</Text>
                <Switch
                  onValueChange={(next) => update({ ...preferences, [key]: next })}
                  value={value}
                  disabled={!user}
                />
              </View>
            ))}
          </View>
        )}
        <Button
          label="Register device"
          onPress={async () => {
            try {
              await registerPush();
              Alert.alert('Registered', 'Push notifications are enabled.');
            } catch (error) {
              Alert.alert('Unable to register', error instanceof Error ? error.message : 'Try again later');
            }
          }}
          variant="secondary"
        />
        {!user ? <Text style={styles.notice}>Sign in to manage notification preferences.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 16,
    color: '#1f2937',
  },
  notice: {
    fontSize: 12,
    color: '#6b7280',
  },
});
