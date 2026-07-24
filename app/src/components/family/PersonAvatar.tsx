import { isKid, isMoodPerson, type PersonKey } from '@/api/family';
import type { KidEmotion } from '@/api/kid-emotions';
import type { MoodLevel } from '@/api/moods';
import { KidEmotionPortrait } from '@/components/emotions/KidEmotionPortrait';
import { FamilyAvatar } from '@/components/family/FamilyAvatar';
import { MoodAvatar } from '@/components/moods/MoodAvatar';

type PersonAvatarProperties = {
  person: PersonKey;
  mood?: MoodLevel;
  emotion?: KidEmotion | null;
  width?: number;
  height?: number;
};

// A person's likeness: the mood expression when they have a mood, otherwise
// their static avatar.
export function PersonAvatar({ person, mood, emotion, width, height }: PersonAvatarProperties) {
  if (mood != null && isMoodPerson(person)) {
    return <MoodAvatar member={person} mood={mood} width={width} height={height} />;
  }

  if (emotion && isKid(person)) {
    return <KidEmotionPortrait member={person} emotion={emotion} size={width ?? 120} />;
  }

  return <FamilyAvatar person={person} width={width} height={height} />;
}
