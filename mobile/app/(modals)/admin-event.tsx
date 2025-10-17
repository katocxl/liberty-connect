import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../../src/lib/supabase';
import { Button } from '../../src/ui/Button';
import { useAuthStore } from '../../src/store';

export default function AdminEvent(): JSX.Element {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const orgId = useAuthStore((state) => state.orgId);
  const user = useAuthStore((state) => state.user);

  const onSubmit = async () => {
    if (!user) {
      Alert.alert('Sign in required');
      return;
    }

    try {
      const start = new Date(startAt);
      if (Number.isNaN(start.getTime())) {
        throw new Error('Invalid start date');
      }
      const end = endAt ? new Date(endAt) : null;
      if (end && Number.isNaN(end.getTime())) {
        throw new Error('Invalid end date');
      }

      const { error } = await supabase.from('events').insert({
        org_id: orgId,
        created_by: user.id,
        title,
        description,
        location,
        start_at: start.toISOString(),
        end_at: end ? end.toISOString() : null,
      });

      if (error) {
        throw error;
      }

      Alert.alert('Event created');
    } catch (error) {
      Alert.alert('Failed to create event', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>New event</Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          style={styles.input}
          placeholder="Start (e.g. 2025-10-20T15:00:00Z)"
          value={startAt}
          onChangeText={setStartAt}
        />
        <TextInput
          style={styles.input}
          placeholder="End (optional)"
          value={endAt}
          onChangeText={setEndAt}
        />
        <Button label="Create" onPress={onSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
