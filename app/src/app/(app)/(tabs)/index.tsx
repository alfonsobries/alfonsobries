import { router } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useAuth } from '@/api/auth';
import { moodLabel, useMoods, type MoodMember } from '@/api/moods';
import { MoodAvatar } from '@/components/moods/MoodAvatar';

export default function HomeScreen() {
  const { user } = useAuth();
  const { members, status } = useMoods();

  const firstName = user?.name?.split(' ')[0];
  const greeting = firstName ? `Hey ${firstName} 👋` : "Welcome to Alfonso's App";

  return (
    <View className="pt-safe-offset-4 flex-1 bg-background px-4">
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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${firstName} feels ${moodLabel(member.mood).toLowerCase()}`}
      onPress={() => router.push(`/mood?member=${member.family_member}`)}
      className="flex-1 items-center gap-2 rounded-3xl bg-surface px-3 pb-4 pt-5 active:opacity-80"
    >
      <MoodAvatar member={member.family_member} mood={member.mood} width={120} height={158} />
      <Text className="text-lg font-semibold text-foreground">{firstName}</Text>
      <Text className="text-sm text-muted">{moodLabel(member.mood)}</Text>
    </Pressable>
  );
}
