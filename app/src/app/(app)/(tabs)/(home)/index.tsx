import { Stack } from 'expo-router';
import { ScrollView } from 'react-native';

import { useAuth } from '@/api/auth';
import { getPerson } from '@/api/family';
import { ProfileView } from '@/components/family/ProfileView';

// Home is your own space: your profile, your mood, and — for Alfonso — the
// daily practice summary. The family lives on its own tab.
export default function HomeScreen() {
  const { user } = useAuth();
  const person = getPerson(user?.family_member ?? undefined);
  const firstName = user?.name?.split(' ')[0];

  return (
    <>
      <Stack.Screen.Title>{firstName ? `Hey ${firstName} 👋` : 'Home'}</Stack.Screen.Title>

      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-6 px-4 pb-16 pt-4"
        contentInsetAdjustmentBehavior="automatic"
      >
        {person ? <ProfileView person={person} /> : null}
      </ScrollView>
    </>
  );
}
