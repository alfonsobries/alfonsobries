import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { useThemeColor } from '@/hooks/use-theme-color';
import { formatDuration } from '@/lib/line-time';

type RecordingBarProperties = {
  durationMillis: number;
  levels: number[];
};

const SLOTS = 40;

/** The live state of a voice note: a pulsing dot, the elapsed time and the levels. */
export function RecordingBar({ durationMillis, levels }: RecordingBarProperties) {
  const danger = useThemeColor('danger');
  const foreground = useThemeColor('foreground');
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.3, { duration: 700 }), -1, true);
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const padded = [
    ...Array.from({ length: Math.max(0, SLOTS - levels.length) }, () => 0),
    ...levels,
  ];

  return (
    <View
      className="h-11 flex-1 flex-row items-center gap-3 px-2"
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={`Grabando nota de voz, ${formatDuration(durationMillis / 1000)}`}
    >
      <Animated.View
        style={[dotStyle, { backgroundColor: danger }]}
        className="h-2.5 w-2.5 rounded-full"
      />
      <Text className="w-10 text-[15px] tabular-nums text-foreground">
        {formatDuration(durationMillis / 1000)}
      </Text>
      <View className="h-8 flex-1 flex-row items-center justify-end gap-[2px] overflow-hidden">
        {padded.map((level, index) => (
          <View
            key={index}
            style={{
              height: 3 + level * 26,
              backgroundColor: foreground,
              opacity: 0.25 + level * 0.6,
            }}
            className="w-[3px] rounded-full"
          />
        ))}
      </View>
    </View>
  );
}
