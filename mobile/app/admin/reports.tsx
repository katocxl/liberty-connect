import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/ui/Button';
import { Spinner } from '../../src/ui/Spinner';
import { useReports } from '../../src/features/moderation/hooks/useReports';
import { useAuthStore } from '../../src/store';

export default function Reports(): JSX.Element {
  const role = useAuthStore((state) => state.role);
  const { data, isLoading, act, acting } = useReports();

  if (role !== 'owner' && role !== 'moderator') {
    return (
      <SafeAreaView style={styles.center}>
        <Text>You need moderator access to view reports.</Text>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <Spinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.reason}>{item.reason}</Text>
            <Text style={styles.meta}>Target: {item.targetType}</Text>
            <View style={styles.actions}>
              <Button
                label="Resolve"
                compact
                onPress={() => act({ reportId: item.id, action: 'resolve', hideTarget: true })}
                disabled={acting}
              />
              <Button
                label="Dismiss"
                variant="secondary"
                compact
                onPress={() => act({ reportId: item.id, action: 'dismiss' })}
                disabled={acting}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No open reports 🎉</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  reason: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 24,
  },
});
