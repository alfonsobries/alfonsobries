import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';

import { getPerson } from '@/api/family';
import { ProfileView } from '@/components/family/ProfileView';

export default function ProfileScreen() {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const person = getPerson(member);

  if (!person) {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Stack.Screen options={{ title: person.name }} />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 p-4"
      >
        <ProfileView person={person} />
      </ScrollView>
    </>
  );
}
