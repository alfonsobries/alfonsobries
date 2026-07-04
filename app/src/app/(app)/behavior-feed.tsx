import { Redirect, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';

import { deleteBehaviorLog, fetchBehaviorLogs, type BehaviorLogEntry } from '@/api/behaviors';
import { getPerson, isKid } from '@/api/family';
import { useMoods } from '@/api/moods';
import { useApiRouter } from '@/api/router';
import { BehaviorFeed } from '@/components/behaviors/BehaviorFeed';

// The full behavior history for a kid, loading pages as the list reaches the
// end; skeleton rows stand in while the next page arrives.
export default function BehaviorFeedScreen() {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const route = useApiRouter();
  const { refresh: refreshMoods } = useMoods();

  const person = member ? getPerson(member) : undefined;
  const kid = person && isKid(person.key) ? person.key : undefined;

  const [entries, setEntries] = useState<BehaviorLogEntry[]>([]);
  const [nextPage, setNextPage] = useState<number | null>(1);
  const loadingRef = useRef(false);

  const loadMore = useCallback(
    async (reset = false) => {
      const page = reset ? 1 : nextPage;

      if (!kid || page === null || loadingRef.current) {
        return;
      }

      loadingRef.current = true;
      try {
        const result = await fetchBehaviorLogs(route, { member: kid, page });
        setEntries((current) => (reset ? result.entries : [...current, ...result.entries]));
        setNextPage(result.nextPage);
      } catch {
        // Scrolling again retries.
      } finally {
        loadingRef.current = false;
      }
    },
    [route, kid, nextPage],
  );

  // Fresh first page whenever the screen gains focus; scrolling appends.
  useFocusEffect(
    useCallback(() => {
      void loadMore(true);
      // loadMore also changes with nextPage; resetting only cares about route/kid.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route, kid]),
  );

  if (!person || !kid) {
    return <Redirect href="/" />;
  }

  async function handleUndo(entry: BehaviorLogEntry): Promise<void> {
    try {
      await deleteBehaviorLog(route, entry.id);
      await Promise.all([loadMore(true), refreshMoods()]);
    } catch {
      // The entry stays; a retry is one long-press away.
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: `${person.name}'s history` }} />
      <FlatList
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="p-4"
        data={[entries]}
        keyExtractor={() => 'feed'}
        renderItem={({ item }) => (
          <BehaviorFeed entries={item} onUndo={(entry) => void handleUndo(entry)} />
        )}
        ListFooterComponent={nextPage !== null ? <FeedSkeleton /> : null}
        onEndReachedThreshold={0.4}
        onEndReached={() => void loadMore()}
      />
    </>
  );
}

// Placeholder rows while the next page loads.
function FeedSkeleton() {
  return (
    <View className="mt-3 gap-3">
      {[0, 1, 2].map((index) => (
        <View key={index} className="flex-row items-center gap-3 rounded-3xl bg-surface p-3">
          <View className="size-16 animate-pulse rounded-xl bg-surface-selected" />
          <View className="flex-1 gap-2">
            <View className="h-4 w-2/3 animate-pulse rounded-full bg-surface-selected" />
            <View className="h-3 w-1/3 animate-pulse rounded-full bg-surface-selected" />
          </View>
        </View>
      ))}
    </View>
  );
}
