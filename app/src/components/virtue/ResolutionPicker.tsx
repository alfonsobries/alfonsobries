import { Check, X } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { type Resolution } from '@/api/virtue';
import { useThemeColor } from '@/hooks/use-theme-color';

type ResolutionPickerProperties = {
  value: Resolution | null;
  disabled: boolean;
  onChange: (next: Resolution | null) => void;
};

// The kept/missed pair for a day's resolution. Tapping the selected side
// clears it back to pending.
export function ResolutionPicker({ value, disabled, onChange }: ResolutionPickerProperties) {
  const success = useThemeColor('success');
  const danger = useThemeColor('danger');
  const muted = useThemeColor('muted');

  return (
    <View className="flex-row gap-2">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'kept', disabled }}
        disabled={disabled}
        onPress={() => onChange(value === 'kept' ? null : 'kept')}
        className={`h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-full ${
          value === 'kept' ? 'bg-primary' : 'bg-surface-selected'
        } ${disabled ? 'opacity-50' : 'active:opacity-80'}`}
      >
        <Check size={16} color={value === 'kept' ? success : muted} weight="bold" />
        <Text
          className={`text-sm font-semibold ${value === 'kept' ? 'text-primary-foreground' : 'text-foreground'}`}
        >
          Kept
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'missed', disabled }}
        disabled={disabled}
        onPress={() => onChange(value === 'missed' ? null : 'missed')}
        className={`h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-full ${
          value === 'missed' ? 'bg-danger/15' : 'bg-surface-selected'
        } ${disabled ? 'opacity-50' : 'active:opacity-80'}`}
      >
        <X size={16} color={value === 'missed' ? danger : muted} weight="bold" />
        <Text
          className={`text-sm font-semibold ${value === 'missed' ? 'text-danger' : 'text-foreground'}`}
        >
          Missed
        </Text>
      </Pressable>
    </View>
  );
}
