import { Linking, StyleSheet, Text, View } from 'react-native';

import { formatDateTime } from '../../../lib/time';
import { Button } from '../../../ui/Button';
import { useEvent } from '../hooks/useEvent';
import { RSVPButton } from './RSVPButton';

interface Props {
  eventId: string;
}

export const EventDetails = ({ eventId }: Props): JSX.Element => {
  const { data, isLoading, error } = useEvent(eventId);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading event…</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text>Unable to load event details.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.title}</Text>
      <Text style={styles.datetime}>{formatDateTime(data.startAt, { timezone: data.timezone })}</Text>
      {data.location ? <Text style={styles.location}>{data.location}</Text> : null}
      {data.description ? <Text style={styles.description}>{data.description}</Text> : null}
      {data.locationUrl ? (
        <Button
          label="View location"
          variant="secondary"
          onPress={() => Linking.openURL(data.locationUrl!)}
          style={styles.spacing}
        />
      ) : null}
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Capacity</Text>
        <Text style={styles.metaValue}>{data.capacity ?? 'Unlimited'}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Attending</Text>
        <Text style={styles.metaValue}>{data.attendeeCount}</Text>
      </View>
      <RSVPButton event={data} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  datetime: {
    fontSize: 16,
    color: '#2563eb',
    marginBottom: 12,
  },
  location: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  metaValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  spacing: {
    marginBottom: 16,
  },
});
