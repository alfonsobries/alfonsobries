import { Text, View } from 'react-native';

import { localDate } from '@/api/virtue';

type WeekStripProperties = {
  /** ISO dates (YYYY-MM-DD) on which the habit was completed. */
  completed: ReadonlySet<string>;
};

/** The last seven calendar days ending today, oldest first. */
export function lastSevenDays(): string[] {
  const now = new Date();

  return Array.from({ length: 7 }, (_, index) =>
    localDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index))),
  );
}

// A habit's week at a glance: seven dots ending today. Research on habit
// formation favors this flexible "days this week" framing over all-or-nothing
// streaks — a missed day reads as one empty dot, not a broken chain.
export function WeekStrip({ completed }: WeekStripProperties) {
  const days = lastSevenDays();

  return (
    <View className="flex-row items-center gap-2">
      {days.map((date) => {
        const done = completed.has(date);
        const weekday = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
          weekday: 'narrow',
        });

        return (
          <View key={date} className="items-center gap-1">
            <Text className="text-[10px] text-muted">{weekday}</Text>
            <View
              className={`size-2.5 rounded-full ${done ? 'bg-primary-emphasis' : 'bg-surface-selected'}`}
            />
          </View>
        );
      })}
    </View>
  );
}
