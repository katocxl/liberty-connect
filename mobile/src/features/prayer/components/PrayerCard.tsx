import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDistance } from '../../../lib/time';
import { usePrayerReaction } from '../hooks/usePrayerReaction';
import type { PrayerSummary } from '../types';

interface Props {
  prayer: PrayerSummary;
}

const EMOJI = '🙏';

export const PrayerCard = memo(({ prayer }: Props) => {
  const { mutate } = usePrayerReaction(prayer.id);

  return (
    <View style={styles.card}>
      <Text style={styles.body}>{prayer.body}</Text>
      <View style={styles.footer}>
        <Text style={styles.meta}>{formatDistance(prayer.createdAt)}</Text>
        <Pressable
          style={({ pressed }) => [styles.reactionButton, pressed && styles.pressed]}
          onPress={() => mutate(EMOJI)}
          accessibilityRole="button"
          accessibilityLabel="Send prayer reaction"
        >
          <Text style={styles.reactionText}>
            {EMOJI} {prayer.reactionCount}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

PrayerCard.displayName = 'PrayerCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  body: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 22,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    fontSize: 12,
    color: '#6b7280',
  },
  reactionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
  },
  pressed: {
    opacity: 0.6,
  },
  reactionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});
