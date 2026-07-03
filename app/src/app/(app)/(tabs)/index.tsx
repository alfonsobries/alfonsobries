import { router } from 'expo-router';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/api/auth';
import { PEOPLE, type Person } from '@/api/family';
import { useMoods } from '@/api/moods';
import { PersonAvatar } from '@/components/family/PersonAvatar';
import { Card } from '@/components/ui/Card';

export default function HomeScreen() {
  const { user } = useAuth();
  const { members } = useMoods();
  const insets = useSafeAreaInsets();

  const firstName = user?.name?.split(' ')[0];
  const greeting = firstName ? `Hey ${firstName} 👋` : "Welcome to Alfonso's App";
  const moodFor = (key: Person['key']) => members.find((m) => m.family_member === key)?.mood;

  return (
    <View className="flex-1 bg-background px-4" style={{ paddingTop: insets.top + 4 }}>
      <Text className="text-3xl font-semibold leading-tight text-foreground">{greeting}</Text>
      <Text className="mt-1 text-base text-muted">Here&apos;s the family</Text>

      <Animated.View entering={FadeIn.duration(500)} className="mt-5 flex-row flex-wrap">
        {PEOPLE.map((person) => (
          <View key={person.key} className="w-1/2 p-1.5">
            <PersonCard person={person} mood={person.hasMood ? moodFor(person.key) : undefined} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

function PersonCard({ person, mood }: { person: Person; mood?: number }) {
  return (
    <Card
      accessibilityLabel={person.name}
      onPress={() => router.push(`/profile?member=${person.key}`)}
      className="items-center gap-2"
    >
      <PersonAvatar person={person.key} mood={mood} width={110} height={144} />
      <Text className="text-lg font-semibold text-foreground">{person.name}</Text>
    </Card>
  );
}
