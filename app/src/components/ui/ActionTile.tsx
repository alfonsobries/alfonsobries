import { type Icon } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { useThemeColor } from '@/hooks/use-theme-color';

type ActionTileProperties = {
  icon: Icon;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
};

// A big, icon-forward card button meant to sit in a grid. The oversized glyph
// keeps it legible for kids even when the action itself is gated.
export function ActionTile({
  icon: Glyph,
  label,
  onPress,
  disabled = false,
}: ActionTileProperties) {
  const accent = useThemeColor('primary-emphasis');

  return (
    <Card
      accessibilityLabel={label}
      onPress={disabled ? undefined : onPress}
      className={`items-start gap-3 ${disabled ? 'opacity-50' : ''}`}
    >
      <View className="size-14 items-center justify-center rounded-2xl bg-surface-selected">
        <Glyph size={30} color={accent} weight="fill" />
      </View>
      <Text className="text-base font-semibold text-foreground">{label}</Text>
    </Card>
  );
}
