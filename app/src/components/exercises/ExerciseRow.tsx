import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { type WorkoutPlanEntry } from '@/api/workout';
import { EXERCISE_LABELS, setLabel } from '@/data/workout';
import { useThemeColor } from '@/hooks/use-theme-color';

type ExerciseRowProperties = {
  entry: WorkoutPlanEntry;
  /** Sets already done today, from 0 to `entry.sets`. */
  done: number;
  disabled: boolean;
  onChange: (sets: number) => void;
};

type Hold = { set: number; remaining: number };

// One exercise as a row of set chips. Tapping a chip fills the routine up to
// it, and tapping the last filled one takes it back — the whole exercise is
// reachable in one tap either way. A timed hold runs its clock first, because
// counting a minute in your head is exactly the friction that ends a routine;
// holding the chip marks it without the clock.
export function ExerciseRow({ entry, done, disabled, onChange }: ExerciseRowProperties) {
  const { label, Icon } = EXERCISE_LABELS[entry.key];
  const tint = useThemeColor('primary-emphasis');
  const timed = entry.unit === 'seconds';
  const complete = done >= entry.sets;

  const [hold, setHold] = useState<Hold | null>(null);

  // The callback is read when the clock ends, so a parent re-render never
  // restarts the countdown.
  const latest = useRef(onChange);

  useEffect(() => {
    latest.current = onChange;
  });

  useEffect(() => {
    if (hold === null) {
      return;
    }

    if (hold.remaining <= 0) {
      const finish = setTimeout(() => {
        if (process.env.EXPO_OS === 'ios') {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        latest.current(hold.set);
        setHold(null);
      }, 0);

      return () => clearTimeout(finish);
    }

    const tick = setTimeout(() => setHold({ set: hold.set, remaining: hold.remaining - 1 }), 1000);

    return () => clearTimeout(tick);
  }, [hold]);

  function press(set: number): void {
    if (hold?.set === set) {
      setHold(null);

      return;
    }

    // Unmarking never runs a clock, and neither does refilling a set already done.
    if (timed && set > done) {
      if (process.env.EXPO_OS === 'ios') {
        void Haptics.selectionAsync();
      }

      setHold({ set, remaining: entry.target });

      return;
    }

    setHold(null);
    onChange(set === done ? set - 1 : set);
  }

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-3">
        <View className="size-11 items-center justify-center rounded-2xl bg-surface-selected">
          <Icon size={22} color={tint} weight="fill" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">{label}</Text>
          <Text className="text-sm text-muted">
            {timed
              ? `${entry.sets} holds of ${setLabel(entry.target, entry.unit)}. Tap to time one, hold to just mark it.`
              : `${entry.sets} sets of ${setLabel(entry.target, entry.unit)}`}
          </Text>
        </View>
        <Text
          className={`text-sm font-semibold ${complete ? 'text-primary-emphasis' : 'text-muted'}`}
        >
          {done}/{entry.sets}
        </Text>
      </View>

      <View className="flex-row gap-2">
        {Array.from({ length: entry.sets }, (_, index) => index + 1).map((set) => {
          const filled = set <= done;
          const running = hold?.set === set;

          return (
            <Pressable
              key={set}
              accessibilityRole="button"
              accessibilityLabel={
                running
                  ? `${label}, set ${set} of ${entry.sets}, ${hold?.remaining ?? 0} seconds left. Tap to stop.`
                  : `${label}, set ${set} of ${entry.sets}`
              }
              accessibilityState={{ selected: filled, disabled: disabled && !running }}
              disabled={disabled && !running}
              onPress={() => press(set)}
              onLongPress={timed ? () => onChange(set === done ? set - 1 : set) : undefined}
              className={`h-12 flex-1 items-center justify-center rounded-2xl ${
                running
                  ? 'border-2 border-primary-emphasis bg-surface-selected'
                  : filled
                    ? 'bg-primary'
                    : 'border-2 border-border bg-surface-selected'
              } ${disabled && !running ? 'opacity-50' : 'active:opacity-80'}`}
            >
              <Text
                className={`text-sm font-semibold ${
                  running
                    ? 'text-primary-emphasis'
                    : filled
                      ? 'text-primary-foreground'
                      : 'text-muted'
                }`}
              >
                {running && hold ? `${hold.remaining}s` : setLabel(entry.target, entry.unit)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
