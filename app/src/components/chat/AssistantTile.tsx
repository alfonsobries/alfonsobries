import { Text, View } from 'react-native';

import type { Assistant } from '@/api/chat';
import { Card } from '@/components/ui/Card';

type AssistantTileProperties = {
  assistant: Assistant;
  onPress: () => void;
};

/** A tappable entry for one assistant on the chat home screen. */
export function AssistantTile({ assistant, onPress }: AssistantTileProperties) {
  return (
    <Card accessibilityLabel={assistant.name} onPress={onPress} className="w-40 gap-1">
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-surface-selected">
        <Text className="text-2xl">{assistant.emoji ?? '💬'}</Text>
      </View>
      <Text className="mt-1 text-base font-semibold text-foreground" numberOfLines={1}>
        {assistant.name}
      </Text>
      {assistant.description ? (
        <Text className="text-xs leading-4 text-muted" numberOfLines={2}>
          {assistant.description}
        </Text>
      ) : null}
    </Card>
  );
}
