import { StyleSheet, Text, View } from 'react-native';

interface Props {
  message?: string;
}

export const ErrorState = ({ message }: Props): JSX.Element => (
  <View style={styles.container}>
    <Text style={styles.text}>{message ?? 'Something went wrong.'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
});
