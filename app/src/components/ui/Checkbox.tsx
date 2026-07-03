import { Check } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type CheckboxProperties = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProperties) {
  const checkColor = useThemeColor('primary-foreground');

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      className={`flex-row items-center gap-3 ${disabled ? 'opacity-50' : 'active:opacity-70'}`}
    >
      <View
        className={`size-6 items-center justify-center rounded-md border-2 ${
          checked ? 'border-primary bg-primary' : 'border-border'
        }`}
      >
        {checked ? <Check size={16} weight="bold" color={checkColor} /> : null}
      </View>
      {label ? <Text className="flex-1 text-base text-foreground">{label}</Text> : null}
    </Pressable>
  );
}
