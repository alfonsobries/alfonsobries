import { useState } from 'react';

import { type CalendarDayMark, MonthCalendar } from '@/components/ui/MonthCalendar';

export type DateRange = {
  /** ISO date (YYYY-MM-DD) of the first day, or null before any pick. */
  start: string | null;
  /** ISO date of the last day, inclusive. Null while the end is still being picked. */
  end: string | null;
};

type DateRangeCalendarProperties = {
  value: DateRange;
  onChange: (next: DateRange) => void;
  /** Days before this ISO date can't be picked. */
  minDate?: string;
  locale?: string;
  weekdayLabels?: string[];
};

function monthOf(iso: string | null): Date {
  if (!iso) {
    return new Date();
  }

  const [year, month] = iso.split('-').map(Number);

  return new Date(year, month - 1, 1);
}

function daysBetween(start: string, end: string): string[] {
  const days: string[] = [];
  const [year, month, day] = start.split('-').map(Number);
  const cursor = new Date(Date.UTC(year, month - 1, day));

  while (cursor.toISOString().slice(0, 10) <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

/**
 * A month grid for picking a span of days: the first tap sets the start, the
 * second the end. A tap before the start, or once both are set, starts over.
 */
export function DateRangeCalendar({
  value,
  onChange,
  minDate,
  locale,
  weekdayLabels,
}: DateRangeCalendarProperties) {
  const [month, setMonth] = useState(() => monthOf(value.start));

  const marks: Record<string, CalendarDayMark> = {};

  if (value.start) {
    const end = value.end ?? value.start;

    for (const day of daysBetween(value.start, end)) {
      marks[day] = { tone: day === value.start || day === end ? 'primary' : 'muted' };
    }
  }

  const handlePressDay = (day: string): void => {
    if (value.start === null || value.end !== null || day < value.start) {
      onChange({ start: day, end: null });
      return;
    }

    onChange({ start: value.start, end: day });
  };

  return (
    <MonthCalendar
      month={month}
      onMonthChange={setMonth}
      marks={marks}
      minDate={minDate}
      locale={locale}
      weekdayLabels={weekdayLabels}
      onPressDay={handlePressDay}
    />
  );
}
