import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { HandPalm, LockKey } from 'phosphor-react-native';
import { useState, type ReactNode } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/api/auth';
import { logBehavior, type Behavior } from '@/api/behaviors';
import { getPerson } from '@/api/family';
import { MOOD_MIN, useMoods } from '@/api/moods';
import { useApiRouter } from '@/api/router';
import { MoodShift } from '@/components/moods/MoodShift';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';

type LogBehaviorSheetProperties = {
  behavior: Behavior;
};

// The confirmation sheet after tapping a behavior tile. A parent unlocks it
// with Face ID, says whether it hit their mood, and the log is saved — the
// feed then shows their avatar (and a sad face when it did).
export function LogBehaviorSheet({ behavior }: LogBehaviorSheetProperties): ReactNode {
  const insets = useSafeAreaInsets();
  const route = useApiRouter();
  const { user } = useAuth();
  const { members, refresh: refreshMoods } = useMoods();
  const accent = useThemeColor('primary-emphasis');

  const [unlocked, setUnlocked] = useState(false);
  const [affectedMood, setAffectedMood] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ before: number; after: number } | 'saved' | null>(null);

  const kidName = getPerson(behavior.family_member)?.name ?? behavior.family_member;
  const myMood = members.find((entry) => entry.family_member === user?.family_member)?.mood;

  async function handleUnlock(): Promise<void> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm it's you to log this",
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      setUnlocked(true);
    }
  }

  async function handleSave(): Promise<void> {
    if (affectedMood === null) {
      return;
    }

    setSaving(true);
    try {
      await logBehavior(route, behavior.id, {
        affected_mood: affectedMood,
      });
      // Logging may have lowered the parent's mood on the API side.
      await refreshMoods();

      // Mirror the API's mood math so the result shows without a refetch race.
      setSaving(false);
      setResult(
        affectedMood && myMood != null
          ? { before: myMood, after: Math.max(MOOD_MIN, myMood - behavior.points) }
          : 'saved',
      );
    } catch {
      setSaving(false);
      Alert.alert('Could not save', 'Please try again in a moment.');
    }
  }

  return (
    <View
      className="flex-1 items-center bg-background px-6 pt-8"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      <View className="size-40 items-center justify-center overflow-hidden rounded-3xl bg-surface">
        {behavior.image_url ? (
          <Image
            source={{ uri: behavior.image_url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <HandPalm size={48} color={accent} weight="fill" />
        )}
      </View>

      <Text className="mt-4 text-3xl font-semibold text-foreground">{behavior.name}</Text>
      <Text className="mt-1 text-lg text-muted">{kidName} did this</Text>

      <View className="mt-8 w-full flex-1">
        {result !== null ? (
          <View className="items-center gap-6">
            <View className="items-center gap-1">
              <Text className="text-5xl">✅</Text>
              <Text className="mt-2 text-2xl font-semibold text-foreground">Saved</Text>
              <Text className="text-center text-base text-muted">
                {result === 'saved'
                  ? `${behavior.name} is on ${kidName}'s log.`
                  : `${behavior.name} is on ${kidName}'s log — and it moved your mood.`}
              </Text>
            </View>

            {result !== 'saved' ? (
              <View className="w-full gap-2 rounded-3xl bg-surface p-5">
                <MoodShift before={result.before} after={result.after} />
                <Text className="text-center text-sm text-muted">−{behavior.points} mood</Text>
              </View>
            ) : null}

            <Button fullWidth onPress={() => router.back()}>
              Done
            </Button>
          </View>
        ) : unlocked ? (
          <View className="gap-6">
            <Text className="text-center text-base font-medium text-foreground">
              Did it affect your mood?
            </Text>

            <View className="flex-row gap-3">
              <ChoiceButton
                label="No"
                selected={affectedMood === false}
                onPress={() => setAffectedMood(false)}
              />
              <ChoiceButton
                label={`Yes  −${behavior.points}`}
                selected={affectedMood === true}
                onPress={() => setAffectedMood(true)}
              />
            </View>

            <Button
              fullWidth
              loading={saving}
              disabled={affectedMood === null}
              onPress={() => void handleSave()}
            >
              Save
            </Button>
          </View>
        ) : (
          <Button fullWidth icon={LockKey} onPress={() => void handleUnlock()}>
            Log with Face ID
          </Button>
        )}
      </View>
    </View>
  );
}

function ChoiceButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`h-14 flex-1 items-center justify-center rounded-2xl ${
        selected ? 'bg-primary' : 'bg-surface'
      } active:opacity-80`}
    >
      <Text
        className={`text-base font-semibold ${selected ? 'text-primary-foreground' : 'text-foreground'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
