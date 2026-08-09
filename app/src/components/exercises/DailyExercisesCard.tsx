import { router, useFocusEffect } from 'expo-router';
import { Barbell, CaretRight, Flame } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useApiRouter } from '@/api/router';
import { localDate } from '@/api/virtue';
import { fetchWorkoutSummary, workoutDay, type WorkoutSummary } from '@/api/workout';
import { useThemeColor } from '@/hooks/use-theme-color';
import { isOfflineError } from '@/offline/connectivity';
import { cacheKeys, readCache, writeCache } from '@/offline/store';

// Today's routine on the home screen: how much of it is done and what it is
// worth so far. Renders nothing when the routine isn't available for this
// user.
export function DailyExercisesCard() {
  const route = useApiRouter();
  const tint = useThemeColor('primary-emphasis');
  const muted = useThemeColor('muted');
  const [summary, setSummary] = useState<WorkoutSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        try {
          const next = await fetchWorkoutSummary(route);
          writeCache(cacheKeys.workout, next);
          setSummary(next);
        } catch (error) {
          if (isOfflineError(error)) {
            setSummary(readCache<WorkoutSummary>(cacheKeys.workout));
          }
        }
      })();
    }, [route]),
  );

  if (summary === null) {
    return null;
  }

  const day = workoutDay(summary, localDate());
  const ratio = summary.setsTotal === 0 ? 0 : day.sets_done / summary.setsTotal;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Daily exercises"
      onPress={() => router.push('/exercises')}
      className="gap-3 rounded-3xl bg-surface p-4 active:opacity-80"
    >
      <View className="flex-row items-center gap-3">
        <View className="size-11 items-center justify-center rounded-2xl bg-surface-selected">
          <Barbell size={22} color={tint} weight="fill" />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-semibold text-foreground">Daily exercises</Text>
          <Text className="text-sm text-muted">
            {day.sets_done} of {summary.setsTotal} sets
            {day.points > 0 ? ` · ${day.points} ${day.points === 1 ? 'point' : 'points'}` : ''}
          </Text>
        </View>
        {summary.stats.streak > 0 ? (
          <View className="flex-row items-center gap-1">
            <Flame size={14} color={tint} weight="fill" />
            <Text className="text-sm font-semibold text-foreground">{summary.stats.streak}</Text>
          </View>
        ) : null}
        <CaretRight size={14} color={muted} weight="bold" />
      </View>

      <View className="h-1.5 w-full overflow-hidden rounded-full bg-surface-selected">
        <View
          className="h-full rounded-full bg-primary-emphasis"
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </View>
    </Pressable>
  );
}
