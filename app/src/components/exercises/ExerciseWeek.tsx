import { Pressable, Text, View } from 'react-native';

type ExerciseWeekProperties = {
  /** Seven ISO dates, oldest first. */
  days: string[];
  selected: string;
  /** Sets done that day over the routine's total, from 0 to 1. */
  progress: (date: string) => number;
  onSelect: (date: string) => void;
};

// The week as seven taps: how full each day was, and which one is open. Days
// this week reads kinder than an unbroken chain, and a forgotten day is one
// tap away from being filled in.
export function ExerciseWeek({ days, selected, progress, onSelect }: ExerciseWeekProperties) {
  return (
    <View className="flex-row justify-between">
      {days.map((date) => {
        const day = new Date(`${date}T12:00:00`);
        const ratio = progress(date);
        const isSelected = date === selected;

        return (
          <Pressable
            key={date}
            accessibilityRole="button"
            accessibilityLabel={day.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(date)}
            className="min-h-11 flex-1 items-center gap-1 py-1 active:opacity-70"
          >
            <Text className="text-[10px] text-muted">
              {day.toLocaleDateString('en-US', { weekday: 'narrow' })}
            </Text>
            <View
              className={`size-9 items-center justify-center rounded-full ${
                ratio >= 1
                  ? 'bg-primary'
                  : ratio > 0
                    ? 'bg-primary-emphasis/30'
                    : 'bg-surface-selected'
              } ${isSelected ? 'border-2 border-primary-emphasis' : ''}`}
            >
              <Text
                className={`text-xs font-semibold ${
                  ratio >= 1 ? 'text-primary-foreground' : 'text-foreground'
                }`}
              >
                {day.getDate()}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
