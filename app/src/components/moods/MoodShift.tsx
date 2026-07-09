import { ArrowRight } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import type { FamilyMember } from '@/api/auth';
import { moodEmoji, moodLabel, type MoodLevel } from '@/api/moods';
import { MoodAvatar } from '@/components/moods/MoodAvatar';
import { useThemeColor } from '@/hooks/use-theme-color';

type MoodShiftProperties = {
  member: FamilyMember;
  before: MoodLevel;
  after: MoodLevel;
};

/**
 * How a save moved a parent's mood: their illustrated avatar at the level it
 * was, an arrow, and the avatar at the level it is now.
 */
export function MoodShift({ member, before, after }: MoodShiftProperties) {
  const muted = useThemeColor('muted');

  return (
    <View className="flex-row items-center justify-center gap-5">
      <MoodFace member={member} mood={before} />
      <ArrowRight size={24} color={muted} weight="bold" />
      <MoodFace member={member} mood={after} />
    </View>
  );
}

function MoodFace({ member, mood }: { member: FamilyMember; mood: MoodLevel }) {
  return (
    <View className="items-center gap-1.5">
      <MoodAvatar member={member} mood={mood} width={76} height={100} />
      <Text className="text-xs text-muted">
        {moodEmoji(mood)} {moodLabel(mood)}
      </Text>
    </View>
  );
}
