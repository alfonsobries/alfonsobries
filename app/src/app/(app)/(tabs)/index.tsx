import { router } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/api/auth';
import { moodLabel, useMoods, type MoodMember } from '@/api/moods';
import { MoodAvatar } from '@/components/moods/MoodAvatar';
import { Card } from '@/components/ui/Card';

export default function HomeScreen() {
  const { user } = useAuth();
  const { members, status } = useMoods();
  const insets = useSafeAreaInsets();

  const firstName = user?.name?.split(' ')[0];
  const greeting = firstName ? `Hey ${firstName} 👋` : "Welcome to Alfonso's App";

  return (
    <View className="flex-1 bg-background px-4" style={{ paddingTop: insets.top + 16 }}>
      <Text className="text-3xl font-semibold leading-tight text-foreground">{greeting}</Text>
      <Text className="mt-1 text-base text-muted">Here&apos;s how everyone&apos;s feeling</Text>

      {status === 'loading' ? (
        <ActivityIndicator className="mt-8" />
      ) : (
        <Animated.View entering={FadeIn.duration(500)} className="mt-5 flex-row gap-3">
          {members.map((member) => (
            <MoodCard key={member.family_member} member={member} />
          ))}
        </Animated.View>
      )}
    </View>
  );
}

function MoodCard({ member }: { member: MoodMember }) {
  const firstName = member.name?.split(' ')[0] ?? '';

  return (
    <Card
      accessibilityLabel={`${firstName} feels ${moodLabel(member.mood).toLowerCase()}`}
      onPress={() => router.push(`/mood?member=${member.family_member}`)}
      className="flex-1 items-center gap-2"
    >
      <MoodAvatar member={member.family_member} mood={member.mood} width={120} height={158} />
      <Text className="text-lg font-semibold text-foreground">{firstName}</Text>
    </Card>
  );
}
