import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

function Dot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1, { duration: 360 }), withTiming(0.3, { duration: 360 })),
        -1,
      ),
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={style} className="h-2 w-2 rounded-full bg-muted" />;
}

/** The assistant is working on an answer. */
export function TypingIndicator() {
  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      accessible
      accessibilityLabel="Pensando"
      className="items-start"
    >
      <View className="flex-row gap-1.5 rounded-3xl rounded-bl-lg bg-surface px-4 py-4">
        <Dot delay={0} />
        <Dot delay={160} />
        <Dot delay={320} />
      </View>
    </Animated.View>
  );
}
