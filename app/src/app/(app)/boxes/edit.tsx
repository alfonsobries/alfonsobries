import { router, useLocalSearchParams } from 'expo-router';
import { MapPin } from 'phosphor-react-native';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { deleteBox, saveBox } from '@/api/boxes';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { pickEmoji } from '@/components/ui/emoji-keyboard';
import { Input } from '@/components/ui/Input';
import { Sheet } from '@/components/ui/Sheet';
import { useBoxes } from '@/hooks/use-boxes';
import { errorMessage } from '@/lib/box-errors';

/** Name, emoji and whereabouts of a box, new or existing. */
export default function EditBoxScreen() {
  const params = useLocalSearchParams<{
    token?: string;
    name?: string;
    emoji?: string;
    location?: string;
  }>();
  const route = useApiRouter();
  const boxes = useBoxes();
  const token = params.token || undefined;

  const [name, setName] = useState(params.name ?? '');
  const [emoji, setEmoji] = useState(params.emoji || '📦');
  const [location, setLocation] = useState(params.location ?? '');
  const [saving, setSaving] = useState(false);

  const knownLocations = useMemo(() => {
    const all = (boxes.data ?? [])
      .map((box) => box.location?.trim())
      .filter((value): value is string => Boolean(value));

    return [...new Set(all)].filter((value) => value !== location.trim()).slice(0, 6);
  }, [boxes.data, location]);

  const handlePickEmoji = async () => {
    const picked = await pickEmoji();
    if (picked) {
      setEmoji(picked);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const box = await saveBox(
        route,
        { name: name.trim(), emoji, location: location.trim() || null },
        token,
      );

      if (token) {
        router.back();
      } else {
        router.replace({ pathname: '/b/[token]', params: { token: box.token } });
      }
    } catch (error) {
      setSaving(false);
      Alert.alert('No se pudo guardar', errorMessage(error));
    }
  };

  const handleDelete = () => {
    if (!token) {
      return;
    }

    Alert.alert('¿Borrar esta caja?', 'También se borra todo lo que anotaste dentro.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteBox(route, token);
              router.dismissTo('/boxes');
            } catch (error) {
              Alert.alert('No se pudo borrar', errorMessage(error));
            }
          })();
        },
      },
    ]);
  };

  return (
    <Sheet title={token ? 'Caja' : 'Nueva caja'} scrollable className="gap-5">
      <View className="items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Emoji: ${emoji}. Toca para cambiarlo`}
          onPress={() => void handlePickEmoji()}
          className="h-24 w-24 items-center justify-center rounded-[28px] bg-surface active:opacity-70"
        >
          <Text className="text-6xl" allowFontScaling={false}>
            {emoji}
          </Text>
        </Pressable>
        <Text className="mt-2 text-sm text-muted">Toca para elegir un emoji</Text>
      </View>

      <Input
        label="Nombre"
        placeholder="Adornos de Navidad"
        value={name}
        onChangeText={setName}
        maxLength={60}
        autoFocus={!token}
        returnKeyType="next"
      />

      <View className="gap-2">
        <Input
          label="Dónde está (opcional)"
          placeholder="Bodega, repisa de arriba"
          icon={MapPin}
          value={location}
          onChangeText={setLocation}
          maxLength={60}
          returnKeyType="done"
        />
        {knownLocations.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2"
          >
            {knownLocations.map((known) => (
              <Pressable
                key={known}
                accessibilityRole="button"
                accessibilityLabel={`Usar ${known}`}
                onPress={() => setLocation(known)}
                className="h-9 justify-center rounded-full bg-surface px-3.5 active:bg-surface-selected"
              >
                <Text className="text-sm font-medium text-foreground">{known}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
      </View>

      <View className="mt-4 gap-3">
        <Button
          fullWidth
          loading={saving}
          disabled={name.trim().length === 0}
          onPress={() => void handleSave()}
        >
          {token ? 'Guardar' : 'Crear caja'}
        </Button>
        {token ? (
          <Pressable
            accessibilityRole="button"
            onPress={handleDelete}
            className="h-11 items-center justify-center rounded-full active:bg-surface-selected"
          >
            <Text className="text-base font-medium text-danger">Borrar caja</Text>
          </Pressable>
        ) : null}
      </View>
    </Sheet>
  );
}
