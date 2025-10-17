import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventDetails } from '../../src/features/events/components/EventDetails';

export default function EventDetail(): JSX.Element {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? '';

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <EventDetails eventId={String(id)} />
    </SafeAreaView>
  );
}
