import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Camera, MapPin, PencilSimple, QrCode } from 'phosphor-react-native';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { piecesIn, type Box, type BoxItem } from '@/api/boxes';
import { BoxItemTile } from '@/components/boxes/BoxItemTile';
import { Button } from '@/components/ui/Button';
import { useBoxes } from '@/hooks/use-boxes';
import { useThemeColor } from '@/hooks/use-theme-color';

const SIDE_PADDING = 16;
const COLUMN_GAP = 12;

function openItem(box: Box, item?: BoxItem) {
  router.push({
    pathname: '/boxes/item',
    params: item
      ? {
          box: box.token,
          id: String(item.id),
          name: item.name,
          quantity: String(item.quantity),
          notes: item.notes ?? '',
          sticker: item.sticker_url ?? '',
        }
      : { box: box.token },
  });
}

function BoxSummary({ box }: { box: Box }) {
  const muted = useThemeColor('muted');
  const pieces = piecesIn(box);

  return (
    <View className="gap-4 pb-4">
      <View className="flex-row flex-wrap gap-2">
        {box.location ? (
          <View className="h-8 flex-row items-center gap-1.5 rounded-full bg-surface px-3">
            <MapPin size={15} color={muted} weight="bold" />
            <Text className="text-sm font-medium text-foreground">{box.location}</Text>
          </View>
        ) : null}
        <View className="h-8 justify-center rounded-full bg-surface px-3">
          <Text className="text-sm font-medium text-foreground">
            {pieces === 1 ? '1 cosa' : `${pieces} cosas`}
          </Text>
        </View>
      </View>
      {box.items.length > 0 ? (
        <Button variant="secondary" icon={Camera} fullWidth onPress={() => openItem(box)}>
          Agregar algo
        </Button>
      ) : null}
    </View>
  );
}

function EmptyBox({ box }: { box: Box }) {
  const muted = useThemeColor('muted');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Agregar lo primero a la caja"
      onPress={() => openItem(box)}
      className="items-center gap-3 rounded-3xl border-2 border-dashed border-border px-6 py-12 active:bg-surface"
    >
      <Camera size={40} color={muted} weight="duotone" />
      <Text className="text-center text-lg font-semibold text-foreground">
        ¿Qué hay en esta caja?
      </Text>
      <Text className="text-center text-base text-muted">
        Toma foto de cada cosa; la recorto y la convierto en sticker.
      </Text>
    </Pressable>
  );
}

/**
 * One box: everything inside as stickers. This is also where a scanned label
 * lands when the app is installed, so the URL path matches the printed QR.
 */
export default function BoxScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const boxes = useBoxes();
  const { width } = useWindowDimensions();
  const tint = useThemeColor('foreground');
  const muted = useThemeColor('muted');

  const box = boxes.data?.find((entry) => entry.token === token) ?? null;
  const tileSize = Math.floor((width - SIDE_PADDING * 2 - COLUMN_GAP) / 2);

  const { refresh } = boxes;
  useEffect(() => {
    // A freshly created or scanned box may not be in the cached list yet.
    if (boxes.data !== null && box === null) {
      void refresh();
    }
  }, [box, boxes.data, refresh]);

  if (box === null) {
    const missing = boxes.status === 'ready';

    return (
      <>
        <Stack.Screen options={{ title: 'Caja' }} />
        <View className="flex-1 items-center justify-center gap-2 bg-background px-8">
          {missing || boxes.status === 'error' ? (
            <>
              <Text className="text-center text-lg font-semibold text-foreground">
                {boxes.status === 'error' ? 'Sin conexión' : 'Esta caja ya no existe'}
              </Text>
              <Text className="text-center text-base text-muted">
                {boxes.status === 'error'
                  ? 'Ábrela de nuevo cuando tengas internet.'
                  : 'Puede que la hayan borrado. Quita su etiqueta.'}
              </Text>
            </>
          ) : (
            <ActivityIndicator color={muted} />
          )}
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `${box.emoji} ${box.name}`,
          headerRight: () => (
            <View className="flex-row items-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Etiqueta con QR"
                hitSlop={8}
                onPress={() =>
                  router.push({ pathname: '/boxes/label', params: { token: box.token } })
                }
                className="h-11 w-11 items-center justify-center active:opacity-60"
              >
                <QrCode size={22} color={tint} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Editar caja"
                hitSlop={8}
                onPress={() =>
                  router.push({
                    pathname: '/boxes/edit',
                    params: {
                      token: box.token,
                      name: box.name,
                      emoji: box.emoji,
                      location: box.location ?? '',
                    },
                  })
                }
                className="h-11 w-11 items-center justify-center active:opacity-60"
              >
                <PencilSimple size={22} color={tint} />
              </Pressable>
            </View>
          ),
        }}
      />
      <FlatList
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: SIDE_PADDING,
          paddingTop: 8,
          paddingBottom: 64,
        }}
        columnWrapperStyle={{ gap: COLUMN_GAP }}
        numColumns={2}
        data={box.items}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={<BoxSummary box={box} />}
        ListEmptyComponent={<EmptyBox box={box} />}
        renderItem={({ item }) => (
          <View style={{ width: tileSize }} className="mb-3">
            <BoxItemTile item={item} size={tileSize - 16} onPress={() => openItem(box, item)} />
          </View>
        )}
      />
    </>
  );
}
