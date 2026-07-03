import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { LockKey, Smiley, SmileySad } from 'phosphor-react-native';
import { useState, type ReactNode } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type FamilyMember } from '@/api/auth';
import { MOOD_MAX, MOOD_MIN, MOOD_NEUTRAL, moodLabel, useMoods, type MoodLevel } from '@/api/moods';
import { MoodAvatar } from '@/components/moods/MoodAvatar';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';

function clamp(value: number): MoodLevel {
  return Math.min(MOOD_MAX, Math.max(MOOD_MIN, value));
}

type MoodSheetProperties = {
  member: FamilyMember;
};

export function MoodSheet({ member }: MoodSheetProperties): ReactNode {
  const insets = useSafeAreaInsets();
  const { members, updateMood } = useMoods();
  const tint = useThemeColor('foreground');

  const record = members.find((entry) => entry.family_member === member);

  const [unlocked, setUnlocked] = useState(false);
  const [draft, setDraft] = useState<MoodLevel>(MOOD_NEUTRAL);
  const [saving, setSaving] = useState(false);

  const shownMood = unlocked ? draft : (record?.mood ?? MOOD_NEUTRAL);
  const displayName = record?.name?.split(' ')[0] ?? '';

  async function handleUnlock(): Promise<void> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm it's you to change the mood",
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      // Start editing from the current value the moment the person is verified.
      setDraft(record?.mood ?? MOOD_NEUTRAL);
      setUnlocked(true);
    }
  }

  async function handleSave(): Promise<void> {
    setSaving(true);
    try {
      await updateMood(member, draft);
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
      <MoodAvatar member={member} mood={shownMood} width={168} height={220} />

      <Text className="mt-4 text-3xl font-semibold text-foreground">{displayName}</Text>
      <Text className="mt-1 text-lg text-muted">Feels {moodLabel(shownMood).toLowerCase()}</Text>

      <MoodScale mood={shownMood} />

      <View className="mt-8 w-full">
        {unlocked ? (
          <View className="gap-6">
            <View className="flex-row items-center justify-center gap-8">
              <StepButton
                accessibilityLabel="More upset"
                disabled={draft <= MOOD_MIN}
                onPress={() => setDraft((value) => clamp(value - 1))}
              >
                <SmileySad size={32} color={tint} weight="regular" />
              </StepButton>
              <StepButton
                accessibilityLabel="Happier"
                disabled={draft >= MOOD_MAX}
                onPress={() => setDraft((value) => clamp(value + 1))}
              >
                <Smiley size={32} color={tint} weight="regular" />
              </StepButton>
            </View>
            <Button fullWidth loading={saving} onPress={handleSave}>
              Save
            </Button>
          </View>
        ) : (
          <Button fullWidth icon={LockKey} onPress={handleUnlock}>
            Change mood
          </Button>
        )}
      </View>
    </View>
  );
}

function MoodScale({ mood }: { mood: MoodLevel }): ReactNode {
  return (
    <View className="mt-6 flex-row items-center gap-2">
      {Array.from({ length: MOOD_MAX }, (_, index) => index + 1).map((level) => (
        <View
          key={level}
          className={`h-2.5 rounded-full ${
            level === mood ? 'w-6 bg-primary' : 'w-2.5 bg-surface-selected'
          }`}
        />
      ))}
    </View>
  );
}

type StepButtonProperties = {
  children: ReactNode;
  accessibilityLabel: string;
  disabled?: boolean;
  onPress: () => void;
};

function StepButton({
  children,
  accessibilityLabel,
  disabled,
  onPress,
}: StepButtonProperties): ReactNode {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`size-16 items-center justify-center rounded-full bg-surface-selected ${
        disabled ? 'opacity-40' : 'active:opacity-80'
      }`}
    >
      {children}
    </Pressable>
  );
}
