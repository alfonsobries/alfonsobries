import { CaretRight, type Icon } from 'phosphor-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type SettingsRowProperties = {
  label: string;
  icon?: Icon;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  loading?: boolean;
  /** Trailing status text, for a row that reports a value as well as acting. */
  detail?: string;
};

export function SettingsRow({
  label,
  icon: Glyph,
  onPress,
  destructive = false,
  showChevron = false,
  loading = false,
  detail,
}: SettingsRowProperties) {
  const iconTint = useThemeColor(destructive ? 'danger' : 'primary-emphasis');
  const muted = useThemeColor('muted');
  const disabled = loading || !onPress;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={`flex-row items-center gap-3 px-4 py-3.5 ${disabled ? '' : 'active:bg-surface-selected'}`}
    >
      {Glyph ? <Glyph size={22} color={iconTint} weight="regular" /> : null}

      <Text
        className={`flex-1 text-base ${destructive ? 'font-medium text-danger' : 'text-foreground'}`}
      >
        {label}
      </Text>

      {detail ? <Text className="text-base text-muted">{detail}</Text> : null}

      {loading ? (
        <ActivityIndicator size="small" color={muted} />
      ) : showChevron ? (
        <CaretRight size={16} color={muted} weight="bold" />
      ) : (
        <View />
      )}
    </Pressable>
  );
}
