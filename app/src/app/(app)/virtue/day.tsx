import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { useApiRouter } from '@/api/router';
import {
  cacheVirtueDay,
  fetchVirtueSummary,
  localDate,
  queueHabit,
  queueResolution,
  setHabit,
  setResolution,
  virtueDedupeKey,
  type Resolution,
  type VirtueDay,
  type VirtueHabit,
  type VirtueSummary,
} from '@/api/virtue';
import { Sheet } from '@/components/ui/Sheet';
import { HabitToggleRow } from '@/components/virtue/HabitToggleRow';
import { ResolutionPicker } from '@/components/virtue/ResolutionPicker';
import { ENTRY_HABITS } from '@/data/virtue';
import { isOfflineError } from '@/offline/connectivity';
import { cacheKeys, readCache } from '@/offline/store';

type DayPatch = Partial<Omit<VirtueDay, 'date'>>;

const EMPTY_DAY = (date: string): VirtueDay => ({
  date,
  resolution: null,
  habits: { exercise: false, diet: false, sun: false, reading: false },
  exercise_minutes: null,
  exercise_big: false,
});

// Any day of the practice, editable in one place — today from the checklist,
// a past day from the calendar. Same rows, same gestures, no special cases.
export default function VirtueDayScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const date = typeof params.date === 'string' ? params.date : localDate();
  const route = useApiRouter();

  const [day, setDay] = useState<VirtueDay>(() => EMPTY_DAY(date));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const summary = await fetchVirtueSummary(route);
        const found = summary.days.find((entry) => entry.date === date);

        if (found) {
          setDay(found);
        }
      } catch (error) {
        // Offline, the day opens on whatever the cache last saw, so a mark
        // never starts from a blank sheet and wipes what was already there.
        if (isOfflineError(error)) {
          const cached = readCache<VirtueSummary>(cacheKeys.virtueSummary)?.days.find(
            (entry) => entry.date === date,
          );

          if (cached) {
            setDay(cached);
          }
        }
      }
    })();
  }, [route, date]);

  const title = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const isToday = date === localDate();

  // Every mark lands locally first, then tells the API. Without a connection it
  // is queued instead, so a day filled in on a plane is still a filled-in day.
  const save = useCallback(
    async (patch: DayPatch, action: () => Promise<{ day: VirtueDay }>, enqueue: () => void) => {
      setSaving(true);

      const previous = day;
      setDay((current) => ({ ...current, ...patch }));
      cacheVirtueDay(date, patch);

      try {
        const result = await action();
        setDay(result.day);
        cacheVirtueDay(date, result.day);
      } catch (error) {
        if (isOfflineError(error)) {
          enqueue();
          return;
        }

        setDay(previous);
        cacheVirtueDay(date, previous);
        Alert.alert('Could not save', 'Please try again in a moment.');
      } finally {
        setSaving(false);
      }
    },
    [date, day],
  );

  function toggleHabit(habit: VirtueHabit): void {
    const completed = !day.habits[habit];

    // Measured minutes and a hand-marked big session queue under this same key,
    // so a manual toggle has to carry what the day already knew about them.
    const extras =
      habit === 'exercise' && completed
        ? {
            ...(day.exercise_minutes != null ? { minutes: day.exercise_minutes } : {}),
            ...(day.exercise_big ? { big: true } : {}),
          }
        : {};

    void save(
      { habits: { ...day.habits, [habit]: completed } },
      () => setHabit(route, date, habit, completed, extras),
      () =>
        queueHabit(
          { date, habit, completed, ...extras },
          { dedupeKey: virtueDedupeKey.habit(date, habit) },
        ),
    );
  }

  function markResolution(next: Resolution | null): void {
    void save(
      { resolution: next },
      () => setResolution(route, date, next),
      () =>
        queueResolution(
          { date, resolution: next },
          { dedupeKey: virtueDedupeKey.resolution(date) },
        ),
    );
  }

  return (
    <Sheet title={title} subtitle={isToday ? 'Today' : 'Fill in what happened'} scrollable>
      <View className="gap-4 pt-2">
        {ENTRY_HABITS.map(({ key, label, anchor, Icon }) => (
          <HabitToggleRow
            key={key}
            Icon={Icon}
            label={label}
            subtitle={anchor}
            done={day.habits[key]}
            disabled={saving}
            onToggle={() => toggleHabit(key)}
          />
        ))}

        <View className="h-px bg-border" />

        <View className="gap-3">
          <Text className="text-base font-semibold text-foreground">Daily resolution</Text>
          <ResolutionPicker value={day.resolution} disabled={saving} onChange={markResolution} />
        </View>

        <Text className="pt-2 text-center text-xs leading-5 text-muted">
          A missed day costs a little and teaches a lot — it never restarts your progress.
        </Text>
      </View>
    </Sheet>
  );
}
