import { router, useFocusEffect } from 'expo-router';
import { CaretRight } from 'phosphor-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { useApiRouter } from '@/api/router';
import { fetchWorkoutSummary, type WorkoutSummary } from '@/api/workout';
import { Card } from '@/components/ui/Card';
import { lastSevenDays, WeekStrip } from '@/components/virtue/WeekStrip';
import { EXERCISE_LABELS } from '@/data/workout';
import { useThemeColor } from '@/hooks/use-theme-color';
import { isOfflineError } from '@/offline/connectivity';
import { cacheKeys, readCache } from '@/offline/store';

// The daily routine as it appears inside the body area: the same week-at-a-
// glance shape as every other habit, so the area's score is explained by
// everything that feeds it. Tapping opens the routine itself.
export function RoutineAreaCard() {
  const route = useApiRouter();
  const tint = useThemeColor('primary-emphasis');
  const muted = useThemeColor('muted');
  const [summary, setSummary] = useState<WorkoutSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        try {
          setSummary(await fetchWorkoutSummary(route));
        } catch (error) {
          if (isOfflineError(error)) {
            setSummary(readCache<WorkoutSummary>(cacheKeys.workout));
          }
        }
      })();
    }, [route]),
  );

  const week = useMemo(() => lastSevenDays(), []);
  const { Icon } = EXERCISE_LABELS.pull_ups;

  if (summary === null) {
    return null;
  }

  const worked = new Set(summary.days.filter((day) => day.sets_done > 0).map((day) => day.date));
  const weekCount = week.filter((date) => worked.has(date)).length;

  return (
    <Card className="gap-4" onPress={() => router.push('/exercises')}>
      <View className="flex-row items-center gap-3">
        <View className="size-11 items-center justify-center rounded-2xl bg-surface-selected">
          <Icon size={22} color={tint} weight="fill" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">Daily exercises</Text>
          <Text className="text-sm text-muted">Pull-ups, push-ups, squats and the hold</Text>
        </View>
        <View className="items-end">
          <Text className="text-lg font-bold text-foreground">{weekCount}/7</Text>
          <Text className="text-xs text-muted">this week</Text>
        </View>
        <CaretRight size={14} color={muted} weight="bold" />
      </View>
      <View className="flex-row items-center justify-between">
        <WeekStrip completed={worked} />
        <Text className="text-xs text-muted">
          {summary.stats.full_days} full {summary.stats.full_days === 1 ? 'day' : 'days'}
        </Text>
      </View>
    </Card>
  );
}
