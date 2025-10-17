import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../../src/lib/supabase';
import { Button } from '../../src/ui/Button';
import { useAuthStore } from '../../src/store';

export default function AdminDevotional(): JSX.Element {
  const [title, setTitle] = useState('');
  const [scripture, setScripture] = useState('');
  const [body, setBody] = useState('');
  const orgId = useAuthStore((state) => state.orgId);
  const user = useAuthStore((state) => state.user);

  const onSubmit = async () => {
    if (!user) {
      Alert.alert('Sign in required');
      return;
    }

    try {
      const { error } = await supabase.from('devotionals').insert({
        org_id: orgId,
        author_id: user.id,
        title,
        scripture_reference: scripture,
        body,
      });

      if (error) {
        throw error;
      }

      Alert.alert('Devotional published');
    } catch (error) {
      Alert.alert('Failed to publish', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>New devotional</Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Scripture reference"
          value={scripture}
          onChangeText={setScripture}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Body"
          value={body}
          onChangeText={setBody}
          multiline
        />
        <Button label="Publish" onPress={onSubmit} />
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
    minHeight: 160,
    textAlignVertical: 'top',
  },
});
