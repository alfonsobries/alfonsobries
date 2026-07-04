import { Image } from 'expo-image';
import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Check, LockKey, Star, X } from 'phosphor-react-native';
import { useCallback, useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchTodayChoreLogs, reviewChoreLog, type ChoreLogEntry } from '@/api/chores';
import { useMoods } from '@/api/moods';
import { useApiRouter } from '@/api/router';
import { getPerson, isKid } from '@/api/family';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';

// The evening review, as a form sheet: a parent unlocks with Face ID and
// approves or rejects each chore the kid checked today. Approving earns the
// kid the points and lifts the parent's mood.
export default function ChoresReviewScreen(): ReactNode {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const insets = useSafeAreaInsets();
  const route = useApiRouter();
  const { refresh: refreshMoods } = useMoods();
  const success = useThemeColor('success');
  const danger = useThemeColor('danger');
  const accent = useThemeColor('primary-emphasis');

  const person = member ? getPerson(member) : undefined;
  const kid = person && isKid(person.key) ? person.key : undefined;

  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState<ChoreLogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!kid) {
      return;
    }

    try {
      const logs = await fetchTodayChoreLogs(route, kid);
      setEntries(logs.filter((log) => log.status === 'done'));
      setLoaded(true);
    } catch {
      // The retry is one focus away.
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

  async function handleUnlock(): Promise<void> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm it's you to review today's chores",
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      setUnlocked(true);
    }
  }

  async function handleReview(entry: ChoreLogEntry, approved: boolean): Promise<void> {
    setEntries((current) => current.filter((candidate) => candidate.id !== entry.id));

    try {
      await reviewChoreLog(route, entry.id, approved);
      if (approved) {
        // Approving lifted this parent's mood on the API side.
        await refreshMoods();
      }
    } catch {
      Alert.alert('Could not save', 'Please try again in a moment.');
      await load();
    }
  }

  return (
    <View className="flex-1 bg-background px-6 pt-8" style={{ paddingBottom: insets.bottom + 16 }}>
      <Text className="text-center text-3xl font-semibold text-foreground">
        {person.name}&apos;s day
      </Text>
      <Text className="mt-1 text-center text-lg text-muted">
        {entries.length === 0
          ? loaded
            ? 'Nothing waiting for review. 🎉'
            : ' '
          : `${entries.length} to review`}
      </Text>

      <View className="mt-6 flex-1">
        {unlocked ? (
          <ScrollView contentContainerClassName="gap-3">
            {entries.map((entry) => (
              <View
                key={entry.id}
                className="flex-row items-center gap-3 rounded-3xl bg-surface p-3"
              >
                <View className="size-14 items-center justify-center overflow-hidden rounded-xl bg-surface-selected">
                  {entry.chore.image_url ? (
                    <Image
                      source={{ uri: entry.chore.image_url }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  ) : (
                    <Star size={24} color={accent} weight="fill" />
                  )}
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                    {entry.chore.name}
                  </Text>
                  <Text className="text-sm text-muted">
                    +{entry.points} point{entry.points === 1 ? '' : 's'}
                  </Text>
                </View>
                <ReviewButton
                  accessibilityLabel={`Reject ${entry.chore.name}`}
                  onPress={() => void handleReview(entry, false)}
                >
                  <X size={22} color={danger} weight="bold" />
                </ReviewButton>
                <ReviewButton
                  accessibilityLabel={`Approve ${entry.chore.name}`}
                  onPress={() => void handleReview(entry, true)}
                >
                  <Check size={22} color={success} weight="bold" />
                </ReviewButton>
              </View>
            ))}

            {entries.length === 0 && loaded ? (
              <Button variant="secondary" onPress={() => router.back()}>
                Done
              </Button>
            ) : null}
          </ScrollView>
        ) : (
          <Button fullWidth icon={LockKey} onPress={() => void handleUnlock()}>
            Review with Face ID
          </Button>
        )}
      </View>
    </View>
  );
}

function ReviewButton({
  children,
  accessibilityLabel,
  onPress,
}: {
  children: ReactNode;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="size-12 items-center justify-center rounded-full bg-surface-selected active:opacity-70"
    >
      {children}
    </Pressable>
  );
}
