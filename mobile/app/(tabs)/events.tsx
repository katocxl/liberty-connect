import { SafeAreaView } from 'react-native-safe-area-context';

import { EventList } from '../../src/features/events/components/EventList';

export default function Events(): JSX.Element {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <EventList />
    </SafeAreaView>
  );
}
