import { Check, type Icon } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type HabitToggleRowProperties = {
  Icon: Icon;
  label: string;
  /** Shown while the habit is pending; a done habit shows its completion line instead. */
  subtitle: string;
  done: boolean;
  disabled: boolean;
  onToggle: () => void;
};

// One daily habit as a checklist row: icon, name and a one-tap toggle. The
// toggle is deliberately quiet — marking a day should feel like a nod, not
// a transaction.
export function HabitToggleRow({
  Icon,
  label,
  subtitle,
  done,
  disabled,
  onToggle,
}: HabitToggleRowProperties) {
  const tint = useThemeColor('primary-emphasis');
  const onPrimary = useThemeColor('primary-foreground');
  const muted = useThemeColor('muted');

  return (
    <View className="flex-row items-center gap-3">
      <View className="size-11 items-center justify-center rounded-2xl bg-surface-selected">
        <Icon size={22} color={tint} weight="fill" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{label}</Text>
        <Text className="text-sm text-muted">{done ? 'Done — well done' : subtitle}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: done, disabled }}
        disabled={disabled}
        onPress={onToggle}
        hitSlop={8}
        className={`size-9 items-center justify-center rounded-full ${
          done ? 'bg-primary' : 'border-2 border-border bg-surface-selected'
        } ${disabled ? 'opacity-50' : 'active:opacity-80'}`}
      >
        <Check size={18} color={done ? onPrimary : muted} weight="bold" />
      </Pressable>
    </View>
  );
}
