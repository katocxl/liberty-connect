import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spinner } from '../../src/ui/Spinner';
import { useAnnouncement } from '../../src/features/announcements/hooks/useAnnouncements';
import { formatDateTime } from '../../src/lib/time';

export default function AnnouncementDetail(): JSX.Element {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? '';
  const { data, isLoading, error } = useAnnouncement(String(id));

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {isLoading ? (
        <Spinner />
      ) : error || !data ? (
        <View style={styles.error}> 
          <Text style={styles.errorText}>Unable to load announcement.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.meta}>{formatDateTime(data.publishedAt)}</Text>
          <Text style={styles.body}>{data.body}</Text>
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
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  meta: {
    fontSize: 14,
    color: '#6b7280',
  },
  body: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
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
