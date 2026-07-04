import { Minus, Plus } from 'phosphor-react-native';
import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type StepperProperties = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
};

// A labeled numeric stepper: minus / value / plus, clamped to [min, max].
export function Stepper({
  label,
  value,
  onChange,
  min = 1,
  max = 9,
  step = 1,
  helperText,
}: StepperProperties) {
  const tint = useThemeColor('foreground');

  return (
    <View className="w-full gap-1.5">
      <Text className="px-4 text-sm font-medium text-foreground">{label}</Text>
      <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface px-4 py-2">
        <StepButton
          accessibilityLabel={`Less ${label.toLowerCase()}`}
          disabled={value <= min}
          onPress={() => onChange(Math.max(min, value - step))}
        >
          <Minus size={20} color={tint} weight="bold" />
        </StepButton>
        <Text className="text-lg font-semibold text-foreground">{value}</Text>
        <StepButton
          accessibilityLabel={`More ${label.toLowerCase()}`}
          disabled={value >= max}
          onPress={() => onChange(Math.min(max, value + step))}
        >
          <Plus size={20} color={tint} weight="bold" />
        </StepButton>
      </View>
      {helperText ? <Text className="px-4 text-xs text-muted">{helperText}</Text> : null}
    </View>
  );
}

function StepButton({
  children,
  accessibilityLabel,
  disabled,
  onPress,
}: {
  children: ReactNode;
  accessibilityLabel: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`size-11 items-center justify-center rounded-full bg-surface-selected ${
        disabled ? 'opacity-40' : 'active:opacity-80'
      }`}
    >
      {children}
    </Pressable>
  );
}
