import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import type { PersonKey } from '@/api/family';

import Andres from '@/assets/andres.svg';
import Alfonso from '@/assets/me.svg';
import Regina from '@/assets/regina.svg';
import Saida from '@/assets/saida.svg';

// Each person's static, full-body likeness (no mood expression).
const AVATARS: Record<PersonKey, FC<SvgProps>> = {
  alfonso: Alfonso,
  saida: Saida,
  regina: Regina,
  andres: Andres,
};

type FamilyAvatarProperties = {
  person: PersonKey;
  width?: number;
  height?: number;
};

export function FamilyAvatar({ person, width = 120, height = 158 }: FamilyAvatarProperties) {
  const Avatar = AVATARS[person];

  return <Avatar width={width} height={height} />;
}
