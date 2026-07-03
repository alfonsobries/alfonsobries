import type { ReactNode } from 'react';

import type { FamilyMember } from '@/api/auth';
import type { MoodLevel } from '@/api/moods';
import { moodFrameIndex, MOOD_AVATARS } from '@/components/moods/mood-avatars';

type MoodAvatarProperties = {
  member: FamilyMember;
  mood: MoodLevel;
  width?: number;
  height?: number;
};

export function MoodAvatar({
  member,
  mood,
  width = 140,
  height = 184,
}: MoodAvatarProperties): ReactNode {
  const Avatar = MOOD_AVATARS[member][moodFrameIndex(mood)];

  return <Avatar width={width} height={height} />;
}
