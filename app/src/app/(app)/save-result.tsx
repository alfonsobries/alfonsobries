import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FamilyMember } from '@/api/auth';
import { MoodShift } from '@/components/moods/MoodShift';
import { Button } from '@/components/ui/Button';

// The small confirmation window shown AFTER a logging sheet fully closes:
// what was saved, and — when it moved a parent's mood — the shift rendered
// with their illustrated avatar (before → after).
export default function SaveResultScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    emoji?: string;
    title?: string;
    message?: string;
    member?: string;
    before?: string;
    after?: string;
    note?: string;
  }>();

  const member = params.member === 'alfonso' || params.member === 'saida' ? params.member : null;
  const before = params.before ? Number(params.before) : null;
  const after = params.after ? Number(params.after) : null;
  const showShift = member !== null && before !== null && after !== null;

  return (
    <View
      className="flex-1 items-center justify-between bg-background px-6 pt-10"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      <View className="w-full items-center gap-5">
        <View className="items-center gap-1">
          <Text className="text-5xl">{params.emoji ?? '✅'}</Text>
          <Text className="mt-2 text-2xl font-semibold text-foreground">
            {params.title ?? 'Saved'}
          </Text>
          {params.message ? (
            <Text className="text-center text-base text-muted">{params.message}</Text>
          ) : null}
        </View>

        {showShift ? (
          <View className="w-full gap-2 rounded-3xl bg-surface p-5">
            <MoodShift member={member as FamilyMember} before={before} after={after} />
            {params.note ? (
              <Text className="text-center text-sm text-muted">{params.note}</Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <Button fullWidth onPress={() => router.back()}>
        Done
      </Button>
    </View>
  );
}
