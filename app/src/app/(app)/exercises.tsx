import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { Flame, Sparkle } from 'phosphor-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';

import { useApiRouter } from '@/api/router';
import { localDate } from '@/api/virtue';
import {
  cacheWorkoutDay,
  EMPTY_EXERCISES,
  fetchWorkoutSummary,
  queueWorkoutSets,
  setWorkoutSets,
  withWorkoutDay,
  workoutDay,
  workoutDedupeKey,
  type WorkoutExercise,
  type WorkoutSummary,
} from '@/api/workout';
import { ExerciseRow } from '@/components/exercises/ExerciseRow';
import { ExerciseWeek } from '@/components/exercises/ExerciseWeek';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useThemeColor } from '@/hooks/use-theme-color';
import { isOfflineError } from '@/offline/connectivity';
import { cacheKeys, readCache, writeCache } from '@/offline/store';

/** The seven calendar days ending on the given date, oldest first. */
function lastSevenDays(end: string): string[] {
  const last = new Date(`${end}T12:00:00`);

  return Array.from({ length: 7 }, (_, index) =>
    localDate(new Date(last.getFullYear(), last.getMonth(), last.getDate() - (6 - index))),
  );
}

// The daily routine as a to-do: one row per exercise, one tap per set. It
// lives outside the virtue section but its days feed the body area, so the
// screen says plainly what a day is worth.
export default function ExercisesScreen() {
  const route = useApiRouter();
  const tint = useThemeColor('primary-emphasis');
  const onPrimary = useThemeColor('primary-foreground');

  const [summary, setSummary] = useState<WorkoutSummary | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [today, setToday] = useState(() => localDate());
  const [date, setDate] = useState(today);

  const load = useCallback(async () => {
    try {
      const next = await fetchWorkoutSummary(route);
      writeCache(cacheKeys.workout, next);
      setSummary(next);
      setLoadFailed(false);
    } catch (error) {
      // Offline the routine still opens on whatever the cache last saw — a set
      // done on a plane is still a set done.
      if (isOfflineError(error)) {
        const cached = readCache<WorkoutSummary>(cacheKeys.workout);

        if (cached) {
          setSummary(cached);
          setLoadFailed(false);

          return;
        }
      }

      setLoadFailed(true);
    }
  }, [route]);

  useFocusEffect(
    useCallback(() => {
      // The screen can sit mounted across midnight, so "today" refreshes on focus.
      const now = localDate();
      setToday(now);
      setDate(now);
      void load();
    }, [load]),
  );

  const week = useMemo(() => lastSevenDays(today), [today]);
  const day = workoutDay(summary, date);
  const setsTotal = summary?.setsTotal ?? 0;
  const complete = setsTotal > 0 && day.sets_done >= setsTotal;

  async function save(exercise: WorkoutExercise, sets: number): Promise<void> {
    if (!summary) {
      return;
    }

    const previous = summary;
    const exercises = { ...day.exercises, [exercise]: sets };
    const filled = sets > day.exercises[exercise];

    if (process.env.EXPO_OS === 'ios') {
      const everything = Object.values(exercises).reduce((total, count) => total + count, 0);

      void (filled && everything >= setsTotal
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        : Haptics.selectionAsync());
    }

    setSaving(true);
    setSummary(withWorkoutDay(summary, date, exercises));
    cacheWorkoutDay(date, exercises);

    try {
      const result = await setWorkoutSets(route, date, exercise, sets);

      setSummary((current) => {
        const patched = withWorkoutDay(current, date, result.day.exercises);

        return patched === null ? current : { ...patched, stats: result.stats };
      });
      cacheWorkoutDay(date, result.day.exercises);
    } catch (error) {
      if (isOfflineError(error)) {
        queueWorkoutSets({ date, exercise, sets }, { dedupeKey: workoutDedupeKey(date, exercise) });

        return;
      }

      setSummary(previous);
      cacheWorkoutDay(
        date,
        previous.days.find((entry) => entry.date === date)?.exercises ?? EMPTY_EXERCISES,
      );
      Alert.alert('Could not save', 'Please try again in a moment.');
    } finally {
      setSaving(false);
    }
  }

  if (summary === null) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background p-8">
        {loadFailed ? (
          <>
            <Text className="text-center text-base text-muted">Could not load your exercises.</Text>
            <Button variant="secondary" onPress={() => void load()}>
              Try again
            </Button>
          </>
        ) : (
          <ActivityIndicator color={tint} />
        )}
      </View>
    );
  }

  const dayLabel =
    date === today
      ? 'Today'
      : new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-4 p-4 pb-16"
    >
      <Card className="gap-4">
        <View className="flex-row items-end justify-between">
          <View className="gap-0.5">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
              {dayLabel}
            </Text>
            <Text className="text-3xl font-bold text-foreground">
              {day.sets_done} of {setsTotal} sets
            </Text>
          </View>
          {summary.stats.streak > 0 ? (
            <View className="flex-row items-center gap-1 pb-1">
              <Flame size={16} color={tint} weight="fill" />
              <Text className="text-base font-semibold text-foreground">
                {summary.stats.streak}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="h-2 w-full overflow-hidden rounded-full bg-surface-selected">
          <View
            className="h-full rounded-full bg-primary-emphasis"
            style={{
              width: `${setsTotal === 0 ? 0 : Math.round((day.sets_done / setsTotal) * 100)}%`,
            }}
          />
        </View>

        {complete ? (
          <View className="flex-row items-center gap-2 rounded-2xl bg-primary px-4 py-3">
            <Sparkle size={18} color={onPrimary} weight="fill" />
            <Text className="flex-1 text-sm font-semibold text-primary-foreground">
              Routine finished. 3 points for your body.
            </Text>
          </View>
        ) : (
          <Text className="text-sm text-muted">
            {day.sets_done === 0
              ? 'One set is enough to make the day count.'
              : `${day.points} ${day.points === 1 ? 'point' : 'points'} so far. Finishing it all makes 3.`}
          </Text>
        )}

        <ExerciseWeek
          days={week}
          selected={date}
          progress={(entry) => {
            const found = summary.days.find((value) => value.date === entry);

            return found && setsTotal > 0 ? found.sets_done / setsTotal : 0;
          }}
          onSelect={setDate}
        />
      </Card>

      <Card className="gap-6">
        {summary.plan.map((entry) => (
          <ExerciseRow
            key={entry.key}
            entry={entry}
            done={day.exercises[entry.key] ?? 0}
            disabled={saving}
            onChange={(sets) => void save(entry.key, sets)}
          />
        ))}
      </Card>

      <Text className="px-4 text-center text-xs leading-5 text-muted">
        Small daily actions, big results. The whole routine earns 3 points for your body and
        anything less earns 1. Together with your exercise habit, a day tops out at 5.
      </Text>
    </ScrollView>
  );
}
