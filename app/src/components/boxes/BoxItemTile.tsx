import { Pressable, Text, View } from 'react-native';

import type { BoxItem } from '@/api/boxes';
import { Sticker } from '@/components/boxes/Sticker';

const TILTS = [-3, 2, 3.5, -1.5];

type BoxItemTileProperties = {
  item: BoxItem;
  size: number;
  onPress: () => void;
};

/** One thing in a box: its sticker, slightly askew like a real one, and its name. */
export function BoxItemTile({ item, size, onPress }: BoxItemTileProperties) {
  const tilt = TILTS[item.id % TILTS.length];
  const label = item.quantity > 1 ? `${item.name}, ${item.quantity} piezas` : item.name;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.notes ? `${label}. ${item.notes}` : label}
      onPress={onPress}
      className="items-center rounded-3xl pb-3 active:bg-surface-selected"
    >
      <View style={{ transform: [{ rotate: `${tilt}deg` }] }}>
        <Sticker uri={item.sticker_url} name={item.name} size={size} />
        {item.quantity > 1 ? (
          <View className="absolute right-1 top-1 h-8 min-w-8 items-center justify-center rounded-full bg-primary px-2">
            <Text className="text-sm font-bold text-primary-foreground">×{item.quantity}</Text>
          </View>
        ) : null}
      </View>
      <Text
        className="mt-1 px-2 text-center text-base font-semibold text-foreground"
        numberOfLines={2}
      >
        {item.name}
      </Text>
      {item.notes ? (
        <Text className="px-2 text-center text-sm text-muted" numberOfLines={2}>
          {item.notes}
        </Text>
      ) : null}
    </Pressable>
  );
}
