import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { ReactNode, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { SegmentedControl } from '@/components/ui/SegmentedControl';

const PERIODS = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
] as const;

const STATUSES = [
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
] as const;

// The native control bakes the segment image color. `glyphDark` reads on light
// surfaces and on the gold selected fill; `glyphLight` reads on the dark-mode
// track. The selected segment always uses the dark glyph; unselected follows
// the scheme.
const VIEW_ICONS = {
  list: {
    glyphDark: require('@/assets/images/segmentIcons/list.png'),
    glyphLight: require('@/assets/images/segmentIcons/list-dark.png'),
  },
  grid: {
    glyphDark: require('@/assets/images/segmentIcons/grid.png'),
    glyphLight: require('@/assets/images/segmentIcons/grid-dark.png'),
  },
  chart: {
    glyphDark: require('@/assets/images/segmentIcons/chart.png'),
    glyphLight: require('@/assets/images/segmentIcons/chart-dark.png'),
  },
} as const;

const VIEW_VALUES = ['list', 'grid', 'chart'] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</Text>
      {children}
    </View>
  );
}

export default function Navigation() {
  const { colorScheme } = useColorScheme();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]['value']>('week');
  const [status, setStatus] = useState<(typeof STATUSES)[number]['value']>('active');
  const [view, setView] = useState<(typeof VIEW_VALUES)[number]>('list');

  const viewOptions = VIEW_VALUES.map((value) => ({
    value,
    icon: VIEW_ICONS[value][colorScheme === 'dark' ? 'glyphLight' : 'glyphDark'],
    iconSelected: VIEW_ICONS[value].glyphDark,
  }));

  return (
    <>
      <Stack.Screen.Title large>Navigation</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 p-4"
      >
        <Section title="Segmented control">
          <SegmentedControl value={period} onChange={setPeriod} options={[...PERIODS]} />
        </Section>

        <Section title="Two segments">
          <SegmentedControl value={status} onChange={setStatus} options={[...STATUSES]} />
        </Section>

        <Section title="With icons">
          <SegmentedControl value={view} onChange={setView} options={viewOptions} />
        </Section>
      </ScrollView>
    </>
  );
}
