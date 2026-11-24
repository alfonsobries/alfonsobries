import { Image } from 'expo-image';
import { Text, View } from 'react-native';

type StickerProperties = {
  uri: string | null;
  /** Used for the stand-in when there is no picture. */
  name: string;
  size: number;
};

/**
 * An item's die-cut sticker, fitted into a fixed square so grids never jump
 * while it loads. Without a picture, the item's initial stands in on a tile.
 */
export function Sticker({ uri, name, size }: StickerProperties) {
  if (!uri) {
    return (
      <View style={{ width: size, height: size }} className="items-center justify-center">
        <View
          style={{ width: size * 0.78, height: size * 0.78, borderRadius: size * 0.2 }}
          className="items-center justify-center border-4 border-background bg-surface-selected"
        >
          <Text
            style={{ fontSize: size * 0.32 }}
            className="font-bold text-muted"
            allowFontScaling={false}
          >
            {name.trim().charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size }}
      contentFit="contain"
      transition={150}
      recyclingKey={uri}
      accessibilityIgnoresInvertColors
    />
  );
}
