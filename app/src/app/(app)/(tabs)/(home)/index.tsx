import { router, Stack } from 'expo-router';
import { Pressable, ScrollView } from 'react-native';

import { useAuth } from '@/api/auth';
import { getPerson } from '@/api/family';
import { useMoods } from '@/api/moods';
import { AvatarCircle } from '@/components/family/AvatarCircle';
import { ProfileView } from '@/components/family/ProfileView';

// Home is your own space: your mood, and — for Alfonso — the daily practice
// summary. Your identity lives quietly in the header; the family has its own
// tab.
export default function HomeScreen() {
  const { user } = useAuth();
  const { members } = useMoods();
  const person = getPerson(user?.family_member ?? undefined);
  const firstName = user?.name?.split(' ')[0];
  const record = person?.hasMood
    ? members.find((entry) => entry.family_member === person.key)
    : undefined;

  return (
    <>
      <Stack.Screen.Title>{firstName ? `Hey ${firstName} 👋` : 'Home'}</Stack.Screen.Title>
      {person ? (
        <Stack.Screen
          options={{
            headerRight: () => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Adjust mood"
                hitSlop={8}
                onPress={() => router.push(`/mood?member=${person.key}`)}
              >
                <AvatarCircle person={person.key} mood={record?.mood} size={34} />
              </Pressable>
            ),
          }}
        />
      ) : null}

      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-6 px-4 pb-16 pt-4"
        contentInsetAdjustmentBehavior="automatic"
      >
        {person ? <ProfileView person={person} hideIdentity /> : null}
      </ScrollView>
    </>
  );
}
