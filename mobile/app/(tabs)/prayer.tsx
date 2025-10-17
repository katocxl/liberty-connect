import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { ComposePrayerSheet } from '../../src/features/prayer/components/ComposePrayerSheet';
import { PrayerCard } from '../../src/features/prayer/components/PrayerCard';
import { usePrayers } from '../../src/features/prayer/hooks/usePrayers';

export default function Prayer(): JSX.Element {
  const { data, isRefetching, refetch } = usePrayers();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <ComposePrayerSheet />
      </View>
      <FlashList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        renderItem={({ item }) => <PrayerCard prayer={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  list: {
    padding: 16,
  },
});
