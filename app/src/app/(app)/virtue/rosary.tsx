import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pause, Play, SkipBack, SkipForward, X } from 'phosphor-react-native';
import { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApiRouter } from '@/api/router';
import { completeRosary, localDate } from '@/api/virtue';
import { PrayerBlockView } from '@/components/prayers/PrayerBlockView';
import { DecadeBeads } from '@/components/rosary/DecadeBeads';
import { MysteryIntro } from '@/components/rosary/MysteryIntro';
import { useRosaryAutoplay } from '@/components/rosary/use-rosary-autoplay';
import { Button } from '@/components/ui/Button';
import { getRosarySteps, ROSARY_SECTIONS } from '@/data/rosary';
import { useThemeColor } from '@/hooks/use-theme-color';

// The guided Holy Rosary, one prayer per screen. Bead steps advance with a
// tap anywhere, so it can be prayed without reading the buttons — the decade
// chain at the top carries the sense of place. Autoplay turns the same
// sequence into a continuous audio queue for the car or a walk.
export default function RosaryScreen() {
  const route = useApiRouter();
  const insets = useSafeAreaInsets();
  const muted = useThemeColor('muted');
  const tint = useThemeColor('primary-emphasis');
  const onPrimary = useThemeColor('primary-foreground');

  const scrollRef = useRef<ScrollView>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const { set, steps } = useMemo(() => {
    const now = new Date();
    return getRosarySteps(now.getDay());
  }, []);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const sectionIndex = ROSARY_SECTIONS.findIndex((section) => section.key === step.sectionKey);
  const section = ROSARY_SECTIONS[sectionIndex];

  function goTo(nextIndex: number): void {
    setStepIndex(nextIndex);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  const autoplay = useRosaryAutoplay({
    set,
    steps,
    onStepChange: goTo,
    onEnded: () => void finish(),
  });

  async function finish(): Promise<void> {
    setFinishing(true);
    void autoplay.stop();

    try {
      await completeRosary(route, localDate());
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      setFinishing(false);
      Alert.alert('No se pudo guardar', 'Inténtalo de nuevo en un momento.');
    }
  }

  function goBackOne(): void {
    if (autoplay.active) {
      void autoplay.skipTo(stepIndex - 1);
      return;
    }

    goTo(stepIndex - 1);
  }

  function advance(): void {
    if (isLast && !autoplay.active) {
      void finish();
      return;
    }

    void Haptics.selectionAsync();

    if (autoplay.active) {
      if (isLast) {
        void finish();
      } else {
        void autoplay.skipTo(stepIndex + 1);
      }

      return;
    }

    goTo(stepIndex + 1);
  }

  function handleClose(): void {
    if (stepIndex === 0 && !autoplay.active) {
      router.back();
      return;
    }

    Alert.alert('¿Dejar el rosario?', 'El avance de esta sesión se perderá.', [
      { text: 'Seguir rezando', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => {
          void autoplay.stop();
          router.back();
        },
      },
    ]);
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingBottom: insets.bottom + 12 }}>
      <View className="flex-row items-center px-5 pb-2 pt-5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          hitSlop={12}
          onPress={handleClose}
          className="size-9 items-center justify-center rounded-full bg-surface-selected active:opacity-70"
        >
          <X size={18} weight="bold" color={muted} />
        </Pressable>

        <View className="flex-1 items-center">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
            Santo Rosario
          </Text>
          <Text className="text-base font-semibold text-foreground">{set.name}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={autoplay.active ? 'Detener audio' : 'Rezar con audio'}
          hitSlop={12}
          onPress={() => {
            if (autoplay.active) {
              void autoplay.stop();
            } else {
              void autoplay.start(stepIndex);
            }
          }}
          className={`size-9 items-center justify-center rounded-full active:opacity-70 ${
            autoplay.active ? 'bg-primary' : 'bg-surface-selected'
          }`}
        >
          {autoplay.active ? (
            <X size={16} weight="bold" color={onPrimary} />
          ) : (
            <Play size={16} weight="fill" color={tint} />
          )}
        </Pressable>
      </View>

      <View className="gap-2 px-5 py-3">
        <View className="flex-row gap-1.5">
          {ROSARY_SECTIONS.map((entry, index) => (
            <View
              key={entry.key}
              className={`h-1 rounded-full ${entry.key.startsWith('misterio') ? 'flex-[2]' : 'flex-[3]'} ${
                index <= sectionIndex ? 'bg-primary-emphasis' : 'bg-surface-selected'
              }`}
            />
          ))}
        </View>
        <Text className="text-center text-xs font-medium text-muted">{section.title}</Text>
      </View>

      {step.bead ? (
        <Pressable
          className="flex-1"
          accessibilityRole="button"
          accessibilityLabel="Siguiente oración"
          onPress={advance}
        >
          <Animated.View key={step.key} entering={FadeIn.duration(180)} className="flex-1 px-6">
            <DecadeBeads bead={step.bead} />

            <View className="flex-1 justify-center gap-6 pb-16">
              <View className="gap-1">
                <Text className="text-3xl font-bold text-foreground">{step.title}</Text>
                {step.subtitle ? <Text className="text-lg text-muted">{step.subtitle}</Text> : null}
              </View>

              {step.blocks.map((block, index) => (
                <PrayerBlockView key={index} block={block} />
              ))}

              {autoplay.active ? null : (
                <Text className="text-center text-xs text-muted">
                  Toca la pantalla para avanzar
                </Text>
              )}
            </View>
          </Animated.View>
        </Pressable>
      ) : (
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="gap-6 px-6 pb-10 pt-4"
        >
          {step.mystery ? (
            <MysteryIntro mystery={step.mystery} />
          ) : (
            <View className="gap-6">
              <View className="gap-1">
                <Text className="text-3xl font-bold text-foreground">{step.title}</Text>
                {step.subtitle ? <Text className="text-lg text-muted">{step.subtitle}</Text> : null}
              </View>

              {step.blocks.map((block, index) => (
                <PrayerBlockView key={index} block={block} />
              ))}
            </View>
          )}

          {stepIndex === 0 ? (
            <Pressable
              accessibilityRole="button"
              disabled={finishing}
              onPress={() => void finish()}
              className="items-center pt-6 active:opacity-70"
            >
              <Text className="text-sm text-muted underline">
                ¿Ya lo rezaste por tu cuenta? Marcarlo como rezado
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      )}

      {autoplay.active ? (
        <View className="flex-row items-center gap-3 px-5 pt-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Oración anterior"
            disabled={stepIndex === 0}
            onPress={goBackOne}
            className="size-12 items-center justify-center rounded-full bg-surface-selected active:opacity-70"
          >
            <SkipBack size={20} weight="fill" color={stepIndex === 0 ? muted : tint} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={autoplay.playing ? 'Pausa' : 'Reanudar'}
            onPress={() => void autoplay.togglePlayback()}
            className="h-14 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-primary active:opacity-80"
          >
            {autoplay.playing ? (
              <Pause size={22} weight="fill" color={onPrimary} />
            ) : (
              <Play size={22} weight="fill" color={onPrimary} />
            )}
            <Text className="text-base font-semibold text-primary-foreground">
              {autoplay.playing ? 'Pausa' : 'Reanudar'}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Siguiente oración"
            onPress={advance}
            className="size-12 items-center justify-center rounded-full bg-surface-selected active:opacity-70"
          >
            <SkipForward size={20} weight="fill" color={tint} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Velocidad de reproducción"
            onPress={() => void autoplay.cycleRate()}
            className="h-12 min-w-14 items-center justify-center rounded-full bg-surface-selected px-3 active:opacity-70"
          >
            <Text className="text-sm font-semibold text-foreground">{autoplay.rate}x</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-row gap-3 px-5 pt-3">
          {stepIndex > 0 ? (
            <Button variant="secondary" size="lg" onPress={goBackOne}>
              Atrás
            </Button>
          ) : null}
          <Button size="lg" loading={finishing} onPress={advance} className="flex-1">
            {isLast ? 'Terminar' : step.mystery ? 'Comenzar la decena' : 'Siguiente'}
          </Button>
        </View>
      )}
    </View>
  );
}
