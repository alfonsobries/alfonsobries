import { router, Stack } from 'expo-router';
import { Package, Plus, Printer } from 'phosphor-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { searchBoxes, type Box, type BoxSearchHit } from '@/api/boxes';
import { BoxCard } from '@/components/boxes/BoxCard';
import { Sticker } from '@/components/boxes/Sticker';
import { Button } from '@/components/ui/Button';
import { useBoxes } from '@/hooks/use-boxes';
import { useThemeColor } from '@/hooks/use-theme-color';

function openBox(box: Box) {
  router.push({ pathname: '/b/[token]', params: { token: box.token } });
}

function SearchHitRow({ hit }: { hit: BoxSearchHit }) {
  const quantity = hit.item.quantity > 1 ? ` ×${hit.item.quantity}` : '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${hit.item.name}${quantity}, en ${hit.box.name}`}
      onPress={() => openBox(hit.box)}
      className="flex-row items-center gap-3 rounded-2xl px-2 py-1.5 active:bg-surface-selected"
    >
      <Sticker uri={hit.item.sticker_url} name={hit.item.name} size={56} />
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
          {hit.item.name}
          {quantity ? <Text className="font-normal text-muted">{quantity}</Text> : null}
        </Text>
        <Text className="text-sm text-muted" numberOfLines={1}>
          {hit.box.emoji} {hit.box.name}
          {hit.box.location ? ` · ${hit.box.location}` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * The storage boxes, shared by both parents. Searching looks inside every
 * box at once, which is the point: knowing where something is without
 * opening anything.
 */
export default function BoxesScreen() {
  const boxes = useBoxes();
  const tint = useThemeColor('foreground');
  const muted = useThemeColor('muted');
  const [query, setQuery] = useState('');

  const hits = useMemo(() => searchBoxes(boxes.data ?? [], query), [boxes.data, query]);
  const searching = query.trim().length > 0;

  const handleNewBox = () => router.push('/boxes/edit');

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Cajas',
          headerSearchBarOptions: {
            placeholder: 'Buscar en todas las cajas',
            hideWhenScrolling: false,
            onChangeText: (event) => setQuery(event.nativeEvent.text),
            onCancelButtonPress: () => setQuery(''),
          },
          headerRight: () => (
            <View className="flex-row items-center">
              {(boxes.data?.length ?? 0) > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Hoja de etiquetas"
                  hitSlop={8}
                  onPress={() => router.push('/boxes/labels')}
                  className="h-11 w-11 items-center justify-center active:opacity-60"
                >
                  <Printer size={22} color={tint} />
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Nueva caja"
                hitSlop={8}
                onPress={handleNewBox}
                className="h-11 w-11 items-center justify-center active:opacity-60"
              >
                <Plus size={22} color={tint} />
              </Pressable>
            </View>
          ),
        }}
      />

      {boxes.data === null ? (
        <View className="flex-1 items-center justify-center bg-background px-8">
          {boxes.status === 'error' ? (
            <Text className="text-center text-base text-muted">
              No se pudieron cargar las cajas. Revisa tu conexión.
            </Text>
          ) : (
            <ActivityIndicator color={muted} />
          )}
        </View>
      ) : searching ? (
        <FlatList
          className="flex-1 bg-background"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-1 px-3 pb-16 pt-2"
          keyboardDismissMode="on-drag"
          data={hits}
          keyExtractor={(hit) => String(hit.item.id)}
          renderItem={({ item }) => <SearchHitRow hit={item} />}
          ListEmptyComponent={
            <Text className="px-6 py-16 text-center text-base text-muted">
              {`Nada con "${query.trim()}" en tus cajas.`}
            </Text>
          }
        />
      ) : (
        <FlatList
          className="flex-1 bg-background"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-3 px-4 pb-16 pt-2"
          data={boxes.data}
          keyExtractor={(box) => box.token}
          renderItem={({ item }) => <BoxCard box={item} onPress={() => openBox(item)} />}
          ListEmptyComponent={
            <View className="items-center gap-4 px-6 py-20">
              <View className="h-24 w-24 items-center justify-center rounded-[32px] bg-surface">
                <Package size={48} color={muted} weight="duotone" />
              </View>
              <View className="gap-1">
                <Text className="text-center text-xl font-semibold text-foreground">
                  Ninguna caja todavía
                </Text>
                <Text className="text-center text-base text-muted">
                  Crea una, toma foto de lo que guardas y pégale su QR para saber qué hay dentro sin
                  abrirla.
                </Text>
              </View>
              <Button icon={Plus} onPress={handleNewBox}>
                Nueva caja
              </Button>
            </View>
          }
        />
      )}
    </>
  );
}
