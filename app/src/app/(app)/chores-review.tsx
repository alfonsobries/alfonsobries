import { Image } from 'expo-image';
import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Check, LockKey, Star, X } from 'phosphor-react-native';
import { useCallback, useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/api/auth';
import { checkChore, fetchChores, reviewChoreLog, type Chore } from '@/api/chores';
import { getPerson, isKid } from '@/api/family';
import { MOOD_MAX, MOOD_MIN, useMoods } from '@/api/moods';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';

// The evening review, as a form sheet: every chore of the day, pre-checked
// with what the kid marked. A parent unlocks with Face ID, adjusts each
// check (including ones the kid forgot to mark) and saves the whole day.
// Approvals earn the kid points and lift the parent's mood; the review can
// be re-run later to fix a verdict.
export default function ChoresReviewScreen(): ReactNode {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const insets = useSafeAreaInsets();
  const route = useApiRouter();
  const { user } = useAuth();
  const { members: moodMembers, refresh: refreshMoods } = useMoods();

  const person = member ? getPerson(member) : undefined;
  const kid = person && isKid(person.key) ? person.key : undefined;

  const [unlocked, setUnlocked] = useState(false);
  const [chores, setChores] = useState<Chore[]>([]);
  const [verdicts, setVerdicts] = useState<Record<number, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!kid) {
      return;
    }

    try {
      const nextChores = await fetchChores(route, kid);
      setChores(nextChores);
      setVerdicts(
        Object.fromEntries(
          nextChores.map((chore) => [
            chore.id,
            chore.today?.status === 'done' || chore.today?.status === 'approved',
          ]),
        ),
      );
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
      promptMessage: "Confirm it's you to review the day",
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      setUnlocked(true);
    }
  }

  async function handleSave(): Promise<void> {
    setSaving(true);

    // Approvals lift the reviewing parent's mood by the chore's points,
    // revoked ones give them back; mirrored here for the result screen.
    let moodDelta = 0;

    try {
      for (const chore of chores) {
        const approved = verdicts[chore.id] ?? false;
        const status = chore.today?.status ?? null;

        if (approved && status === 'approved') {
          continue;
        }
        if (!approved && (status === null || status === 'rejected')) {
          continue;
        }

        // A chore the kid forgot to mark needs its log first.
        const logId = chore.today?.log_id ?? (await checkChore(route, chore.id)).id;

        await reviewChoreLog(route, logId, approved);
        moodDelta += approved ? chore.points : status === 'approved' ? -chore.points : 0;
      }

      const myMood = moodMembers.find((entry) => entry.family_member === user?.family_member)?.mood;

      await refreshMoods();

      const earned = chores
        .filter((chore) => verdicts[chore.id])
        .reduce((total, chore) => total + chore.points, 0);

      // Close this sheet entirely; the small result window takes its place.
      router.replace({
        pathname: '/save-result',
        params: {
          emoji: '⭐',
          title: 'Day saved',
          message:
            earned > 0
              ? `${person?.name} earned ${earned} point${earned === 1 ? '' : 's'} today.`
              : `Nothing approved for ${person?.name} today.`,
          ...(myMood != null && moodDelta !== 0
            ? {
                member: user?.family_member ?? '',
                before: String(myMood),
                after: String(Math.min(MOOD_MAX, Math.max(MOOD_MIN, myMood + moodDelta))),
                note:
                  moodDelta > 0
                    ? 'Reviewing lifted your mood'
                    : 'Fixing the day moved your mood back',
              }
            : {}),
        },
      });
    } catch {
      setSaving(false);
      Alert.alert('Could not save', 'Please try again in a moment.');
      await load();
    }
  }

  return (
    <View className="flex-1 bg-background px-6 pt-8" style={{ paddingBottom: insets.bottom + 16 }}>
      <Text className="text-center text-3xl font-semibold text-foreground">
        {person.name}&apos;s day
      </Text>
      <Text className="mt-1 text-center text-lg text-muted">Check what really happened today</Text>

      <View className="mt-6 flex-1">
        {unlocked ? (
          <View className="flex-1 gap-4">
            <ScrollView contentContainerClassName="gap-3">
              {chores.map((chore) => (
                <ReviewRow
                  key={chore.id}
                  chore={chore}
                  approved={verdicts[chore.id] ?? false}
                  onToggle={() =>
                    setVerdicts((current) => ({ ...current, [chore.id]: !current[chore.id] }))
                  }
                />
              ))}

              {chores.length === 0 && loaded ? (
                <Text className="py-6 text-center text-sm text-muted">No chores yet.</Text>
              ) : null}
            </ScrollView>

            {chores.length > 0 ? (
              <Button fullWidth loading={saving} onPress={() => void handleSave()}>
                Save the day
              </Button>
            ) : null}
          </View>
        ) : (
          <Button fullWidth icon={LockKey} onPress={() => void handleUnlock()}>
            Review with Face ID
          </Button>
        )}
      </View>
    </View>
  );
}

function ReviewRow({
  chore,
  approved,
  onToggle,
}: {
  chore: Chore;
  approved: boolean;
  onToggle: () => void;
}) {
  const accent = useThemeColor('primary-emphasis');
  const success = useThemeColor('success');
  const muted = useThemeColor('muted');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={chore.name}
      accessibilityState={{ checked: approved }}
      onPress={onToggle}
      className="flex-row items-center gap-3 rounded-3xl bg-surface p-3 active:opacity-70"
    >
      <View className="size-14 items-center justify-center overflow-hidden rounded-xl bg-surface-selected">
        {chore.image_url ? (
          <Image
            source={{ uri: chore.image_url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <Star size={24} color={accent} weight="fill" />
        )}
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
          {chore.name}
        </Text>
        <Text className="text-sm text-muted">
          +{chore.points} point{chore.points === 1 ? '' : 's'}
          {chore.today?.status === 'done' ? ' · marked by the kid' : ''}
        </Text>
      </View>

      <View className="size-12 items-center justify-center rounded-full bg-surface-selected">
        {approved ? (
          <Check size={24} color={success} weight="bold" />
        ) : (
          <X size={22} color={muted} />
        )}
      </View>
    </Pressable>
  );
}
