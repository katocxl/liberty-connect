import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Devotional } from '../types';
import { formatDateTime } from '../../../lib/time';

interface Props {
  devotional: Devotional;
}

export const DevotionalCard = memo(({ devotional }: Props) => (
  <View style={styles.card} accessibilityRole="summary">
    <Text style={styles.title}>{devotional.title}</Text>
    {devotional.scriptureReference ? (
      <Text style={styles.reference}>{devotional.scriptureReference}</Text>
    ) : null}
    <Text style={styles.body}>{devotional.body}</Text>
    <Text style={styles.meta}>{formatDateTime(devotional.publishedAt)}</Text>
  </View>
));

DevotionalCard.displayName = 'DevotionalCard';

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  reference: {
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    marginBottom: 16,
  },
  meta: {
    fontSize: 12,
    color: '#6b7280',
  },
});
