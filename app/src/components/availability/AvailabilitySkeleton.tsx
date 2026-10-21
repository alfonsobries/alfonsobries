import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/** Placeholder blocks shaped like the screen, pulsing while the first load runs. */
export function AvailabilitySkeleton() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.45, { duration: 800 }), -1, true);
  }, [opacity]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={pulse}
      className="gap-6"
      accessibilityLabel="Cargando disponibilidad"
      accessible
    >
      <View className="h-40 rounded-3xl bg-surface" />
      <View className="flex-row gap-3">
        <View className="h-24 flex-1 rounded-3xl bg-surface" />
        <View className="h-24 flex-1 rounded-3xl bg-surface" />
        <View className="h-24 flex-1 rounded-3xl bg-surface" />
      </View>
      <View className="h-32 rounded-3xl bg-surface" />
      <View className="h-24 rounded-3xl bg-surface" />
    </Animated.View>
  );
}
