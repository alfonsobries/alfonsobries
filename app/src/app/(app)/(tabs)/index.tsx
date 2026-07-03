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
    <View className="flex-1 items-center justify-center gap-8 bg-background px-6">
      <View className="items-center gap-2">
        <Text className="text-center text-4xl font-semibold leading-tight text-foreground">
          {greeting}
        </Text>
        <Text className="text-center text-lg text-muted">
          Here&apos;s how everyone&apos;s feeling
        </Text>
      </View>

      {status === 'loading' ? (
        <ActivityIndicator />
      ) : (
        <Animated.View
          entering={FadeIn.duration(500)}
          className="flex-row items-end justify-center gap-4"
        >
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
      className="items-center gap-2 rounded-3xl px-2 py-3 active:opacity-80"
    >
      <MoodAvatar member={member.family_member} mood={member.mood} width={140} height={184} />
      <Text className="text-xl font-semibold text-foreground">{firstName}</Text>
      <Text className="text-sm text-muted">{moodLabel(member.mood)}</Text>
    </Pressable>
  );
}
