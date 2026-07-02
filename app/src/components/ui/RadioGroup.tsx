import { Pressable, Text, View } from 'react-native';

type RadioOption<T> = { label: string; value: T };

type RadioGroupProperties<T> = {
  value: T;
  onChange: (value: T) => void;
  options: RadioOption<T>[];
  disabled?: boolean;
};

export function RadioGroup<T extends string | number>({
  value,
  onChange,
  options,
  disabled,
}: RadioGroupProperties<T>) {
  return (
    <View className="gap-3">
      {options.map((option) => (
        <RadioGroupRow
          key={String(option.value)}
          label={option.label}
          selected={option.value === value}
          disabled={disabled}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}

function RadioGroupRow({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`flex-row items-center gap-3 ${disabled ? 'opacity-50' : 'active:opacity-70'}`}>
      <View
        className={`size-6 items-center justify-center rounded-full border-2 ${
          selected ? 'border-primary-emphasis' : 'border-border'
        }`}>
        {selected ? <View className="size-3 rounded-full bg-primary-emphasis" /> : null}
      </View>
      <Text className="flex-1 text-base text-foreground">{label}</Text>
    </Pressable>
  );
}
