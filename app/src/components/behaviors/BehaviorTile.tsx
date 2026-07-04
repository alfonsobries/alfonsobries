import { Image } from 'expo-image';
import { HandPalm } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import type { Behavior } from '@/api/behaviors';
import { Card } from '@/components/ui/Card';
import { useThemeColor } from '@/hooks/use-theme-color';

type BehaviorTileProperties = {
  behavior: Behavior;
  onPress?: () => void;
};

// A big, illustration-forward button for one behavior. Sized for a kid to
// recognize at a glance; the tap itself is confirmed by a parent with Face ID.
export function BehaviorTile({ behavior, onPress }: BehaviorTileProperties) {
  const accent = useThemeColor('primary-emphasis');

  return (
    <Card accessibilityLabel={behavior.name} onPress={onPress} className="gap-3 p-3">
      <View
        className="items-center justify-center overflow-hidden rounded-2xl bg-surface-selected"
        style={{ aspectRatio: 1 }}
      >
        {behavior.image_url ? (
          <Image
            source={{ uri: behavior.image_url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <HandPalm size={40} color={accent} weight="fill" />
        )}
      </View>
      <Text className="px-1 text-base font-semibold text-foreground" numberOfLines={1}>
        {behavior.name}
      </Text>
    </Card>
  );
}
