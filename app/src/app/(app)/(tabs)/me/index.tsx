import { Stack } from 'expo-router';
import { ScrollView } from 'react-native';

import { useAuth } from '@/api/auth';
import { getPerson } from '@/api/family';
import { ProfileView } from '@/components/family/ProfileView';

export default function MyProfileScreen() {
  const { user } = useAuth();
  const person = getPerson(user?.family_member ?? undefined);

  return (
    <>
      <Stack.Screen.Title large>Profile</Stack.Screen.Title>

      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-6 px-4 pb-16 pt-2"
        contentInsetAdjustmentBehavior="automatic"
      >
        {person ? <ProfileView person={person} /> : null}
      </ScrollView>
    </>
  );
}
