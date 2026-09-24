import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { deleteCategory, saveCategory } from '@/api/expenses';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { pickEmoji } from '@/components/ui/emoji-keyboard';
import { Input } from '@/components/ui/Input';
import { Sheet } from '@/components/ui/Sheet';
import { isOfflineError } from '@/offline/connectivity';

function errorMessage(error: unknown): string {
  if (isOfflineError(error)) {
    return 'Estás sin conexión.';
  }

  const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;

  return message ?? 'Intenta de nuevo.';
}

/** Name and emoji of a category, new or existing. */
export default function ExpenseCategoryScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    emoji?: string;
    archived?: string;
  }>();
  const route = useApiRouter();
  const id = params.id ? Number(params.id) : undefined;
  const archived = params.archived === '1';

  const [name, setName] = useState(params.name ?? '');
  const [emoji, setEmoji] = useState(params.emoji ?? '📦');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveCategory(route, { name: name.trim(), emoji }, id);
      router.back();
    } catch (error) {
      setSaving(false);
      Alert.alert('No se pudo guardar', errorMessage(error));
    }
  };

  const handleRestore = async () => {
    try {
      await saveCategory(route, { archived: false }, id);
      router.back();
    } catch (error) {
      Alert.alert('No se pudo restaurar', errorMessage(error));
    }
  };

  const handleDelete = () => {
    if (!id) {
      return;
    }

    Alert.alert(
      '¿Quitar esta categoría?',
      'Si ya tiene gastos, se archiva para no perder su historial.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteCategory(route, id);
                router.back();
              } catch (error) {
                Alert.alert('No se pudo quitar', errorMessage(error));
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <Sheet title={id ? 'Categoría' : 'Nueva categoría'} className="gap-5">
      <View className="items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Emoji: ${emoji}. Toca para cambiarlo`}
          onPress={() => {
            void (async () => {
              const picked = await pickEmoji();
              if (picked) {
                setEmoji(picked);
              }
            })();
          }}
          className="h-20 w-20 items-center justify-center rounded-3xl bg-surface active:opacity-70"
        >
          <Text className="text-5xl" allowFontScaling={false}>
            {emoji}
          </Text>
        </Pressable>
      </View>

      <Input
        label="Nombre"
        placeholder="Mascotas"
        value={name}
        onChangeText={setName}
        maxLength={40}
        autoFocus={!id}
        returnKeyType="done"
      />

      <View className="mt-auto gap-3">
        <Button
          fullWidth
          loading={saving}
          disabled={name.trim().length === 0}
          onPress={() => void handleSave()}
        >
          Guardar
        </Button>
        {id && archived ? (
          <Button fullWidth variant="secondary" onPress={() => void handleRestore()}>
            Volver a usarla
          </Button>
        ) : null}
        {id && !archived ? (
          <Pressable
            accessibilityRole="button"
            onPress={handleDelete}
            className="h-11 items-center justify-center rounded-full active:bg-surface-selected"
          >
            <Text className="text-base font-medium text-danger">Quitar categoría</Text>
          </Pressable>
        ) : null}
      </View>
    </Sheet>
  );
}
