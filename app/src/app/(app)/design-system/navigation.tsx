import { Stack } from 'expo-router';
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

const VIEWS = [
  { value: 'list', icon: require('@/assets/images/segmentIcons/list.png') },
  { value: 'grid', icon: require('@/assets/images/segmentIcons/grid.png') },
  { value: 'chart', icon: require('@/assets/images/segmentIcons/chart.png') },
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</Text>
      {children}
    </View>
  );
}

export default function Navigation() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]['value']>('week');
  const [status, setStatus] = useState<(typeof STATUSES)[number]['value']>('active');
  const [view, setView] = useState<(typeof VIEWS)[number]['value']>('list');

  return (
    <>
      <Stack.Screen.Title large>Navigation</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 p-4">
        <Section title="Segmented control">
          <SegmentedControl value={period} onChange={setPeriod} options={[...PERIODS]} />
        </Section>

        <Section title="Two segments">
          <SegmentedControl value={status} onChange={setStatus} options={[...STATUSES]} />
        </Section>

        <Section title="With icons">
          <SegmentedControl value={view} onChange={setView} options={[...VIEWS]} />
        </Section>
      </ScrollView>
    </>
  );
}
