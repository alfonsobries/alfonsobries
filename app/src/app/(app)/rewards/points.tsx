import { Redirect, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Minus, Plus } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { adjustPoints, fetchPointHistory, type PointEntry, type PointHistory } from '@/api/chores';
import { getPerson, isKid } from '@/api/family';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isOfflineError } from '@/offline/connectivity';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

const AMOUNTS = [1, 2, 5, 10];

// Points a parent hands out or takes back by hand, and the story of where a
// kid's points came from. Reached from the rewards screen, already unlocked.
export default function PointsScreen() {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const route = useApiRouter();

  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const person = member ? getPerson(member) : undefined;
  const kid = person && isKid(person.key) ? person.key : undefined;

  const fetcher = useCallback(
    () =>
      kid ? fetchPointHistory(route, kid) : Promise.resolve({ entries: [], balance: 0, free: 0 }),
    [route, kid],
  );
  const history = useCachedResource<PointHistory>(cacheKeys.points(kid), fetcher, {
    enabled: kid !== undefined,
  });
  const { refresh } = history;

  const entries = history.data?.entries ?? [];
  const balance = history.data?.balance ?? 0;
  const free = history.data?.free ?? 0;

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  if (!person || !kid) {
    return <Redirect href="/" />;
  }

  const canSave = reason.trim().length > 0 && !saving;

  async function handleAdjust(sign: 1 | -1): Promise<void> {
    if (!canSave || !kid) {
      return;
    }

    setSaving(true);
    try {
      await adjustPoints(route, kid, sign * amount, reason.trim());
      setReason('');
      await refresh();
    } catch (error) {
      // The API arbitrates the balance — an adjustment can't be guessed on the
      // device, so it waits for a connection rather than queueing.
      if (isOfflineError(error)) {
        Alert.alert('No connection', 'Adjust the points once you are back online.');
        return;
      }

      Alert.alert('Could not save', 'Check the amount leaves them at zero or above.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: `${person.name}'s points` }} />

      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 p-4"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center gap-1 rounded-3xl bg-surface p-6">
          <Text className="text-5xl font-bold text-foreground">{balance}</Text>
          <Text className="text-sm text-muted">points saved up</Text>
          {free > 0 ? (
            <Text className="mt-1 text-xs text-muted">{free} waiting for a goal</Text>
          ) : null}
        </View>

        <View className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
            Give or take back
          </Text>

          <View className="flex-row gap-2">
            {AMOUNTS.map((value) => (
              <AmountChip
                key={value}
                value={value}
                selected={value === amount}
                onPress={() => setAmount(value)}
              />
            ))}
          </View>

          <Input
            label="Why"
            placeholder="e.g. ayudó sin que le pidieran"
            value={reason}
            onChangeText={setReason}
            maxLength={60}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                fullWidth
                variant="secondary"
                icon={Minus}
                disabled={!canSave}
                onPress={() => void handleAdjust(-1)}
              >
                {`Take ${amount}`}
              </Button>
            </View>
            <View className="flex-1">
              <Button
                fullWidth
                icon={Plus}
                disabled={!canSave}
                onPress={() => void handleAdjust(1)}
              >
                {`Give ${amount}`}
              </Button>
            </View>
          </View>
        </View>

        {entries.length > 0 ? (
          <View className="gap-3">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
              Where the points came from
            </Text>
            <View className="overflow-hidden rounded-3xl bg-surface">
              {entries.map((entry, index) => (
                <PointEntryRow key={entry.id} entry={entry} divided={index > 0} />
              ))}
            </View>
          </View>
        ) : (
          <Text className="py-6 text-center text-sm text-muted">Nothing yet.</Text>
        )}
      </ScrollView>
    </>
  );
}

function AmountChip({
  value,
  selected,
  onPress,
}: {
  value: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${value} points`}
      onPress={onPress}
      className={`flex-1 items-center rounded-2xl py-3 active:opacity-70 ${
        selected ? 'bg-primary' : 'bg-surface'
      }`}
    >
      <Text
        className={`text-base font-semibold ${
          selected ? 'text-primary-foreground' : 'text-foreground'
        }`}
      >
        {value}
      </Text>
    </Pressable>
  );
}

function PointEntryRow({ entry, divided }: { entry: PointEntry; divided: boolean }) {
  const gained = entry.delta > 0;

  return (
    <View className={`flex-row items-center gap-3 p-3 ${divided ? 'border-t border-border' : ''}`}>
      <View className="flex-1 gap-0.5">
        <Text className="text-base text-foreground" numberOfLines={1}>
          {entry.label}
        </Text>
        <Text className="text-xs text-muted">
          {formatDay(entry.created_at)}
          {entry.reward ? ` · ${entry.reward}` : ''}
        </Text>
      </View>
      <Text className={`text-base font-semibold ${gained ? 'text-success' : 'text-danger'}`}>
        {gained ? '+' : ''}
        {entry.delta}
      </Text>
    </View>
  );
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
