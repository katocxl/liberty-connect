import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { formatDateTime, isInFuture } from '../../../lib/time';
import { ListEmpty } from '../../../ui/ListEmpty';
import { useEvents } from '../hooks/useEvents';

const getStatusLabel = (startAt: string, endAt: string | null) => {
  if (isInFuture(startAt)) {
    return 'Upcoming';
  }
  if (endAt && isInFuture(endAt)) {
    return 'In progress';
  }
  return 'Past event';
};

export const EventList = (): JSX.Element => {
  const { data, isLoading, isRefetching, refetch } = useEvents();

  const events = useMemo(() => data ?? [], [data]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlashList
      data={events}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          onPress={() => router.push({ pathname: '/event/[id]', params: { id: item.id } })}
          accessibilityRole="button"
          accessibilityLabel={`Open event ${item.title}`}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.status}>{getStatusLabel(item.startAt, item.endAt)}</Text>
          </View>
          <Text style={styles.meta}>{formatDateTime(item.startAt, { timezone: item.timezone })}</Text>
          {item.location ? <Text style={styles.location}>{item.location}</Text> : null}
        </Pressable>
      )}
      ListEmptyComponent={<ListEmpty message="No upcoming events scheduled." />}
    />
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
  },
  meta: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#1f2937',
  },
});
