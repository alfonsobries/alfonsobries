import { CaretRight } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type ManageRowProperties = {
  emoji: string;
  title: string;
  subtitle?: string | null;
  dimmed?: boolean;
  onPress: () => void;
};

/** A row of a manage list (categories, accounts): emoji tile, name, detail. */
export function ManageRow({
  emoji,
  title,
  subtitle,
  dimmed = false,
  onPress,
}: ManageRowProperties) {
  const muted = useThemeColor('muted');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-2.5 active:bg-surface-selected"
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-xl bg-surface-selected ${dimmed ? 'opacity-50' : ''}`}
      >
        <Text className="text-xl" allowFontScaling={false}>
          {emoji}
        </Text>
      </View>
      <View className="flex-1">
        <Text className={`text-base ${dimmed ? 'text-muted' : 'text-foreground'}`}>{title}</Text>
        {subtitle ? <Text className="text-sm text-muted">{subtitle}</Text> : null}
      </View>
      <CaretRight size={16} color={muted} weight="bold" />
    </Pressable>
  );
}
