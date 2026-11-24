import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Camera, Images, Package } from 'phosphor-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { createBoxItem, deleteBoxItem, updateBoxItem, type BoxItemInput } from '@/api/boxes';
import { useApiRouter } from '@/api/router';
import { uploadTempFile } from '@/api/uploads';
import { Sticker } from '@/components/boxes/Sticker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Stepper } from '@/components/ui/Stepper';
import { Switch } from '@/components/ui/Switch';
import { useBoxes } from '@/hooks/use-boxes';
import { useThemeColor } from '@/hooks/use-theme-color';
import { errorMessage } from '@/lib/box-errors';
import { canMakeStickers, makeSticker } from '../../../../modules/sticker-maker';

const MAX_QUANTITY = 999;
const PREVIEW_SIZE = 240;

type Source = 'camera' | 'library';

type Picture = {
  /** The photo as taken, kept so the cutout can be toggled without retaking it. */
  photoUri: string;
  /** What gets uploaded: the sticker, or the photo itself when stickers aren't available. */
  uri: string;
  lifted: boolean;
};

async function pickPhoto(source: Source): Promise<string | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permission.status !== ImagePicker.PermissionStatus.GRANTED) {
    Alert.alert(
      source === 'camera' ? 'Sin acceso a la cámara' : 'Sin acceso a tus fotos',
      'Actívalo en Ajustes para agregar fotos a tus cajas.',
    );
    return null;
  }

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    // The subject is found on the whole frame, so no square crop here.
    allowsEditing: false,
    quality: 0.9,
  };

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

  return result.canceled ? null : (result.assets?.[0]?.uri ?? null);
}

/**
 * Adds something to a box, or edits it: a photo that becomes a sticker, a
 * name, how many there are and a note. Editing can also move it to another box.
 */
export default function BoxItemScreen() {
  const params = useLocalSearchParams<{
    box: string;
    id?: string;
    name?: string;
    quantity?: string;
    notes?: string;
    sticker?: string;
  }>();
  const route = useApiRouter();
  const boxes = useBoxes();
  const muted = useThemeColor('muted');
  const itemId = params.id ? Number(params.id) : undefined;

  const [picture, setPicture] = useState<Picture | null>(null);
  const [liftSubject, setLiftSubject] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [name, setName] = useState(params.name ?? '');
  const [quantity, setQuantity] = useState(() => {
    const parsed = Number(params.quantity);
    return parsed >= 1 && parsed <= MAX_QUANTITY ? parsed : 1;
  });
  const [notes, setNotes] = useState(params.notes ?? '');
  const [boxToken, setBoxToken] = useState(params.box);
  const [saving, setSaving] = useState(false);

  const currentSticker = picture?.uri ?? (params.sticker || null);
  const boxOptions = (boxes.data ?? []).map((box) => ({
    value: box.token,
    label: `${box.emoji} ${box.name}`,
  }));

  const process = async (photoUri: string, lift: boolean) => {
    setProcessing(true);
    try {
      const sticker = await makeSticker(photoUri, lift);
      setPicture({
        photoUri,
        uri: sticker?.uri ?? photoUri,
        lifted: sticker?.lifted ?? false,
      });
    } catch {
      setPicture({ photoUri, uri: photoUri, lifted: false });
    } finally {
      setProcessing(false);
    }
  };

  const handlePick = async (source: Source) => {
    const photoUri = await pickPhoto(source);
    if (photoUri) {
      await process(photoUri, liftSubject);
    }
  };

  const handleToggleLift = (value: boolean) => {
    setLiftSubject(value);
    if (picture) {
      void process(picture.photoUri, value);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const input: BoxItemInput = {
        name: name.trim(),
        quantity,
        notes: notes.trim() || null,
      };

      if (picture) {
        const isPng =
          picture.uri !== picture.photoUri || picture.uri.toLowerCase().endsWith('.png');
        input.sticker_path = await uploadTempFile(
          route,
          picture.uri,
          isPng ? 'image/png' : 'image/jpeg',
          isPng ? 'png' : 'jpg',
        );
      }

      if (itemId) {
        await updateBoxItem(route, itemId, {
          ...input,
          ...(boxToken !== params.box ? { box: boxToken } : {}),
        });
      } else {
        await createBoxItem(route, params.box, input);
      }

      await boxes.refresh();
      router.back();
    } catch (error) {
      setSaving(false);
      Alert.alert('No se pudo guardar', errorMessage(error));
    }
  };

  const handleDelete = () => {
    if (!itemId) {
      return;
    }

    Alert.alert(`¿Quitar "${name.trim() || 'esto'}" de la caja?`, undefined, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteBoxItem(route, itemId);
              await boxes.refresh();
              router.back();
            } catch (error) {
              Alert.alert('No se pudo quitar', errorMessage(error));
            }
          })();
        },
      },
    ]);
  };

  const canSave = name.trim().length > 0 && !processing && !saving;

  return (
    <>
      <Stack.Screen
        options={{
          title: itemId ? 'Editar' : 'Agregar a la caja',
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.back()}
              className="h-11 justify-center active:opacity-60"
            >
              <Text className="text-base text-foreground">Cancelar</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 px-4 pb-16 pt-4"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center gap-4 rounded-3xl bg-surface px-4 py-6">
          <View
            style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
            className="items-center justify-center"
            accessibilityLabel={processing ? 'Recortando la foto' : undefined}
          >
            {processing ? (
              <View className="items-center gap-3">
                <ActivityIndicator color={muted} />
                <Text className="text-sm text-muted">Recortando…</Text>
              </View>
            ) : currentSticker ? (
              <Sticker uri={currentSticker} name={name} size={PREVIEW_SIZE} />
            ) : (
              <View className="items-center gap-2">
                <Package size={56} color={muted} weight="duotone" />
                <Text className="text-center text-base text-muted">
                  Toma una foto y la convierto en sticker
                </Text>
              </View>
            )}
          </View>

          <View className="w-full flex-row gap-3">
            <View className="flex-1">
              <Button
                variant={currentSticker ? 'secondary' : 'primary'}
                icon={Camera}
                fullWidth
                disabled={processing || saving}
                onPress={() => void handlePick('camera')}
              >
                {currentSticker ? 'Otra foto' : 'Tomar foto'}
              </Button>
            </View>
            <View className="flex-1">
              <Button
                variant="secondary"
                icon={Images}
                fullWidth
                disabled={processing || saving}
                onPress={() => void handlePick('library')}
              >
                Galería
              </Button>
            </View>
          </View>

          {picture && canMakeStickers ? (
            <View className="w-full gap-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-medium text-foreground">Quitar el fondo</Text>
                <Switch
                  value={liftSubject}
                  onValueChange={handleToggleLift}
                  disabled={processing}
                  accessibilityLabel="Quitar el fondo"
                />
              </View>
              {liftSubject && !processing && !picture.lifted ? (
                <Text className="text-sm text-muted">
                  No encontré un objeto claro, así que usé la foto completa.
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>

        <Input
          label="Qué es"
          placeholder="Esferas rojas"
          value={name}
          onChangeText={setName}
          maxLength={80}
          returnKeyType="done"
        />

        <Stepper
          label="Cuántos"
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={MAX_QUANTITY}
        />

        <Input
          label="Nota (opcional)"
          placeholder="Las de vidrio, frágiles"
          value={notes}
          onChangeText={setNotes}
          maxLength={500}
          multiline
        />

        {itemId && boxOptions.length > 1 ? (
          <Select
            label="Caja"
            title="Mover a otra caja"
            value={boxToken}
            onChange={setBoxToken}
            options={boxOptions}
          />
        ) : null}

        <View className="gap-3">
          <Button fullWidth loading={saving} disabled={!canSave} onPress={() => void handleSave()}>
            {itemId ? 'Guardar' : 'Agregar'}
          </Button>
          {itemId ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleDelete}
              className="h-11 items-center justify-center rounded-full active:bg-surface-selected"
            >
              <Text className="text-base font-medium text-danger">Quitar de la caja</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}
