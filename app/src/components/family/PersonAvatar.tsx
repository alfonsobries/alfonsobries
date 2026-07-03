import { isMoodPerson, type PersonKey } from '@/api/family';
import type { MoodLevel } from '@/api/moods';
import { FamilyAvatar } from '@/components/family/FamilyAvatar';
import { MoodAvatar } from '@/components/moods/MoodAvatar';

type PersonAvatarProperties = {
  person: PersonKey;
  mood?: MoodLevel;
  width?: number;
  height?: number;
};

// A person's likeness: the mood expression when they have a mood, otherwise
// their static avatar.
export function PersonAvatar({ person, mood, width, height }: PersonAvatarProperties) {
  if (mood != null && isMoodPerson(person)) {
    return <MoodAvatar member={person} mood={mood} width={width} height={height} />;
  }

  return <FamilyAvatar person={person} width={width} height={height} />;
}
