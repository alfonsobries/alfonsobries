import { Redirect, useLocalSearchParams } from 'expo-router';

import type { Behavior, KidMember } from '@/api/behaviors';
import { LogBehaviorSheet } from '@/components/behaviors/LogBehaviorSheet';

// The behavior details travel in the URL so the sheet opens instantly with
// what the profile grid already knew — no refetch for a confirmation step.
export default function BehaviorLogScreen() {
  const { id, member, name, points, image } = useLocalSearchParams<{
    id?: string;
    member?: string;
    name?: string;
    points?: string;
    image?: string;
  }>();

  const behaviorId = Number(id);

  if (!behaviorId || !member || !name) {
    return <Redirect href="/" />;
  }

  const behavior: Behavior = {
    id: behaviorId,
    family_member: member as KidMember,
    name,
    points: Number(points) || 1,
    image_url: image ?? null,
  };

  return <LogBehaviorSheet behavior={behavior} />;
}
