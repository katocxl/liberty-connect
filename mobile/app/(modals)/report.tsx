import { Controller, useForm } from 'react-hook-form';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { createReport } from '../../src/features/moderation/api';
import { Button } from '../../src/ui/Button';
import { useAuthStore } from '../../src/store';

interface FormValues {
  reason: string;
  details: string;
}

export default function ReportModal(): JSX.Element {
  const router = useRouter();
  const { targetId, targetType } = useLocalSearchParams<{ targetId?: string; targetType?: string }>();
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { reason: '', details: '' },
  });
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const orgId = useAuthStore((state) => state.orgId);

  const onSubmit = handleSubmit(async ({ reason, details }) => {
    if (!userId) {
      Alert.alert('Sign in required', 'You need an account to submit reports.');
      return;
    }

    try {
      await createReport(orgId, userId, String(targetType), String(targetId), reason, details);
      Alert.alert('Report submitted', 'Thank you for helping keep the community safe.');
      router.back();
    } catch (error) {
      Alert.alert('Unable to submit report', error instanceof Error ? error.message : 'Please try again later');
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Report content</Text>
      <Controller
        control={control}
        name="reason"
        rules={{ required: true, minLength: 3 }}
        render={({ field: { value, onChange } }) => (
          <TextInput
            style={styles.input}
            placeholder="Reason"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="details"
        render={({ field: { value, onChange } }) => (
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Additional details (optional)"
            value={value}
            onChangeText={onChange}
            multiline
          />
        )}
      />
      <Button label="Submit" onPress={onSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
