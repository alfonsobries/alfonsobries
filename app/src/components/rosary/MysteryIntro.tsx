import { CaretDown, CaretUp } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Illustration } from '@/components/ui/Illustration';
import { type Mystery } from '@/data/rosary';
import { MYSTERY_ART } from '@/data/rosary-art';
import { useThemeColor } from '@/hooks/use-theme-color';

/**
 * The contemplative opening of a decade: the mystery's art, its fruit, and the
 * full Gospel passage, with the deeper meditation tucked behind "Saber más".
 */
export function MysteryIntro({ mystery }: { mystery: Mystery }) {
  const [showMore, setShowMore] = useState(false);
  const emphasis = useThemeColor('primary-emphasis');

  const Caret = showMore ? CaretUp : CaretDown;

  return (
    <View className="gap-5">
      <View className="w-full overflow-hidden rounded-3xl" style={{ aspectRatio: 1 }}>
        <Illustration source={MYSTERY_ART[mystery.key]} contentFit="cover" transition={300} />
      </View>

      <View className="gap-1">
        <Text className="text-xs font-semibold uppercase tracking-wider text-primary-emphasis">
          {mystery.ordinal}
        </Text>
        <Text className="text-3xl font-bold text-foreground">{mystery.title}</Text>
      </View>

      <View className="flex-row">
        <View className="rounded-full bg-surface-selected px-3.5 py-1.5">
          <Text className="text-sm font-medium text-foreground">Fruto: {mystery.fruit}</Text>
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
          Evangelio · {mystery.citation}
        </Text>
        {mystery.gospel.map((paragraph, index) => (
          <Text key={index} className="text-lg leading-8 text-foreground">
            {paragraph}
          </Text>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setShowMore((current) => !current)}
        className="flex-row items-center gap-1.5 active:opacity-70"
      >
        <Text className="text-base font-semibold text-primary-emphasis">
          {showMore ? 'Ver menos' : 'Saber más de este misterio'}
        </Text>
        <Caret size={16} color={emphasis} weight="bold" />
      </Pressable>

      {showMore ? (
        <Animated.View entering={FadeIn} className="gap-3 rounded-2xl bg-surface-selected p-4">
          {mystery.meditation.map((paragraph, index) => (
            <Text key={index} className="text-base leading-7 text-foreground">
              {paragraph}
            </Text>
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
}
