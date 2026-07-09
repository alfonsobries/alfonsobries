import { ArrowRight } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import { moodEmoji, moodLabel, type MoodLevel } from '@/api/moods';
import { useThemeColor } from '@/hooks/use-theme-color';

type MoodShiftProperties = {
  before: MoodLevel;
  after: MoodLevel;
};

/** How a save moved your mood: the before face, an arrow, the after face. */
export function MoodShift({ before, after }: MoodShiftProperties) {
  const muted = useThemeColor('muted');

  return (
    <View className="flex-row items-center justify-center gap-4">
      <MoodFace mood={before} />
      <ArrowRight size={24} color={muted} weight="bold" />
      <MoodFace mood={after} />
    </View>
  );
}

function MoodFace({ mood }: { mood: MoodLevel }) {
  return (
    <View className="items-center gap-1">
      <Text className="text-5xl">{moodEmoji(mood)}</Text>
      <Text className="text-xs text-muted">{moodLabel(mood)}</Text>
    </View>
  );
}
