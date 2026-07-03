import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { Smiley, Star } from 'phosphor-react-native';
import { ScrollView, Text, View } from 'react-native';

import { getPerson } from '@/api/family';
import { moodLabel, useMoods } from '@/api/moods';
import { AvatarCircle } from '@/components/family/AvatarCircle';
import { ActionTile } from '@/components/ui/ActionTile';

export default function ProfileScreen() {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const { members } = useMoods();

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
          <View className="flex-row flex-wrap">
            <View className="w-1/2 p-1.5">
              <ActionTile
                icon={Smiley}
                label="Adjust mood"
                onPress={() => router.push(`/mood?member=${person.key}`)}
              />
            </View>
            <View className="w-1/2 p-1.5">
              <ActionTile icon={Star} label="Coming soon" disabled />
            </View>
          </View>
        ) : (
          <Text className="text-center text-sm text-muted">Nothing here yet.</Text>
        )}
      </ScrollView>
    </>
  );
}
