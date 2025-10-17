import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../ui/Button';
import { useAuthStore } from '../../../store';
import { useRSVP } from '../hooks/useRSVP';
import type { EventDetail, RsvpStatus } from '../types';

interface Props {
  event: EventDetail;
}

const STATUSES: RsvpStatus[] = ['yes', 'maybe', 'no'];

const STATUS_LABEL: Record<RsvpStatus, string> = {
  yes: 'Going',
  maybe: 'Maybe',
  no: 'Not going',
};

export const RSVPButton = ({ event }: Props): JSX.Element => {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const { mutate, isPending, error } = useRSVP(event.id);

  if (!userId) {
    return (
      <Text style={styles.signInHint}>Sign in to RSVP for events.</Text>
    );
  }

  return (
    <View>
      <Text style={styles.label}>RSVP</Text>
      <View style={styles.row}>
        {STATUSES.map((status) => (
          <Button
            key={status}
            label={STATUS_LABEL[status]}
            variant={event.userRsvp === status ? 'primary' : 'secondary'}
            compact
            onPress={() => mutate(status)}
            disabled={isPending}
            style={styles.button}
          />
        ))}
      </View>
      {error ? <Text style={styles.error}>Failed to update RSVP. Try again.</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  signInHint: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  button: {
    flex: 1,
    marginRight: 8,
  },
  error: {
    fontSize: 12,
    color: '#dc2626',
  },
});
