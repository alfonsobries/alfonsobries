import { CaretLeft, CaretRight } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type CalendarDayMark = {
  /** Fills the day circle — the primary signal of the day's state. */
  tone?: 'primary' | 'danger' | 'muted';
  /** Small dots under the number — a secondary count signal (capped at four). */
  dots?: number;
};

type MonthCalendarProperties = {
  /** Any date inside the month to display. */
  month: Date;
  onMonthChange: (next: Date) => void;
  /** Marks keyed by ISO date (YYYY-MM-DD). */
  marks: Record<string, CalendarDayMark>;
  /** Days after this ISO date render dimmed and can't be pressed. */
  maxDate?: string;
  onPressDay?: (date: string) => void;
};

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const TONE_FILL: Record<NonNullable<CalendarDayMark['tone']>, string> = {
  primary: 'bg-primary',
  danger: 'bg-danger/15',
  muted: 'bg-surface-selected',
};

const TONE_LABEL: Record<NonNullable<CalendarDayMark['tone']>, string> = {
  primary: 'text-primary-foreground font-semibold',
  danger: 'text-danger font-semibold',
  muted: 'text-foreground',
};

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${`${month + 1}`.padStart(2, '0')}-${`${day}`.padStart(2, '0')}`;
}

// A month grid with per-day marks. Presentation only — the caller owns the
// displayed month and whatever the marks mean.
export function MonthCalendar({
  month,
  onMonthChange,
  marks,
  maxDate,
  onPressDay,
}: MonthCalendarProperties) {
  const tint = useThemeColor('primary-emphasis');
  const dotColor = useThemeColor('primary-emphasis');
  const mutedTint = useThemeColor('muted');

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const today = new Date();
  const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate());

  const title = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const nextMonth = new Date(year, monthIndex + 1, 1);
  const atForwardEdge =
    maxDate !== undefined && isoDate(nextMonth.getFullYear(), nextMonth.getMonth(), 1) > maxDate;

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: (number | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          hitSlop={12}
          onPress={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
          className="size-9 items-center justify-center rounded-full active:bg-surface-selected"
        >
          <CaretLeft size={18} color={tint} weight="bold" />
        </Pressable>

        <Text className="text-base font-semibold text-foreground">{title}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          hitSlop={12}
          disabled={atForwardEdge}
          onPress={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
          className={`size-9 items-center justify-center rounded-full ${atForwardEdge ? 'opacity-30' : 'active:bg-surface-selected'}`}
        >
          <CaretRight size={18} color={atForwardEdge ? mutedTint : tint} weight="bold" />
        </Pressable>
      </View>

      <View className="flex-row">
        {WEEKDAYS.map((label, index) => (
          <View key={`${label}-${index}`} className="flex-1 items-center py-1">
            <Text className="text-xs font-medium text-muted">{label}</Text>
          </View>
        ))}
      </View>

      <View className="gap-1">
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} className="flex-row">
            {week.map((day, dayIndex) => {
              if (day === null) {
                return <View key={dayIndex} className="flex-1 py-0.5" />;
              }

              const iso = isoDate(year, monthIndex, day);
              const mark = marks[iso];
              const isFuture = maxDate !== undefined && iso > maxDate;
              const isToday = iso === todayIso;

              return (
                <View key={dayIndex} className="flex-1 items-center py-0.5">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={iso}
                    disabled={isFuture || !onPressDay}
                    onPress={() => onPressDay?.(iso)}
                    className={`size-10 items-center justify-center rounded-full ${
                      mark?.tone ? TONE_FILL[mark.tone] : ''
                    } ${isToday && !mark?.tone ? 'border border-border' : ''} ${
                      onPressDay && !isFuture ? 'active:opacity-70' : ''
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        mark?.tone ? TONE_LABEL[mark.tone] : 'text-foreground'
                      } ${isFuture ? 'opacity-30' : ''}`}
                    >
                      {day}
                    </Text>
                    <View className="absolute bottom-1 flex-row gap-0.5">
                      {Array.from({ length: Math.min(4, mark?.dots ?? 0) }, (_, index) => (
                        <View
                          key={index}
                          className="size-1 rounded-full"
                          style={{ backgroundColor: dotColor }}
                        />
                      ))}
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
