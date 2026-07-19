import { Redirect, Stack, useLocalSearchParams } from 'expo-router';

import { getPerson, isKid } from '@/api/family';
import { KidEmotionPicker } from '@/components/emotions/KidEmotionPicker';

export default function EmotionScreen() {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const person = getPerson(member);

  if (!person || !isKid(person.key)) {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Stack.Screen options={{ title: person.name }} />
      <KidEmotionPicker member={person.key} name={person.name} />
    </>
  );
}
