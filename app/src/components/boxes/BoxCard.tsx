import { CaretRight } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { piecesIn, type Box } from '@/api/boxes';
import { Sticker } from '@/components/boxes/Sticker';
import { useThemeColor } from '@/hooks/use-theme-color';

const PREVIEW_COUNT = 5;
const PREVIEW_SIZE = 52;

type BoxCardProperties = {
  box: Box;
  onPress: () => void;
};

export function describeBox(box: Box): string {
  const pieces = piecesIn(box);
  const count = pieces === 0 ? 'Vacía' : pieces === 1 ? '1 cosa' : `${pieces} cosas`;

  return box.location ? `${box.location} · ${count}` : count;
}

/** A box in the list: its emoji and name, where it lives, and a peek inside. */
export function BoxCard({ box, onPress }: BoxCardProperties) {
  const muted = useThemeColor('muted');
  const preview = box.items.filter((item) => item.sticker_url).slice(0, PREVIEW_COUNT);
  const description = describeBox(box);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${box.name}, ${description}`}
      onPress={onPress}
      className="gap-3 rounded-3xl bg-surface p-4 active:bg-surface-selected"
    >
      <View className="flex-row items-center gap-3">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-surface-selected">
          <Text className="text-3xl" allowFontScaling={false}>
            {box.emoji}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground" numberOfLines={2}>
            {box.name}
          </Text>
          <Text className="text-sm text-muted" numberOfLines={1}>
            {description}
          </Text>
        </View>
        <CaretRight size={16} color={muted} weight="bold" />
      </View>

      {preview.length > 0 ? (
        <View className="flex-row items-center" importantForAccessibility="no-hide-descendants">
          {preview.map((item, index) => (
            <View
              key={item.id}
              style={{
                marginLeft: index === 0 ? 0 : -10,
                transform: [{ rotate: `${index % 2 === 0 ? -4 : 4}deg` }],
              }}
            >
              <Sticker uri={item.sticker_url} name={item.name} size={PREVIEW_SIZE} />
            </View>
          ))}
          {box.items.length > preview.length ? (
            <Text className="ml-2 text-sm font-medium text-muted">
              +{box.items.length - preview.length}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}
