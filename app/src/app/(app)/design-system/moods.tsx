import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import type { FamilyMember } from '@/api/auth';
import { MOOD_MAX, moodLabel } from '@/api/moods';
import { MoodAvatar } from '@/components/moods/MoodAvatar';

const MEMBERS: { member: FamilyMember; name: string }[] = [
  { member: 'alfonso', name: 'Alfonso' },
  { member: 'saida', name: 'Saida' },
];

const LEVELS = Array.from({ length: MOOD_MAX }, (_, index) => index + 1);

export default function Moods() {
  return (
    <>
      <Stack.Screen.Title large>Moods</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 p-4"
      >
        <Text className="text-sm text-muted">
          Nine expression frames per person, from most upset (1) through neutral (5) to happiest
          (9).
        </Text>

        {MEMBERS.map(({ member, name }) => (
          <View key={member} className="gap-3">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
              {name}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4">
              <View className="flex-row gap-4 px-4">
                {LEVELS.map((level) => (
                  <View key={level} className="items-center gap-1">
                    <View className="rounded-2xl bg-surface p-2">
                      <MoodAvatar member={member} mood={level} width={80} height={104} />
                    </View>
                    <Text className="text-sm font-semibold text-foreground">{level}</Text>
                    <Text className="text-xs text-muted">{moodLabel(level)}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </>
  );
}
