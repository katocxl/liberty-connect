import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Button } from '../../../ui/Button';
import { useComposePrayer } from '../hooks/useComposePrayer';

interface FormValues {
  body: string;
  isAnonymous: boolean;
}

const defaultValues: FormValues = {
  body: '',
  isAnonymous: false,
};

export const ComposePrayerSheet = (): JSX.Element => {
  const { control, handleSubmit, reset } = useForm<FormValues>({ defaultValues });
  const { mutate, isPending } = useComposePrayer();

  const onSubmit = handleSubmit(({ body, isAnonymous }) => {
    mutate(
      { body, isAnonymous },
      {
        onSuccess: () => {
          reset(defaultValues);
          Alert.alert('Prayer shared');
        },
        onError: () => {
          Alert.alert('Unable to post prayer. Please try again.');
        },
      },
    );
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share a prayer</Text>
      <Controller
        name="body"
        control={control}
        rules={{ required: true, minLength: 3 }}
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Write your prayer request"
            multiline
            numberOfLines={4}
            style={styles.input}
          />
        )}
      />
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Post anonymously</Text>
        <Controller
          name="isAnonymous"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Switch value={value} onValueChange={onChange} />
          )}
        />
      </View>
      <Button label="Share" onPress={onSubmit} disabled={isPending} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#374151',
  },
});
