import { Stack } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { pickEmoji } from '@/components/ui/emoji-keyboard';

export default function Emoji() {
  const [picked, setPicked] = useState<string | null>(null);

  async function handlePick() {
    const emoji = await pickEmoji();
    if (emoji) {
      setPicked(emoji);
    }
  }

  return (
    <>
      <Stack.Screen.Title large>Emoji</Stack.Screen.Title>
      <View className="flex-1 items-center justify-center gap-8 bg-background p-4">
        <Text className="text-7xl">{picked ?? '🫥'}</Text>
        <Button onPress={handlePick}>Pick an emoji</Button>
      </View>
    </>
  );
}
