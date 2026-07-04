import { Image, type ImageSource } from 'expo-image';
import { CaretRight } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { useThemeColor } from '@/hooks/use-theme-color';

type IllustratedButtonProperties = {
  image: ImageSource | number;
  label: string;
  subtitle?: string;
  onPress: () => void;
};

// A big section button led by a bundled illustration — the kid-friendly
// doorway into a whole area (chores, behaviors…).
export function IllustratedButton({
  image,
  label,
  subtitle,
  onPress,
}: IllustratedButtonProperties) {
  const muted = useThemeColor('muted');

  return (
    <Card accessibilityLabel={label} onPress={onPress} className="flex-row items-center gap-3 p-3">
      <View className="size-16 items-center justify-center overflow-hidden rounded-2xl bg-surface-selected">
        <Image source={image} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
          {label}
        </Text>
        {subtitle ? (
          <Text className="text-sm text-muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <CaretRight size={20} color={muted} />
    </Card>
  );
}
