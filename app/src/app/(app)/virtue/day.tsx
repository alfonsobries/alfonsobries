import { router, useLocalSearchParams } from 'expo-router';
import { Check, HandsPraying } from 'phosphor-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { useApiRouter } from '@/api/router';
import {
  completePrayers,
  fetchVirtueSummary,
  localDate,
  setHabit,
  setResolution,
  type Resolution,
  type VirtueDay,
  type VirtueHabit,
} from '@/api/virtue';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { HabitToggleRow } from '@/components/virtue/HabitToggleRow';
import { ResolutionPicker } from '@/components/virtue/ResolutionPicker';
import { ENTRY_HABITS } from '@/data/virtue';
import { useThemeColor } from '@/hooks/use-theme-color';

const EMPTY_DAY = (date: string): VirtueDay => ({
  date,
  prayers_completed: false,
  resolution: null,
  habits: { exercise: false, diet: false, reading: false },
});

// Any day of the practice, editable in one place — today from the checklist,
// a past day from the calendar. Same rows, same gestures, no special cases.
export default function VirtueDayScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const date = typeof params.date === 'string' ? params.date : localDate();
  const route = useApiRouter();
  const tint = useThemeColor('primary-emphasis');
  const onPrimary = useThemeColor('primary-foreground');

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
      } catch {
        // The sheet still works from the empty state; saving syncs it.
      }
    })();
  }, [route, date]);

  const title = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const isToday = date === localDate();

  const save = useCallback(async (action: () => Promise<{ day: VirtueDay }>) => {
    setSaving(true);

    try {
      const result = await action();
      setDay(result.day);
    } catch {
      Alert.alert('Could not save', 'Please try again in a moment.');
    } finally {
      setSaving(false);
    }
  }, []);

  function toggleHabit(habit: VirtueHabit): void {
    void save(() => setHabit(route, date, habit, !day.habits[habit]));
  }

  function markResolution(next: Resolution | null): void {
    void save(() => setResolution(route, date, next));
  }

  function markPrayers(): void {
    if (isToday) {
      router.back();
      router.push('/virtue/prayers');
      return;
    }

    void save(() => completePrayers(route, date));
  }

  return (
    <Sheet title={title} subtitle={isToday ? 'Today' : 'Fill in what happened'} scrollable>
      <View className="gap-4 pt-2">
        <View className="flex-row items-center gap-3">
          <View className="size-11 items-center justify-center rounded-2xl bg-surface-selected">
            <HandsPraying size={22} color={tint} weight="fill" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">Daily prayers</Text>
            <Text className="text-sm text-muted">
              {day.prayers_completed
                ? 'Completed'
                : isToday
                  ? 'Not prayed yet'
                  : 'Mark them if they happened'}
            </Text>
          </View>
          {day.prayers_completed ? (
            <View
              className="size-9 items-center justify-center rounded-full bg-primary"
              accessibilityLabel="Prayers completed"
            >
              <Check size={18} color={onPrimary} weight="bold" />
            </View>
          ) : (
            <Button size="sm" disabled={saving} onPress={markPrayers}>
              {isToday ? 'Pray' : 'Prayed'}
            </Button>
          )}
        </View>

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
