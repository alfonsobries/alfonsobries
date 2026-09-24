import { Button as MenuButton, Host, Image as MenuIcon, Menu } from '@expo/ui/swift-ui';
import { contentShape, frame, shapes } from '@expo/ui/swift-ui/modifiers';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { ArrowUp, Microphone, X } from 'phosphor-react-native';
import { forwardRef, type ReactNode, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  type LayoutChangeEvent,
  Pressable,
  TextInput,
  View,
} from 'react-native';

import type { HomeDraft } from '@/hooks/use-home-chat';
import { type ImageSource, type UploadedImage, useImageUpload } from '@/hooks/use-image-upload';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useVoiceRecorder } from '@/hooks/use-voice-recorder';
import { isOfflineError } from '@/offline/connectivity';

import { RecordingBar } from './RecordingBar';

cssInterop(GlassView, { className: 'style' });

export type HomeComposerHandle = {
  /** Put text in the field (from a suggestion) and focus it. */
  prefill: (text: string) => void;
};

type HomeComposerProperties = {
  onSend: (draft: HomeDraft) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
};

const MAX_IMAGES = 4;
const GLASS = isLiquidGlassAvailable();

function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  if (GLASS) {
    return (
      <GlassView
        glassEffectStyle="regular"
        isInteractive
        className={`overflow-hidden ${className}`}
      >
        {children}
      </GlassView>
    );
  }

  return <View className={`border border-border bg-surface ${className}`}>{children}</View>;
}

/**
 * The home chat's input: text, photos (camera or library) and voice notes.
 * Sending is optimistic, so the draft clears right away; the message itself
 * carries any failure and a retry.
 */
export const HomeComposer = forwardRef<HomeComposerHandle, HomeComposerProperties>(
  function HomeComposer({ onSend, onLayout }, ref) {
    const [text, setText] = useState('');
    const [images, setImages] = useState<UploadedImage[]>([]);
    const inputRef = useRef<TextInput>(null);
    const { isUploading, pickAndUpload } = useImageUpload({ allowsEditing: false });
    const voice = useVoiceRecorder({ onLimit: () => void handleFinishRecording() });

    const muted = useThemeColor('muted');
    const foreground = useThemeColor('foreground');
    const background = useThemeColor('background');
    const onPrimary = useThemeColor('primary-foreground');
    const danger = useThemeColor('danger');

    useImperativeHandle(ref, () => ({
      prefill: (value: string) => {
        setText(value);
        inputRef.current?.focus();
      },
    }));

    const hasContent = text.trim().length > 0 || images.length > 0;

    const handleAttach = async (source: ImageSource) => {
      if (images.length >= MAX_IMAGES) {
        Alert.alert('Máximo 4 fotos', 'Manda estas primero y luego agrega más.');
        return;
      }

      try {
        const uploaded = await pickAndUpload(source);
        if (uploaded) {
          setImages((current) => [...current, uploaded]);
        }
      } catch (error) {
        const denied = error instanceof Error && /access is needed/.test(error.message);
        Alert.alert(
          denied ? 'Sin permiso' : 'No se pudo adjuntar la foto',
          denied
            ? 'Permite el acceso en Ajustes para adjuntar fotos.'
            : isOfflineError(error)
              ? 'Estás sin conexión.'
              : 'Intenta de nuevo.',
          denied
            ? [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Abrir Ajustes', onPress: () => void Linking.openSettings() },
              ]
            : undefined,
        );
      }
    };

    const handleSend = () => {
      if (!hasContent || isUploading) {
        return;
      }

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSend({ text, images, voiceNote: null });
      setText('');
      setImages([]);
    };

    const handleRecord = async () => {
      const result = await voice.start();

      if (result === 'denied') {
        Alert.alert(
          'Sin acceso al micrófono',
          'Permite el micrófono en Ajustes para mandar notas de voz.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Ajustes', onPress: () => void Linking.openSettings() },
          ],
        );
      } else if (result === 'failed') {
        Alert.alert('No se pudo grabar', 'Intenta de nuevo.');
      }
    };

    const handleFinishRecording = async () => {
      const note = await voice.finish();

      if (note) {
        onSend({ text: '', images, voiceNote: note });
        setImages([]);
      }
    };

    const circle = 'h-11 w-11 items-center justify-center rounded-full';

    return (
      <View onLayout={onLayout} className="gap-2 px-3 pb-2 pt-1">
        {images.length > 0 ? (
          <View className="flex-row gap-2 px-1">
            {images.map((image) => (
              <View key={image.key}>
                <Image
                  source={{ uri: image.localUri }}
                  contentFit="cover"
                  style={{ width: 60, height: 60, borderRadius: 14 }}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Quitar foto"
                  onPress={() =>
                    setImages((current) => current.filter((entry) => entry.key !== image.key))
                  }
                  hitSlop={10}
                  className="absolute -right-1.5 -top-1.5 h-5 w-5 items-center justify-center rounded-full bg-foreground"
                >
                  <X size={11} weight="bold" color={background} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <View className="flex-row items-end gap-2">
          {voice.active ? (
            <Surface className="rounded-full">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancelar nota de voz"
                onPress={() => void voice.cancel()}
                className={`${circle} active:opacity-60`}
              >
                <X size={20} weight="bold" color={danger} />
              </Pressable>
            </Surface>
          ) : (
            <Surface className="rounded-full">
              {isUploading ? (
                <View className={circle}>
                  <ActivityIndicator size="small" color={muted} />
                </View>
              ) : (
                <Host style={{ width: 44, height: 44 }}>
                  <Menu
                    label={
                      <MenuIcon
                        systemName="plus"
                        color={foreground}
                        size={19}
                        modifiers={[
                          frame({ width: 44, height: 44 }),
                          contentShape(shapes.circle()),
                        ]}
                      />
                    }
                  >
                    <MenuButton
                      label="Tomar foto"
                      systemImage="camera"
                      onPress={() => void handleAttach('camera')}
                    />
                    <MenuButton
                      label="Elegir de Fotos"
                      systemImage="photo.on.rectangle"
                      onPress={() => void handleAttach('library')}
                    />
                  </Menu>
                </Host>
              )}
            </Surface>
          )}

          <Surface className="min-h-11 flex-1 flex-row items-end rounded-[22px]">
            {voice.active ? (
              <RecordingBar durationMillis={voice.durationMillis} levels={voice.levels} />
            ) : (
              <TextInput
                ref={inputRef}
                nativeID="home-chat-input"
                className="max-h-36 flex-1 px-4 pb-[11px] pt-[11px] text-[16px]"
                style={{ color: foreground }}
                placeholder="Cuéntame un gasto…"
                placeholderTextColor={muted}
                multiline
                value={text}
                onChangeText={setText}
                accessibilityLabel="Mensaje"
              />
            )}

            <View className="p-1">
              {voice.active ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Enviar nota de voz"
                  onPress={() => void handleFinishRecording()}
                  className="h-9 w-9 items-center justify-center rounded-full bg-primary active:opacity-80"
                >
                  <ArrowUp size={18} weight="bold" color={onPrimary} />
                </Pressable>
              ) : hasContent ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Enviar"
                  onPress={handleSend}
                  disabled={isUploading}
                  className={`h-9 w-9 items-center justify-center rounded-full bg-primary ${
                    isUploading ? 'opacity-40' : 'active:opacity-80'
                  }`}
                >
                  <ArrowUp size={18} weight="bold" color={onPrimary} />
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Grabar nota de voz"
                  onPress={() => void handleRecord()}
                  className="h-9 w-9 items-center justify-center rounded-full active:opacity-60"
                >
                  <Microphone size={21} color={muted} />
                </Pressable>
              )}
            </View>
          </Surface>
        </View>
      </View>
    );
  },
);
