import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeScreen } from '../../src/features/home/components/HomeScreen';

export default function Home(): JSX.Element {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HomeScreen />
    </SafeAreaView>
  );
}
