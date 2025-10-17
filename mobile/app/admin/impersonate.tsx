import { useState } from 'react';
import { Linking, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { callEdgeFunction } from '../../src/lib/apiClient';
import { Button } from '../../src/ui/Button';
import { useAuthStore } from '../../src/store';

export default function Impersonate(): JSX.Element {
  const role = useAuthStore((state) => state.role);
  const [targetUserId, setTargetUserId] = useState('');
  const [redirectTo, setRedirectTo] = useState('');
  const [actionLink, setActionLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (role !== 'owner' && role !== 'moderator') {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Only moderators can impersonate users.</Text>
      </SafeAreaView>
    );
  }

  const onSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await callEdgeFunction<{ action_link: string }>('impersonate', {
        org_id: useAuthStore.getState().orgId,
        target_user_id: targetUserId,
        redirect_to: redirectTo || null,
      });
      setActionLink(response.action_link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to impersonate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.heading}>Impersonate user</Text>
        <TextInput
          style={styles.input}
          placeholder="Target user ID"
          value={targetUserId}
          autoCapitalize="none"
          onChangeText={setTargetUserId}
        />
        <TextInput
          style={styles.input}
          placeholder="Redirect URL (optional)"
          value={redirectTo}
          onChangeText={setRedirectTo}
          autoCapitalize="none"
        />
        <Button label="Generate link" onPress={onSubmit} disabled={!targetUserId} loading={loading} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {actionLink ? (
          <Text style={styles.link} onPress={() => Linking.openURL(actionLink)}>
            Open impersonation link
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
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
  error: {
    color: '#dc2626',
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
