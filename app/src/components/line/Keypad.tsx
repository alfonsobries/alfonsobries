import * as Haptics from 'expo-haptics';
import { Backspace } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type KeypadProperties = {
  value: string;
  onChange: (value: string) => void;
};

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'] as const;

export function Keypad({ value, onChange }: KeypadProperties) {
  const foreground = useThemeColor('foreground');

  const handleDigit = (digit: string) => {
    void Haptics.selectionAsync();
    onChange(value + digit);
  };

  const handleDelete = () => {
    void Haptics.selectionAsync();
    onChange(value.slice(0, -1));
  };

  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap justify-center">
        {KEYS.map((key) => (
          <View key={key} className="w-1/3 items-center py-1.5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Dial ${key}`}
              onPress={() => handleDigit(key)}
              className="size-20 items-center justify-center rounded-full bg-surface active:bg-surface-selected"
            >
              <Text className="text-3xl font-medium text-foreground">{key}</Text>
            </Pressable>
          </View>
        ))}
      </View>
      <View className="items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete digit"
          disabled={value.length === 0}
          onPress={handleDelete}
          className="size-14 items-center justify-center rounded-full active:opacity-70"
        >
          <Backspace size={28} color={foreground} />
        </Pressable>
      </View>
    </View>
  );
}
