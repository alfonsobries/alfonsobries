import { type Icon } from 'phosphor-react-native';
import { ActivityIndicator, Pressable, type PressableProps, Text, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProperties = Omit<PressableProps, 'children'> & {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: Icon;
};

const CONTAINER: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-surface-selected',
  outline: 'border border-border',
  ghost: '',
};

const LABEL: Record<ButtonVariant, string> = {
  primary: 'text-primary-foreground',
  secondary: 'text-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
};

// All sizes meet the 44pt minimum tap target.
const SIZE: Record<ButtonSize, { frame: string; gap: string; label: string; icon: number }> = {
  sm: { frame: 'h-11 px-3.5', gap: 'gap-1.5', label: 'text-sm', icon: 16 },
  md: { frame: 'h-12 px-4', gap: 'gap-2', label: 'text-base', icon: 18 },
  lg: { frame: 'h-14 px-5', gap: 'gap-2.5', label: 'text-base', icon: 20 },
};

const PRESS: Record<ButtonVariant, string> = {
  primary: 'active:opacity-80',
  secondary: 'active:opacity-80',
  outline: 'active:bg-surface-selected',
  ghost: 'active:bg-surface-selected',
};

// Icons and the spinner are native props, so their color comes from a token hex.
const TINT: Record<ButtonVariant, 'primary-foreground' | 'foreground'> = {
  primary: 'primary-foreground',
  secondary: 'foreground',
  outline: 'foreground',
  ghost: 'foreground',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon: Glyph,
  disabled,
  className,
  ...props
}: ButtonProperties) {
  const tint = useThemeColor(TINT[variant]);
  const sizing = SIZE[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-full ${sizing.frame} ${CONTAINER[variant]} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : PRESS[variant]} ${className ?? ''}`}
      {...props}
    >
      {/* Kept mounted (just hidden) while loading so the button doesn't resize. */}
      <View
        className={`flex-row items-center justify-center ${sizing.gap} ${loading ? 'opacity-0' : ''}`}
      >
        {Glyph ? <Glyph size={sizing.icon} color={tint} weight="bold" /> : null}
        <Text className={`font-semibold ${sizing.label} ${LABEL[variant]}`}>{children}</Text>
      </View>
      {loading ? (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator size="small" color={tint} />
        </View>
      ) : null}
    </Pressable>
  );
}
