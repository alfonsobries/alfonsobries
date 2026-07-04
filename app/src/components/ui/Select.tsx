import { CaretUpDown, type Icon } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

import { pickOption, type SelectOption } from './select-picker';

type SelectProperties = {
  value: string | null;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  error?: string;
  icon?: Icon;
  disabled?: boolean;
  /** Navigation-bar title of the native sheet; falls back to `label`. */
  title?: string;
  /** Native search bar in the sheet. Defaults to true. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** A–Z sections with the side index. Defaults to automatic (30+ options). */
  grouped?: boolean;
};

/**
 * Form select styled like `Input`. Tapping the field opens the native iOS
 * option list (searchable, settings-style) and reports the pick via
 * `onChange`.
 */
export function Select({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select…',
  error,
  icon: Glyph,
  disabled = false,
  title,
  searchable,
  searchPlaceholder,
  grouped,
}: SelectProperties) {
  const mutedColor = useThemeColor('muted');
  const dangerColor = useThemeColor('danger');
  const hasError = Boolean(error);
  const iconColor = hasError ? dangerColor : mutedColor;

  const selected = options.find((option) => option.value === value);

  async function handleOpen() {
    const picked = await pickOption({
      title: title ?? label,
      options,
      selectedValue: value ?? undefined,
      searchable,
      searchPlaceholder,
      grouped,
    });
    if (picked !== null) {
      onChange(picked);
    }
  }

  return (
    <View className="w-full gap-1.5">
      {label ? <Text className="px-4 text-sm font-medium text-foreground">{label}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        accessibilityValue={selected ? { text: selected.label } : undefined}
        disabled={disabled}
        onPress={handleOpen}
        className={`h-12 flex-row items-center gap-2 rounded-2xl border bg-surface px-4 ${
          hasError ? 'border-danger' : 'border-border'
        } ${disabled ? 'opacity-50' : 'active:opacity-70'}`}
      >
        {Glyph ? <Glyph size={18} color={iconColor} /> : null}
        <Text
          className={`flex-1 text-[16px] ${selected ? 'text-foreground' : 'text-muted'}`}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
        <CaretUpDown size={16} color={mutedColor} />
      </Pressable>
      {error ? <Text className="px-4 text-sm text-danger">{error}</Text> : null}
    </View>
  );
}
