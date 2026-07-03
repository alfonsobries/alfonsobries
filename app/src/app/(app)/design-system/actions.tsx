import { Stack } from 'expo-router';
import { Bell, Gift, Smiley, Star } from 'phosphor-react-native';
import { type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ActionTile } from '@/components/ui/ActionTile';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</Text>
      {children}
    </View>
  );
}

const TILES = [
  { icon: Smiley, label: 'Adjust mood' },
  { icon: Star, label: 'Rewards' },
  { icon: Bell, label: 'Reminders' },
  { icon: Gift, label: 'Surprises' },
] as const;

export default function Actions() {
  return (
    <>
      <Stack.Screen.Title large>Actions</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 p-4"
      >
        <Text className="text-sm text-muted">
          Icon-forward card buttons, laid out two per row in a grid.
        </Text>

        <Section title="Grid">
          <View className="flex-row flex-wrap">
            {TILES.map((tile) => (
              <View key={tile.label} className="w-1/2 p-1.5">
                <ActionTile icon={tile.icon} label={tile.label} onPress={() => undefined} />
              </View>
            ))}
          </View>
        </Section>

        <Section title="Disabled">
          <View className="flex-row flex-wrap">
            <View className="w-1/2 p-1.5">
              <ActionTile icon={Star} label="Coming soon" disabled />
            </View>
          </View>
        </Section>
      </ScrollView>
    </>
  );
}
