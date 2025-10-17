import { router } from 'expo-router';
import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AnnouncementSummary } from '../types';

interface Props {
  announcement: AnnouncementSummary;
}

const getPreview = (body: string, length = 140) =>
  body.length <= length ? body : `${body.slice(0, length)}…`;

export const AnnouncementCard = memo(({ announcement }: Props) => {
  const preview = useMemo(() => getPreview(announcement.body), [announcement.body]);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`View announcement ${announcement.title}`}
      onPress={() => router.push({ pathname: '/announcement/[id]', params: { id: announcement.id } })}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{announcement.title}</Text>
        {announcement.pinned ? <Text style={styles.pill}>Pinned</Text> : null}
      </View>
      <Text style={styles.preview}>{preview}</Text>
    </Pressable>
  );
});

AnnouncementCard.displayName = 'AnnouncementCard';

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  pill: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0ea5e9',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  preview: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});
