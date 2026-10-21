import { Pressable, Text, View } from 'react-native';

import type { AvailabilityMode } from '@/api/support-availability';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MODE_ACTION } from '@/lib/availability';

import { MODE_APPEARANCE } from './mode-appearance';

type QuickModeButtonProperties = {
  mode: AvailabilityMode;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
};

/** One of the three big one-tap switches under the status. */
export function QuickModeButton({
  mode,
  active,
  disabled = false,
  onPress,
}: QuickModeButtonProperties) {
  const appearance = MODE_APPEARANCE[mode];
  const glyphColor = useThemeColor(appearance.tint);
  const Glyph = appearance.icon;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={MODE_ACTION[mode]}
      accessibilityState={{ selected: active, disabled }}
      accessibilityHint="Elige por cuánto tiempo"
      disabled={disabled}
      onPress={onPress}
      className={`min-h-24 flex-1 items-center justify-center gap-2 rounded-3xl border-2 bg-surface px-2 py-3 ${
        active ? 'border-primary-emphasis' : 'border-transparent'
      } ${disabled ? 'opacity-50' : 'active:opacity-70'}`}
    >
      <View className={`size-10 items-center justify-center rounded-2xl ${appearance.badge}`}>
        <Glyph size={22} color={glyphColor} weight="fill" />
      </View>
      <Text className="text-center text-sm font-semibold text-foreground">{MODE_ACTION[mode]}</Text>
    </Pressable>
  );
}
