import { Image } from 'expo-image';
import { CheckCircle } from 'phosphor-react-native';
import { useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';

import {
  emotionLabel,
  KID_EMOTIONS,
  useKidEmotions,
  type KidEmotion,
  type KidMember,
} from '@/api/kid-emotions';
import { EMOTION_PORTRAITS } from '@/components/emotions/emotion-portraits';
import { useThemeColor } from '@/hooks/use-theme-color';

type KidEmotionPickerProperties = {
  member: KidMember;
  name: string;
};

export function KidEmotionPicker({ member, name }: KidEmotionPickerProperties) {
  const { members, updateEmotion } = useKidEmotions();
  const selected = members.find((entry) => entry.family_member === member)?.emotion ?? null;
  const [saving, setSaving] = useState<KidEmotion | null>(null);

  async function handleSelect(emotion: KidEmotion): Promise<void> {
    if (saving !== null) {
      return;
    }

    setSaving(emotion);

    try {
      await updateEmotion(member, emotion);
    } catch {
      Alert.alert('No se pudo guardar', 'Inténtalo otra vez en un momento.');
    } finally {
      setSaving(null);
    }
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      data={KID_EMOTIONS}
      numColumns={3}
      keyExtractor={(emotion) => emotion}
      columnWrapperClassName="gap-3"
      contentContainerClassName="gap-3 p-4 pb-10"
      ListHeaderComponent={
        <View className="gap-1 pb-3">
          <Text className="text-2xl font-semibold text-foreground">¿Cómo te sientes?</Text>
          <Text className="text-base text-muted">
            {name}, toca la carita que más se parece a cómo estás ahora.
          </Text>
          {selected ? (
            <Text className="pt-2 text-base font-medium text-primary">
              Me siento {emotionLabel(member, selected).toLowerCase()}
            </Text>
          ) : null}
        </View>
      }
      renderItem={({ item }) => (
        <EmotionTile
          emotion={item}
          label={emotionLabel(member, item)}
          member={member}
          selected={item === selected}
          disabled={saving !== null}
          onSelect={handleSelect}
        />
      )}
    />
  );
}

type EmotionTileProperties = {
  emotion: KidEmotion;
  label: string;
  member: KidMember;
  selected: boolean;
  disabled: boolean;
  onSelect: (emotion: KidEmotion) => Promise<void>;
};

function EmotionTile({
  emotion,
  label,
  member,
  selected,
  disabled,
  onSelect,
}: EmotionTileProperties) {
  const primary = useThemeColor('primary-emphasis');

  function handlePress(): void {
    void onSelect(emotion);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Me siento ${label.toLowerCase()}`}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={handlePress}
      className={`relative flex-1 items-center gap-1 rounded-3xl border-2 p-2 active:opacity-80 ${
        selected ? 'border-primary bg-surface-selected' : 'border-transparent bg-surface'
      }`}
    >
      <View className="aspect-square w-full items-center justify-center overflow-hidden rounded-2xl">
        <Image
          source={EMOTION_PORTRAITS[member][emotion]}
          accessibilityLabel={label}
          contentFit="contain"
          recyclingKey={`${member}-${emotion}`}
          style={{ width: '100%', height: '100%' }}
        />
      </View>
      <Text className="text-center text-sm font-medium text-foreground" numberOfLines={1}>
        {label}
      </Text>
      {selected ? (
        <View className="absolute right-1.5 top-1.5 rounded-full bg-surface">
          <CheckCircle size={24} color={primary} weight="fill" />
        </View>
      ) : null}
    </Pressable>
  );
}
