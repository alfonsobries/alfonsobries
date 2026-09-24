import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'phosphor-react-native';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** A photo from the chat (usually a receipt), full screen with pinch to zoom. */
export default function PhotoScreen() {
  const { url } = useLocalSearchParams<{ url?: string }>();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        maximumZoomScale={4}
        minimumZoomScale={1}
        centerContent
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ width, height }}
      >
        {url ? (
          <Image
            source={{ uri: url }}
            contentFit="contain"
            style={{ width, height }}
            accessibilityLabel="Foto"
          />
        ) : null}
      </ScrollView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
        onPress={() => router.back()}
        hitSlop={8}
        className="absolute right-4 h-10 w-10 items-center justify-center rounded-full bg-white/20 active:opacity-60"
        style={{ top: insets.top + 8 }}
      >
        <X size={20} color="#ffffff" weight="bold" />
      </Pressable>
    </View>
  );
}
