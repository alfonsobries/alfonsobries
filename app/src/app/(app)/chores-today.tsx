import { Redirect, router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { LockKey } from 'phosphor-react-native';
import { useCallback } from 'react';
import { Alert, ScrollView, Text } from 'react-native';

import {
  checkChore,
  checkChoreDedupeKey,
  fetchChores,
  queueCheckChore,
  uncheckChore,
  type Chore,
} from '@/api/chores';
import { getPerson, isKid } from '@/api/family';
import { useApiRouter } from '@/api/router';
import { ChoreChecklist } from '@/components/chores/ChoreChecklist';
import { Button } from '@/components/ui/Button';
import { isOfflineError } from '@/offline/connectivity';
import { cancelQueued } from '@/offline/queue';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

// Today's full checklist, opened from the kid's profile. The kids check each
// chore in the moment they do it; parents confirm later in the evening
// review.
export default function ChoresTodayScreen() {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const route = useApiRouter();

  const person = member ? getPerson(member) : undefined;
  const kid = person && isKid(person.key) ? person.key : undefined;

  const fetcher = useCallback(
    () => (kid ? fetchChores(route, kid) : Promise.resolve([])),
    [route, kid],
  );

  const list = useCachedResource<Chore[]>(cacheKeys.chores(kid), fetcher, {
    enabled: kid !== undefined,
  });
  const { refresh, update } = list;

  const chores = list.data ?? [];
  const loaded = list.status !== 'loading';

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  if (!person || !kid) {
    return <Redirect href="/" />;
  }

  function setToday(chore: number, today: Chore['today']): void {
    update((current) =>
      (current ?? []).map((entry) => (entry.id === chore ? { ...entry, today } : entry)),
    );
  }

  async function handleCheck(chore: Chore): Promise<void> {
    // Optimistically flip the row so the kid sees the check instantly.
    setToday(chore.id, { log_id: 0, status: 'done' });

    try {
      await checkChore(route, chore.id);
      await refresh();
    } catch (error) {
      if (isOfflineError(error)) {
        queueCheckChore({ chore: chore.id }, { dedupeKey: checkChoreDedupeKey(chore.id) });
        return;
      }

      await refresh();
    }
  }

  async function handleUncheck(chore: Chore): Promise<void> {
    if (!chore.today) {
      return;
    }

    // A `log_id` of 0 means the check never reached the API, so undoing it is
    // just dropping the queued mutation.
    if (chore.today.log_id === 0 && cancelQueued(checkChoreDedupeKey(chore.id))) {
      setToday(chore.id, null);
      return;
    }

    try {
      await uncheckChore(route, chore.today.log_id);
      await refresh();
    } catch (error) {
      if (isOfflineError(error)) {
        Alert.alert('No connection', 'Uncheck it once you are back online.');
        return;
      }

      Alert.alert('Could not uncheck', 'Maybe it was already reviewed.');
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: `${person.name} today` }} />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 p-4"
      >
        <Text className="px-4 text-center text-sm text-muted">
          Tap each chore the moment it&apos;s done. ⭐
        </Text>

        {chores.length > 0 ? (
          <ChoreChecklist
            chores={chores}
            onCheck={(chore) => void handleCheck(chore)}
            onUncheck={(chore) => void handleUncheck(chore)}
          />
        ) : loaded ? (
          <Text className="py-6 text-center text-sm text-muted">No chores yet.</Text>
        ) : null}

        {chores.length > 0 ? (
          // The parents' evening pass lives here, next to the day it reviews.
          // The review sheet asks for Face ID itself.
          <Button
            variant="outline"
            icon={LockKey}
            onPress={() => router.push({ pathname: '/chores-review', params: { member: kid } })}
          >
            Parents: review the day
          </Button>
        ) : null}
      </ScrollView>
    </>
  );
}
