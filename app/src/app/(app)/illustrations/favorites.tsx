import { Image } from 'expo-image';
import { Stack, useFocusEffect } from 'expo-router';
import { DownloadSimple, Trash } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native';

import {
  fetchFavoriteIllustrations,
  removeFavoriteIllustration,
  type FavoriteIllustration,
} from '@/api/illustration-favorites';
import { useApiRouter } from '@/api/router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { saveImageToPhotos } from '@/lib/save-to-photos';

// The family gallery: every illustration someone chose to keep, ready to
// save to Photos and print.
export default function IllustrationFavoritesScreen() {
  const route = useApiRouter();

  const [favorites, setFavorites] = useState<FavoriteIllustration[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      setFavorites(await fetchFavoriteIllustrations(route));
      setLoaded(true);
    } catch {
      // The next focus retries.
    }
  }, [route]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const handleRemove = (favorite: FavoriteIllustration) => {
    Alert.alert('Remove from the gallery?', 'The illustration will be gone for good.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await removeFavoriteIllustration(route, favorite.id);
              setFavorites((current) => current.filter((entry) => entry.id !== favorite.id));
            } catch {
              Alert.alert('Could not remove it', 'Please try again.');
            }
          })();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Gallery' }} />
      <FlatList
        className="flex-1 bg-background"
        data={favorites}
        numColumns={2}
        keyExtractor={(favorite) => String(favorite.id)}
        contentContainerClassName="gap-3 p-4"
        columnWrapperClassName="gap-3"
        contentInsetAdjustmentBehavior="automatic"
        renderItem={({ item }) => <FavoriteCard favorite={item} onRemove={handleRemove} />}
        ListEmptyComponent={
          loaded ? (
            <View className="items-center px-8 pt-24">
              <Text className="text-5xl">🎨</Text>
              <Text className="mt-3 text-center text-lg font-semibold text-foreground">
                Nothing here yet
              </Text>
              <Text className="mt-1 text-center text-base text-muted">
                Keep illustrations from the Illustrator chat and they&apos;ll show up here.
              </Text>
            </View>
          ) : null
        }
      />
    </>
  );
}

function FavoriteCard({
  favorite,
  onRemove,
}: {
  favorite: FavoriteIllustration;
  onRemove: (favorite: FavoriteIllustration) => void;
}) {
  const muted = useThemeColor('muted');
  const danger = useThemeColor('danger');

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!favorite.url) {
      return;
    }

    setSaving(true);
    try {
      await saveImageToPhotos(favorite.url);
      Alert.alert('Saved', 'The illustration is in your photo library.');
    } catch {
      Alert.alert('Could not save', 'Check the Photos permission and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 overflow-hidden rounded-3xl bg-surface">
      {/* White backing keeps the transparent PNG readable in dark mode. */}
      <View className="aspect-square items-center justify-center bg-white p-2">
        {favorite.url ? (
          <Image
            source={{ uri: favorite.url }}
            contentFit="contain"
            style={{ width: '100%', height: '100%' }}
          />
        ) : null}
      </View>

      <View className="flex-row items-center gap-2 p-2.5">
        {favorite.prompt ? (
          <Text className="flex-1 text-xs text-muted" numberOfLines={2}>
            {favorite.prompt}
          </Text>
        ) : (
          <View className="flex-1" />
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save to Photos"
          disabled={saving}
          onPress={() => void handleSave()}
          hitSlop={6}
          className="h-9 w-9 items-center justify-center rounded-full bg-surface-selected active:opacity-70"
        >
          {saving ? (
            <ActivityIndicator size="small" color={muted} />
          ) : (
            <DownloadSimple size={16} color={muted} />
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove from the gallery"
          onPress={() => onRemove(favorite)}
          hitSlop={6}
          className="h-9 w-9 items-center justify-center rounded-full bg-surface-selected active:opacity-70"
        >
          <Trash size={16} color={danger} />
        </Pressable>
      </View>
    </View>
  );
}
