import { Redirect, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';

import { checkChore, fetchChores, uncheckChore, type Chore } from '@/api/chores';
import { getPerson, isKid } from '@/api/family';
import { useApiRouter } from '@/api/router';
import { ChoreChecklist } from '@/components/chores/ChoreChecklist';

// Today's full checklist, opened from the kid's profile. The kids check each
// chore in the moment they do it; parents confirm later in the evening
// review.
export default function ChoresTodayScreen() {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const route = useApiRouter();

  const [chores, setChores] = useState<Chore[]>([]);
  const [loaded, setLoaded] = useState(false);

  const person = member ? getPerson(member) : undefined;
  const kid = person && isKid(person.key) ? person.key : undefined;

  const load = useCallback(async () => {
    if (!kid) {
      return;
    }

    try {
      setChores(await fetchChores(route, kid));
      setLoaded(true);
    } catch {
      // The next focus retries.
    }
  }, [route, kid]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (!person || !kid) {
    return <Redirect href="/" />;
  }

  async function handleCheck(chore: Chore): Promise<void> {
    // Optimistically flip the row so the kid sees the check instantly.
    setChores((current) =>
      current.map((entry) =>
        entry.id === chore.id ? { ...entry, today: { log_id: 0, status: 'done' } } : entry,
      ),
    );

    try {
      await checkChore(route, chore.id);
    } finally {
      await load();
    }
  }

  async function handleUncheck(chore: Chore): Promise<void> {
    if (!chore.today) {
      return;
    }

    try {
      await uncheckChore(route, chore.today.log_id);
      await load();
    } catch {
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
      </ScrollView>
    </>
  );
}
