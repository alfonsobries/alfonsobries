import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView } from 'react-native';

import { getPerson, isKid } from '@/api/family';
import { KidHeaderMenu } from '@/components/behaviors/KidHeaderMenu';
import { ProfileView } from '@/components/family/ProfileView';

export default function ProfileScreen() {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const person = getPerson(member);
  const kid = person && isKid(person.key) ? person.key : undefined;

  // A stable renderer: a fresh closure per render remounts the native header
  // item, which swallowed taps on the menu.
  const headerRight = useCallback(() => (kid ? <KidHeaderMenu member={kid} /> : null), [kid]);

  if (!person) {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: person.name,
          headerRight: kid ? headerRight : undefined,
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
