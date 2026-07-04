import { Stack } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import type { Behavior, BehaviorLogEntry } from '@/api/behaviors';
import { BehaviorFeed } from '@/components/behaviors/BehaviorFeed';
import { BehaviorTile } from '@/components/behaviors/BehaviorTile';
import { ImageUploadField } from '@/components/ui/ImageUploadField';
import type { UploadedImage } from '@/hooks/use-image-upload';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</Text>
      {children}
    </View>
  );
}

const SAMPLE_BEHAVIOR: Behavior = {
  id: 0,
  family_member: 'regina',
  name: 'Shouting',
  points: 1,
  image_url: null,
};

const SAMPLE_ENTRIES: BehaviorLogEntry[] = [
  {
    id: 1,
    family_member: 'regina',
    behavior: { id: 0, name: 'Shouting', image_url: null },
    points: 1,
    affected_mood: true,
    mood_emoji: '😞',
    logged_by: { family_member: 'alfonso', name: 'Alfonso' },
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    family_member: 'andres',
    behavior: { id: 0, name: 'Tantrum', image_url: null },
    points: 1,
    affected_mood: false,
    mood_emoji: null,
    logged_by: { family_member: 'saida', name: 'Saida' },
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

export default function Media() {
  const [upload, setUpload] = useState<UploadedImage | null>(null);

  return (
    <>
      <Stack.Screen.Title large>Media</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 p-4"
      >
        <Section title="Image upload field">
          <ImageUploadField
            label="Photo"
            helperText="Uploads straight to S3 and hands back a temp key."
            value={upload}
            onChange={setUpload}
          />
          {upload ? (
            <Text className="px-4 text-xs text-muted" numberOfLines={1}>
              Key: {upload.key}
            </Text>
          ) : null}
        </Section>

        <Section title="Behavior tile">
          <View className="flex-row">
            <View className="w-1/2 pr-1.5">
              <BehaviorTile behavior={SAMPLE_BEHAVIOR} onPress={() => undefined} />
            </View>
          </View>
        </Section>

        <Section title="Behavior feed">
          <BehaviorFeed entries={SAMPLE_ENTRIES} showKid />
        </Section>
      </ScrollView>
    </>
  );
}
