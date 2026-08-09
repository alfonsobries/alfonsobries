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

// One exercise as a row of set chips. Tapping a chip fills the routine up to
// it, and tapping the last filled one takes it back — the whole exercise is
// reachable in one tap either way, which is the only interaction the routine
// needs.
export function ExerciseRow({ entry, done, disabled, onChange }: ExerciseRowProperties) {
  const { label, Icon } = EXERCISE_LABELS[entry.key];
  const tint = useThemeColor('primary-emphasis');
  const complete = done >= entry.sets;

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-3">
        <View className="size-11 items-center justify-center rounded-2xl bg-surface-selected">
          <Icon size={22} color={tint} weight="fill" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">{label}</Text>
          <Text className="text-sm text-muted">
            {entry.sets} sets of {setLabel(entry.target, entry.unit)}
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

          return (
            <Pressable
              key={set}
              accessibilityRole="button"
              accessibilityLabel={`${label}, set ${set} of ${entry.sets}`}
              accessibilityState={{ selected: filled, disabled }}
              disabled={disabled}
              onPress={() => onChange(set === done ? set - 1 : set)}
              className={`h-12 flex-1 items-center justify-center rounded-2xl ${
                filled ? 'bg-primary' : 'border-2 border-border bg-surface-selected'
              } ${disabled ? 'opacity-50' : 'active:opacity-80'}`}
            >
              <Text
                className={`text-sm font-semibold ${
                  filled ? 'text-primary-foreground' : 'text-muted'
                }`}
              >
                {setLabel(entry.target, entry.unit)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
