import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface Props {
  targetId: string;
  targetType: 'prayer' | 'announcement' | 'devotional' | 'event' | 'user';
}

export const ReportButton = ({ targetId, targetType }: Props): JSX.Element => (
  <TouchableOpacity
    style={styles.button}
    onPress={() => router.push({ pathname: '/(modals)/report', params: { targetId, targetType } })}
    accessibilityRole="button"
    accessibilityLabel="Report content"
  >
    <Text style={styles.text}>Report</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  text: {
    color: '#ef4444',
    fontWeight: '600',
  },
});
