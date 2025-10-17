import { StyleSheet, Text, View } from 'react-native';

interface Props {
  message: string;
}

export const ListEmpty = ({ message }: Props): JSX.Element => (
  <View style={styles.container}>
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
