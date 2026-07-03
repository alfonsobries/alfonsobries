import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { CaretRight, SlidersHorizontal } from 'phosphor-react-native';
import { ScrollView, Text, View } from 'react-native';

import { getPerson } from '@/api/family';
import { moodLabel, useMoods } from '@/api/moods';
import { AvatarCircle } from '@/components/family/AvatarCircle';
import { Card } from '@/components/ui/Card';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ProfileScreen() {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const { members } = useMoods();
  const accent = useThemeColor('primary-emphasis');
  const muted = useThemeColor('muted');

  const person = getPerson(member);

  if (!person) {
    return <Redirect href="/" />;
  }

  const record = person.hasMood
    ? members.find((entry) => entry.family_member === person.key)
    : undefined;

  return (
    <>
      <Stack.Screen options={{ title: person.name }} />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 p-4"
      >
        <View className="items-center gap-3 pt-2">
          <AvatarCircle person={person.key} mood={record?.mood} size={176} />

          <View className="items-center gap-1">
            <Text className="text-2xl font-semibold text-foreground">{person.name}</Text>
            {person.hasMood && record ? (
              <Text className="text-base text-muted">
                Feels {moodLabel(record.mood).toLowerCase()}
              </Text>
            ) : null}
          </View>
        </View>

        {person.hasMood ? (
          <Card
            accessibilityLabel="Adjust mood"
            onPress={() => router.push(`/mood?member=${person.key}`)}
            className="flex-row items-center gap-3"
          >
            <View className="size-10 items-center justify-center rounded-full bg-surface-selected">
              <SlidersHorizontal size={20} color={accent} weight="bold" />
            </View>
            <Text className="flex-1 text-base font-semibold text-foreground">Adjust mood</Text>
            <CaretRight size={18} color={muted} weight="bold" />
          </Card>
        ) : (
          <Text className="text-center text-sm text-muted">Nothing here yet.</Text>
        )}
      </ScrollView>
    </>
  );
}
