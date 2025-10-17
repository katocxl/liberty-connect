import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { AnnouncementCard } from '../../announcements/components/AnnouncementCard';
import { DevotionalCard } from '../../devotional/components/DevotionalCard';
import type { EventSummary } from '../../events/types';
import { formatDateTime } from '../../../lib/time';
import { Spinner } from '../../../ui/Spinner';
import { useHomeSnapshot } from '../hooks/useHomeSnapshot';
import { useSearch } from '../../search/hooks/useSearch';
import type { SearchResult } from '../../search/types';

export const HomeScreen = (): JSX.Element => {
  const { data, isLoading } = useHomeSnapshot();
  const [query, setQuery] = useState('');
  const { data: searchResults, isFetching: searchLoading, isSearchable } = useSearch(query);

  if (isLoading || !data) {
    return <Spinner />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Welcome back</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search announcements and prayers"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />
      {isSearchable ? (
        <View style={styles.searchResults}>
          {searchLoading ? (
            <Text>Searching…</Text>
          ) : (searchResults ?? []).map((result) => (
            <SearchResultRow key={`${result.type}-${result.id}`} result={result} />
          ))}
        </View>
      ) : null}
      {data.devotional ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today’s devotional</Text>
          <DevotionalCard devotional={data.devotional} />
        </View>
      ) : null}
      <Text style={styles.sectionTitle}>Announcements</Text>
      <View style={styles.section}>
        {data.announcements.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </View>
      <Text style={styles.sectionTitle}>Upcoming events</Text>
      <View style={styles.section}>
        {data.events.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  searchResults: {
    gap: 12,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
});

const SearchResultRow = ({ result }: { result: SearchResult }): JSX.Element => (
  <TouchableOpacity
    style={stylesResult.row}
    onPress={() => {
      if (result.type === 'announcement') {
        router.push({ pathname: '/announcement/[id]', params: { id: result.id } });
      } else {
        router.push({ pathname: '/prayer/[id]', params: { id: result.id } });
      }
    }}
  >
    <Text style={stylesResult.title}>{result.title}</Text>
    <Text style={stylesResult.snippet}>{result.snippet}</Text>
  </TouchableOpacity>
);

const stylesResult = StyleSheet.create({
  row: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  snippet: {
    fontSize: 14,
    color: '#4b5563',
  },
});

const EventRow = ({ event }: { event: EventSummary }): JSX.Element => (
  <TouchableOpacity
    style={stylesResult.row}
    onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
  >
    <Text style={stylesResult.title}>{event.title}</Text>
    <Text style={stylesResult.snippet}>{formatDateTime(event.startAt, { timezone: event.timezone })}</Text>
    {event.location ? <Text style={stylesResult.snippet}>{event.location}</Text> : null}
  </TouchableOpacity>
);
