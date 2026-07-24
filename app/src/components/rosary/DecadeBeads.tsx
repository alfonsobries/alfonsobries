import { useMemo } from 'react';
import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { type RosaryBead } from '@/data/rosary';
import { useThemeColor } from '@/hooks/use-theme-color';

const PATER_SIZE = 26;
const AVE_SIZE = 16;
/** How far the chain sags at its middle, like a real hanging rosary. */
const SAG = 9;

/**
 * One decade of the rosary as a hanging chain: the large Padre Nuestro bead
 * followed by ten small Ave María beads. Beads fill as they are prayed; the
 * current one glows and pops in.
 */
export function DecadeBeads({ bead }: { bead: RosaryBead }) {
  const filled = useThemeColor('primary-emphasis');
  const glow = useThemeColor('primary');
  const rest = useThemeColor('border');

  const beads = useMemo(
    () =>
      Array.from({ length: 11 }, (_, index) => ({
        index,
        size: index === 0 ? PATER_SIZE : AVE_SIZE,
        // The chain dips toward the middle and rises at both ends.
        sag: Math.round(SAG * Math.sin((Math.PI * index) / 10)),
      })),
    [],
  );

  return (
    <View className="h-16 flex-row items-center justify-between px-1">
      {beads.map(({ index, size, sag }) => {
        const isDone = index < bead.index;
        const isCurrent = index === bead.index;

        const base = {
          width: size,
          height: size,
          borderRadius: size / 2,
          marginTop: sag * 2,
          backgroundColor: isDone || isCurrent ? filled : 'transparent',
          borderWidth: isDone || isCurrent ? 0 : 1.5,
          borderColor: rest,
        };

        if (isCurrent) {
          return (
            <Animated.View
              key={`${index}-current`}
              entering={ZoomIn.springify().damping(12)}
              style={[
                base,
                {
                  transform: [{ scale: 1.3 }],
                  shadowColor: glow,
                  shadowOpacity: 0.9,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 6,
                },
              ]}
            />
          );
        }

        return <View key={index} style={base} />;
      })}
    </View>
  );
}
