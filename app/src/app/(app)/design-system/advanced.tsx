import { Stack } from 'expo-router';
import { ReactNode, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { pickEmoji } from '@/components/ui/emoji-keyboard';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</Text>
      {children}
    </View>
  );
}

export default function Advanced() {
  const [picked, setPicked] = useState<string | null>(null);

  async function handlePick() {
    const emoji = await pickEmoji();
    if (emoji) {
      setPicked(emoji);
    }
  }

  return (
    <>
      <Stack.Screen.Title large>Advanced</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 p-4"
      >
        <Section title="Emoji picker">
          <Text className="text-sm text-muted">
            Opens the native iOS emoji keyboard and returns the picked emoji.
          </Text>
          <View className="flex-row items-center gap-3">
            <Button onPress={handlePick}>Pick an emoji</Button>
            <View className="size-12 items-center justify-center rounded-xl bg-surface-selected">
              <Text className="text-2xl">{picked ?? '🫥'}</Text>
            </View>
          </View>
        </Section>
      </ScrollView>
    </>
  );
}
