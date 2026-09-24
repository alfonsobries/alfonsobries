import { Pressable, Text, View } from 'react-native';

type HomeWelcomeProperties = {
  firstName: string | null;
  onSuggestion: (text: string) => void;
};

const SUGGESTIONS = [
  { emoji: '☕', text: 'Gasté 65 en un café' },
  { emoji: '🛒', text: '1,240 en el súper con la de débito' },
  { emoji: '💡', text: 'Ayer pagué la luz, 830' },
  { emoji: '📊', text: '¿Cuánto llevamos este mes?' },
];

/**
 * The first time here: what the chat is for, and a few things to try.
 * Suggestions fill the field rather than sending, so nothing gets recorded
 * by accident.
 */
export function HomeWelcome({ firstName, onSuggestion }: HomeWelcomeProperties) {
  return (
    <View className="flex-1 justify-end gap-6 px-5 pb-6">
      <View className="gap-2">
        <Text className="text-5xl" allowFontScaling={false}>
          🏡
        </Text>
        <Text className="text-2xl font-semibold text-foreground">
          {firstName ? `Hola, ${firstName}` : 'Hola'}
        </Text>
        <Text className="text-base leading-6 text-muted">
          Cuéntame lo que gastan como se lo dirías a alguien: escrito, con una foto del ticket o con
          una nota de voz. Yo lo anoto y lo acomodo.
        </Text>
      </View>

      <View className="gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <Pressable
            key={suggestion.text}
            accessibilityRole="button"
            accessibilityHint="Lo escribe en el mensaje"
            onPress={() => onSuggestion(suggestion.text)}
            className="flex-row items-center gap-3 self-start rounded-2xl bg-surface px-4 py-3 active:bg-surface-selected"
          >
            <Text className="text-lg">{suggestion.emoji}</Text>
            <Text className="text-base text-foreground">{suggestion.text}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
