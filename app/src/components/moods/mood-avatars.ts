import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import type { FamilyMember } from '@/api/auth';
import { MOOD_MAX, MOOD_MIN, type MoodLevel } from '@/api/moods';

import Alfonso1 from '@/assets/alfonso/happiness-1.svg';
import Alfonso2 from '@/assets/alfonso/happiness-2.svg';
import Alfonso3 from '@/assets/alfonso/happiness-3.svg';
import Alfonso4 from '@/assets/alfonso/happiness-4.svg';
import Alfonso5 from '@/assets/alfonso/happiness-5.svg';
import Alfonso6 from '@/assets/alfonso/happiness-6.svg';
import Alfonso7 from '@/assets/alfonso/happiness-7.svg';
import Alfonso8 from '@/assets/alfonso/happiness-8.svg';
import Alfonso9 from '@/assets/alfonso/happiness-9.svg';
import Saida1 from '@/assets/saida/happiness-1.svg';
import Saida2 from '@/assets/saida/happiness-2.svg';
import Saida3 from '@/assets/saida/happiness-3.svg';
import Saida4 from '@/assets/saida/happiness-4.svg';
import Saida5 from '@/assets/saida/happiness-5.svg';
import Saida6 from '@/assets/saida/happiness-6.svg';
import Saida7 from '@/assets/saida/happiness-7.svg';
import Saida8 from '@/assets/saida/happiness-8.svg';
import Saida9 from '@/assets/saida/happiness-9.svg';

// The nine expression frames per person, ordered from most upset (1) to
// happiest (9); index 0 holds mood level 1.
export const MOOD_AVATARS: Record<FamilyMember, readonly FC<SvgProps>[]> = {
  alfonso: [
    Alfonso1,
    Alfonso2,
    Alfonso3,
    Alfonso4,
    Alfonso5,
    Alfonso6,
    Alfonso7,
    Alfonso8,
    Alfonso9,
  ],
  saida: [Saida1, Saida2, Saida3, Saida4, Saida5, Saida6, Saida7, Saida8, Saida9],
};

/** Zero-based frame index for a mood level, clamped to the 1–9 scale. */
export function moodFrameIndex(mood: MoodLevel): number {
  return Math.min(MOOD_MAX, Math.max(MOOD_MIN, mood)) - 1;
}
