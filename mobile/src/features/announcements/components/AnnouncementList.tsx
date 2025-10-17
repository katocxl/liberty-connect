import { FlashList } from '@shopify/flash-list';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { useAnnouncements } from '../hooks/useAnnouncements';
import { AnnouncementCard } from './AnnouncementCard';
import { ListEmpty } from '../../../ui/ListEmpty';

export const AnnouncementList = (): JSX.Element => {
  const { data, isLoading, isRefetching, refetch } = useAnnouncements();

  const content = useMemo(() => data ?? [], [data]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlashList
      data={content}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <AnnouncementCard announcement={item} />}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      ListEmptyComponent={<ListEmpty message="No announcements yet. Check back soon." />}
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
});
