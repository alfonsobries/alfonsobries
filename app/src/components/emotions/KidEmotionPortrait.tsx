import { Image } from 'expo-image';

import type { KidEmotion, KidMember } from '@/api/kid-emotions';
import { EMOTION_PORTRAITS } from '@/components/emotions/emotion-portraits';

type KidEmotionPortraitProperties = {
  member: KidMember;
  emotion: KidEmotion;
  size: number;
};

export function KidEmotionPortrait({ member, emotion, size }: KidEmotionPortraitProperties) {
  return (
    <Image
      source={EMOTION_PORTRAITS[member][emotion]}
      accessibilityLabel={emotion}
      contentFit="contain"
      transition={150}
      style={{ width: size, height: size }}
    />
  );
}
