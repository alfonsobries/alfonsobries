import { Image } from 'expo-image';
import { useState } from 'react';
import { Text, View } from 'react-native';

type StickerProperties = {
  uri: string | null;
  /** Used for the stand-in when there is no picture. */
  name: string;
  size: number;
};

/**
 * An item's die-cut sticker, fitted into a fixed square so grids never jump
 * while it loads. A soft tile holds its place until the picture arrives;
 * without a picture, the item's initial stands in on that tile.
 */
export function Sticker({ uri, name, size }: StickerProperties) {
  const [loadedUri, setLoadedUri] = useState<string | null>(null);
  const loaded = uri !== null && loadedUri === uri;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      {loaded ? null : (
        <View
          style={{ width: size * 0.78, height: size * 0.78, borderRadius: size * 0.2 }}
          className="absolute items-center justify-center border-4 border-background bg-surface-selected"
        >
          {uri ? null : (
            <Text
              style={{ fontSize: size * 0.32 }}
              className="font-bold text-muted"
              allowFontScaling={false}
            >
              {name.trim().charAt(0).toUpperCase() || '?'}
            </Text>
          )}
        </View>
      )}
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          contentFit="contain"
          transition={150}
          recyclingKey={uri}
          onLoad={() => setLoadedUri(uri)}
          accessibilityIgnoresInvertColors
        />
      ) : null}
    </View>
  );
}
