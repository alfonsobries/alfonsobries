import { router, Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { PEOPLE, type Person } from '@/api/family';
import { useKidEmotions, type KidEmotion } from '@/api/kid-emotions';
import { moodEmoji, useMoods } from '@/api/moods';
import { PersonAvatar } from '@/components/family/PersonAvatar';
import { Card } from '@/components/ui/Card';

export default function FamilyScreen() {
  const { members } = useMoods();
  const { members: kidEmotions } = useKidEmotions();

  const moodFor = (key: Person['key']) => members.find((m) => m.family_member === key)?.mood;
  const emotionFor = (key: Person['key']) =>
    kidEmotions.find((entry) => entry.family_member === key)?.emotion;

  return (
    <>
      <Stack.Screen.Title>Family</Stack.Screen.Title>

      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="px-4 pb-6 pt-4"
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text className="text-base text-muted">Everyone at a glance</Text>

        <Animated.View entering={FadeIn.duration(500)} className="mt-5 flex-row flex-wrap">
          {PEOPLE.map((person) => (
            <View key={person.key} className="w-1/2 p-1.5">
              <PersonCard
                person={person}
                mood={person.hasMood ? moodFor(person.key) : undefined}
                emotion={emotionFor(person.key)}
              />
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeIn.duration(500)} className="mt-1.5 flex-row gap-3 px-1.5">
          <ToolCard
            emoji="🎨"
            label="Illustrator"
            subtitle="Draw the family"
            onPress={() => router.push('/chat/thread?assistantSlug=illustrator')}
          />
          <ToolCard
            emoji="🖼️"
            label="Gallery"
            subtitle="Saved drawings"
            onPress={() => router.push('/illustrations/favorites')}
          />
        </Animated.View>
      </ScrollView>
    </>
  );
}

function ToolCard({
  emoji,
  label,
  subtitle,
  onPress,
}: {
  emoji: string;
  label: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Card
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-1 flex-row items-center gap-3 p-3"
    >
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface-selected">
        <Text className="text-xl">{emoji}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
          {label}
        </Text>
        <Text className="text-xs text-muted" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Card>
  );
}

function PersonCard({
  person,
  mood,
  emotion,
}: {
  person: Person;
  mood?: number;
  emotion?: KidEmotion | null;
}) {
  return (
    <Card
      accessibilityLabel={person.name}
      onPress={() => router.push(`/profile?member=${person.key}`)}
      className="items-center gap-2"
    >
      <PersonAvatar person={person.key} mood={mood} emotion={emotion} width={110} height={144} />
      <View className="flex-row items-center gap-1.5">
        <Text className="text-lg font-semibold text-foreground">{person.name}</Text>
        {mood != null ? <Text className="text-lg">{moodEmoji(mood)}</Text> : null}
      </View>
    </Card>
  );
}
