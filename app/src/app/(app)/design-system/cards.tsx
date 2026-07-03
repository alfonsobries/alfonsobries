import { Stack } from 'expo-router';
import { type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</Text>
      {children}
    </View>
  );
}

export default function Cards() {
  return (
    <>
      <Stack.Screen.Title large>Cards</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 p-4"
      >
        <Section title="Basic">
          <Card>
            <Text className="text-base font-semibold text-foreground">Card title</Text>
            <Text className="mt-1 text-sm text-muted">
              A surface container with rounded corners and padding.
            </Text>
          </Card>
        </Section>

        <Section title="Pressable">
          <Card onPress={() => undefined}>
            <Text className="text-base font-semibold text-foreground">Tap me</Text>
            <Text className="mt-1 text-sm text-muted">
              Pass `onPress` to make the whole card tappable.
            </Text>
          </Card>
        </Section>

        <Section title="In a row">
          <View className="flex-row gap-3">
            <Card className="flex-1 items-center gap-1">
              <Text className="text-2xl">😀</Text>
              <Text className="text-sm font-semibold text-foreground">First</Text>
            </Card>
            <Card className="flex-1 items-center gap-1">
              <Text className="text-2xl">😌</Text>
              <Text className="text-sm font-semibold text-foreground">Second</Text>
            </Card>
          </View>
        </Section>
      </ScrollView>
    </>
  );
}
