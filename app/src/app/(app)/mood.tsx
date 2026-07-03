import { Redirect, useLocalSearchParams } from 'expo-router';

import type { FamilyMember } from '@/api/auth';
import { MoodSheet } from '@/components/moods/MoodSheet';

const MEMBERS: FamilyMember[] = ['alfonso', 'saida'];

function isFamilyMember(value: string | undefined): value is FamilyMember {
  return value !== undefined && MEMBERS.includes(value as FamilyMember);
}

export default function MoodScreen() {
  const { member } = useLocalSearchParams<{ member?: string }>();

  if (!isFamilyMember(member)) {
    return <Redirect href="/" />;
  }

  return <MoodSheet member={member} />;
}
