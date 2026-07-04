import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';

import { getPerson, isKid } from '@/api/family';
import { KidHeaderMenu } from '@/components/behaviors/KidHeaderMenu';
import { ProfileView } from '@/components/family/ProfileView';

export default function ProfileScreen() {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const person = getPerson(member);

  if (!person) {
    return <Redirect href="/" />;
  }

  const kid = isKid(person.key) ? person.key : undefined;

  return (
    <>
      <Stack.Screen
        options={{
          title: person.name,
          headerRight: kid ? () => <KidHeaderMenu member={kid} /> : undefined,
        }}
      />
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
