import { Check } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { PEOPLE, type PersonKey } from '@/api/family';
import { AvatarCircle } from '@/components/family/AvatarCircle';
import { useThemeColor } from '@/hooks/use-theme-color';

type MemberPickerProperties = {
  selected: PersonKey[];
  onChange: (selected: PersonKey[]) => void;
  /** Once the conversation started its cast is fixed on the API. */
  disabled?: boolean;
};

/**
 * Who stars in the illustrations: a row of avatar chips, multi-select.
 * Nobody selected means a scene without the family characters.
 */
export function MemberPicker({ selected, onChange, disabled = false }: MemberPickerProperties) {
  const checkColor = useThemeColor('primary-foreground');

  const toggle = (key: PersonKey) => {
    onChange(
      selected.includes(key) ? selected.filter((entry) => entry !== key) : [...selected, key],
    );
  };

  return (
    <View className="gap-2">
      <Text className="px-1 text-xs font-medium uppercase tracking-wide text-muted">
        Who&apos;s in the drawing
      </Text>
      <View className="flex-row gap-2">
        {PEOPLE.map((person) => {
          const isSelected = selected.includes(person.key);

          return (
            <Pressable
              key={person.key}
              accessibilityRole="checkbox"
              accessibilityLabel={person.name}
              accessibilityState={{ checked: isSelected, disabled }}
              disabled={disabled}
              onPress={() => toggle(person.key)}
              className={`flex-1 items-center gap-1.5 rounded-2xl border-2 p-2 ${
                isSelected ? 'border-primary bg-surface-selected' : 'border-transparent bg-surface'
              } ${disabled ? 'opacity-60' : 'active:opacity-80'}`}
            >
              <View>
                <AvatarCircle person={person.key} size={52} />
                {isSelected ? (
                  <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check size={12} weight="bold" color={checkColor} />
                  </View>
                ) : null}
              </View>
              <Text
                className={`text-xs ${isSelected ? 'font-semibold text-foreground' : 'text-muted'}`}
                numberOfLines={1}
              >
                {person.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
