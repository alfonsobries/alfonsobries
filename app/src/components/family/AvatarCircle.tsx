import { View } from 'react-native';

import type { PersonKey } from '@/api/family';
import type { KidEmotion } from '@/api/kid-emotions';
import type { MoodLevel } from '@/api/moods';
import { PersonAvatar } from '@/components/family/PersonAvatar';

type AvatarCircleProperties = {
  person: PersonKey;
  mood?: MoodLevel;
  emotion?: KidEmotion | null;
  size?: number;
};

// A person's avatar framed as a round portrait: the full-body likeness sits in
// a circular surface, anchored so the head shows with headroom above it.
export function AvatarCircle({ person, mood, emotion, size = 176 }: AvatarCircleProperties) {
  const avatarWidth = Math.round(size * 0.75);
  const avatarHeight = Math.round(avatarWidth * 1.31);
  const paddingTop = Math.round(size * 0.14);

  return (
    <View
      className="items-center justify-start overflow-hidden rounded-full bg-surface"
      style={{ width: size, height: size, paddingTop }}
    >
      <PersonAvatar
        person={person}
        mood={mood}
        emotion={emotion}
        width={avatarWidth}
        height={avatarHeight}
      />
    </View>
  );
}
