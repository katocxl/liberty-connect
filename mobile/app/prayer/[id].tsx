import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReportButton } from '../../src/features/moderation/components/ReportButton';
import { usePrayer } from '../../src/features/prayer/hooks/usePrayer';
import { usePrayerReaction } from '../../src/features/prayer/hooks/usePrayerReaction';
import { Spinner } from '../../src/ui/Spinner';

export default function PrayerDetail(): JSX.Element {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? '';
  const { data, isLoading, error } = usePrayer(String(id));
  const { mutate } = usePrayerReaction(String(id));

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {isLoading ? (
        <Spinner />
      ) : error || !data ? (
        <View style={styles.error}>
          <Text style={styles.errorText}>Unable to load prayer.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.body}>{data.body}</Text>
          <View style={styles.row}>
            <Text style={styles.reactions}>🙏 {data.reactions.length}</Text>
            <Text style={styles.reactLink} onPress={() => mutate('🙏')}>
              Send prayer
            </Text>
          </View>
          <ReportButton targetId={data.id} targetType="prayer" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  body: {
    fontSize: 18,
    color: '#111827',
    lineHeight: 26,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reactions: {
    fontSize: 16,
    color: '#1f2937',
  },
  reactLink: {
    color: '#2563eb',
    fontWeight: '600',
  },
  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#dc2626',
  },
});
