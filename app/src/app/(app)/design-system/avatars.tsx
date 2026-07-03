import { Stack } from 'expo-router';
import { type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { PEOPLE } from '@/api/family';
import { AvatarCircle } from '@/components/family/AvatarCircle';
import { FamilyAvatar } from '@/components/family/FamilyAvatar';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</Text>
      {children}
    </View>
  );
}

export default function Avatars() {
  return (
    <>
      <Stack.Screen.Title large>Avatars</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 p-4"
      >
        <Text className="text-sm text-muted">
          The four family avatars, reusable across the app.
        </Text>

        <Section title="Full body">
          <View className="flex-row flex-wrap">
            {PEOPLE.map((person) => (
              <View key={person.key} className="w-1/2 items-center gap-2 p-3">
                <FamilyAvatar person={person.key} width={110} height={144} />
                <Text className="text-sm font-semibold text-foreground">{person.name}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Circle">
          <View className="flex-row flex-wrap">
            {PEOPLE.map((person) => (
              <View key={person.key} className="w-1/2 items-center gap-2 p-3">
                <AvatarCircle person={person.key} size={140} />
                <Text className="text-sm font-semibold text-foreground">{person.name}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Any size">
          <View className="flex-row flex-wrap items-end gap-4">
            {[40, 56, 80, 120].map((size) => (
              <View key={size} className="items-center gap-1">
                <AvatarCircle person="alfonso" size={size} />
                <Text className="text-xs text-muted">{size}</Text>
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>
    </>
  );
}
