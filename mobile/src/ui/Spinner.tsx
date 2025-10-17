import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface Props {
  size?: 'small' | 'large';
}

export const Spinner = ({ size = 'large' }: Props): JSX.Element => (
  <View style={styles.container}>
    <ActivityIndicator size={size} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
