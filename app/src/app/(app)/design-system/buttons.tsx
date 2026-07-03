import { Stack } from 'expo-router';
import { Plus } from 'phosphor-react-native';
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

export default function Buttons() {
  return (
    <>
      <Stack.Screen.Title large>Buttons</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 p-4"
      >
        <Section title="Variants">
          <View className="items-start gap-3">
            <Button onPress={() => {}}>Primary</Button>
            <Button variant="secondary" onPress={() => {}}>
              Secondary
            </Button>
            <Button variant="outline" onPress={() => {}}>
              Outline
            </Button>
            <Button variant="ghost" onPress={() => {}}>
              Ghost
            </Button>
          </View>
        </Section>

        <Section title="Sizes">
          <View className="items-start gap-3">
            <Button size="sm" onPress={() => {}}>
              Small
            </Button>
            <Button size="md" onPress={() => {}}>
              Medium
            </Button>
            <Button size="lg" onPress={() => {}}>
              Large
            </Button>
          </View>
        </Section>

        <Section title="With icon">
          <View className="items-start gap-3">
            <Button icon={Plus} onPress={() => {}}>
              Add item
            </Button>
            <Button variant="outline" icon={Plus} onPress={() => {}}>
              Add item
            </Button>
          </View>
        </Section>

        <Section title="States">
          <View className="items-start gap-3">
            <Button loading onPress={() => {}}>
              Loading
            </Button>
            <Button disabled onPress={() => {}}>
              Disabled
            </Button>
          </View>
        </Section>

        <Section title="Full width">
          <View className="gap-3">
            <Button fullWidth icon={Plus} onPress={() => {}}>
              Add item
            </Button>
            <Button fullWidth variant="outline" onPress={() => {}}>
              Maybe later
            </Button>
          </View>
        </Section>
      </ScrollView>
    </>
  );
}
