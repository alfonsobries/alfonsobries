import { router, Stack } from 'expo-router';
import { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</Text>
      {children}
    </View>
  );
}

export default function Overlays() {
  return (
    <>
      <Stack.Screen.Title large>Overlays</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 p-4">
        <Section title="Sheet · medium → full">
          <Text className="text-sm text-muted">
            Native form sheet, draggable between half and full height.
          </Text>
          <View className="items-start">
            <Button onPress={() => router.push('/design-system/sheet')}>Open sheet</Button>
          </View>
        </Section>

        <Section title="Sheet · compact">
          <Text className="text-sm text-muted">A shorter native sheet at a fixed height.</Text>
          <View className="items-start">
            <Button onPress={() => router.push('/design-system/sheet-fit')}>Open compact sheet</Button>
          </View>
        </Section>
      </ScrollView>
    </>
  );
}
