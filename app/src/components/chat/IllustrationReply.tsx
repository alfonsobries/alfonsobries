import { Image } from 'expo-image';
import { DownloadSimple, Star } from 'phosphor-react-native';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import type { ChatMessage } from '@/api/chat';
import { addFavoriteIllustration } from '@/api/illustration-favorites';
import { useApiRouter } from '@/api/router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { saveImageToPhotos } from '@/lib/save-to-photos';

type IllustrationReplyProperties = {
  message: ChatMessage;
};

/**
 * A generated illustration in the thread, with its two actions: keep it in
 * the family gallery and save it to Photos (for printing and sharing).
 */
export function IllustrationReply({ message }: IllustrationReplyProperties) {
  const route = useApiRouter();
  const muted = useThemeColor('muted');
  const gold = useThemeColor('warning');

  const [favorited, setFavorited] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const [saving, setSaving] = useState(false);

  const attachment = message.attachments[0];

  if (!attachment) {
    return null;
  }

  const handleFavorite = async () => {
    if (favorited) {
      return;
    }

    setFavoriting(true);
    try {
      await addFavoriteIllustration(route, message.id);
      setFavorited(true);
    } catch {
      Alert.alert('Could not save to the gallery', 'Please try again.');
    } finally {
      setFavoriting(false);
    }
  };

  const handleSaveToPhotos = async () => {
    setSaving(true);
    try {
      await saveImageToPhotos(attachment.url);
      Alert.alert('Saved', 'The illustration is in your photo library.');
    } catch {
      Alert.alert('Could not save', 'Check the Photos permission and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="max-w-[85%] gap-2">
      {/* Transparent PNG on a white card so dark mode never swallows the line art. */}
      <View className="overflow-hidden rounded-3xl rounded-bl-lg bg-white p-2">
        <Image
          source={{ uri: attachment.url }}
          contentFit="contain"
          style={{ width: 256, height: 256 }}
        />
      </View>

      <View className="flex-row gap-2 px-1">
        <ActionChip
          label={favorited ? 'In the gallery' : 'Keep'}
          busy={favoriting}
          onPress={() => void handleFavorite()}
        >
          <Star size={16} weight={favorited ? 'fill' : 'regular'} color={gold} />
        </ActionChip>
        <ActionChip label="Save" busy={saving} onPress={() => void handleSaveToPhotos()}>
          <DownloadSimple size={16} color={muted} />
        </ActionChip>
      </View>
    </View>
  );
}

function ActionChip({
  label,
  busy,
  onPress,
  children,
}: {
  label: string;
  busy: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  const muted = useThemeColor('muted');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={busy}
      onPress={onPress}
      className="h-9 flex-row items-center gap-1.5 rounded-full bg-surface px-3 active:opacity-70"
    >
      {busy ? <ActivityIndicator size="small" color={muted} /> : children}
      <Text className="text-sm font-medium text-foreground">{label}</Text>
    </Pressable>
  );
}
