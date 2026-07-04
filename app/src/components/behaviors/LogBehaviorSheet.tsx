import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { HandPalm, LockKey, Smiley } from 'phosphor-react-native';
import { useState, type ReactNode } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { logBehavior, type Behavior } from '@/api/behaviors';
import { getPerson } from '@/api/family';
import { useMoods } from '@/api/moods';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { pickEmoji } from '@/components/ui/emoji-keyboard';
import { useThemeColor } from '@/hooks/use-theme-color';

type LogBehaviorSheetProperties = {
  behavior: Behavior;
};

// The confirmation sheet after tapping a behavior tile. A parent unlocks it
// with Face ID, says whether it hit their mood (optionally picking the emoji
// the kids will see in the feed), and the log is saved.
export function LogBehaviorSheet({ behavior }: LogBehaviorSheetProperties): ReactNode {
  const insets = useSafeAreaInsets();
  const route = useApiRouter();
  const { refresh: refreshMoods } = useMoods();
  const accent = useThemeColor('primary-emphasis');

  const [unlocked, setUnlocked] = useState(false);
  const [affectedMood, setAffectedMood] = useState<boolean | null>(null);
  const [emoji, setEmoji] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const kidName = getPerson(behavior.family_member)?.name ?? behavior.family_member;

  async function handleUnlock(): Promise<void> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm it's you to log this",
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      setUnlocked(true);
    }
  }

  async function handlePickEmoji(): Promise<void> {
    const picked = await pickEmoji();
    if (picked) {
      setEmoji(picked);
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
        mood_emoji: affectedMood ? emoji : null,
      });
      // Logging may have lowered the parent's mood on the API side.
      await refreshMoods();
      router.back();
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
        {unlocked ? (
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

            {affectedMood ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Pick the emoji the kids will see"
                onPress={() => void handlePickEmoji()}
                className="flex-row items-center justify-center gap-2 rounded-2xl bg-surface px-4 py-3 active:opacity-80"
              >
                {emoji ? (
                  <Text className="text-2xl">{emoji}</Text>
                ) : (
                  <Smiley size={24} color={accent} />
                )}
                <Text className="text-base text-foreground">
                  {emoji ? 'Change the emoji' : 'Pick an emoji for the feed (optional)'}
                </Text>
              </Pressable>
            ) : null}

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
