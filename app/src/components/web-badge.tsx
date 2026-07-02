import { version } from 'expo/package.json';
import { Image } from 'expo-image';
import { useColorScheme } from 'nativewind';
import { Text, View } from 'react-native';

export function WebBadge() {
  const { colorScheme } = useColorScheme();

  return (
    <View className="items-center gap-2 p-8">
      <Text className="text-center font-mono text-xs text-muted">v{version}</Text>
      <Image
        source={
          colorScheme === 'dark'
            ? require('@/assets/images/expo-badge-white.png')
            : require('@/assets/images/expo-badge.png')
        }
        style={{ width: 123, aspectRatio: 123 / 24 }}
      />
    </View>
  );
}
