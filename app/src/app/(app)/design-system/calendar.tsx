import { Stack } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { localDate } from '@/api/virtue';
import { Card } from '@/components/ui/Card';
import { MonthCalendar, type CalendarDayMark } from '@/components/ui/MonthCalendar';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</Text>
      {children}
    </View>
  );
}

function sampleMarks(): Record<string, CalendarDayMark> {
  const marks: Record<string, CalendarDayMark> = {};
  const now = new Date();

  for (let offset = 1; offset <= 12; offset += 1) {
    const date = localDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset));
    marks[date] = {
      tone: offset === 5 ? 'danger' : offset % 3 === 0 ? undefined : 'primary',
      dot: offset % 2 === 0,
    };
  }

  return marks;
}

export default function Calendar() {
  const [month, setMonth] = useState(() => new Date());

  return (
    <>
      <Stack.Screen.Title large>Calendar</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 p-4"
      >
        <Section title="Month with marks">
          <Card>
            <MonthCalendar
              month={month}
              onMonthChange={setMonth}
              marks={sampleMarks()}
              maxDate={localDate()}
              onPressDay={() => undefined}
            />
          </Card>
          <Text className="text-sm text-muted">
            Day tones (primary, danger) fill the circle; the dot is an independent secondary marker.
            Days after `maxDate` are dimmed and inert.
          </Text>
        </Section>
      </ScrollView>
    </>
  );
}
