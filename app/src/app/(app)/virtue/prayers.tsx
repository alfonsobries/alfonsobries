import { router } from 'expo-router';
import { X } from 'phosphor-react-native';
import { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApiRouter } from '@/api/router';
import { completePrayers, localDate } from '@/api/virtue';
import { Button } from '@/components/ui/Button';
import { getPrayerSteps, type PrayerBlock } from '@/data/auxilium';
import { useThemeColor } from '@/hooks/use-theme-color';

// The day's prayer sequence, one step at a time. Deliberately quiet: large
// type, one prayer per screen, and nothing else competing for attention.
export default function PrayersScreen() {
  const route = useApiRouter();
  const insets = useSafeAreaInsets();
  const muted = useThemeColor('muted');

  const scrollRef = useRef<ScrollView>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const { steps, dateLabel } = useMemo(() => {
    const now = new Date();

    return {
      steps: getPrayerSteps(now.getDay()),
      dateLabel: now.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    };
  }, []);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  function goTo(nextIndex: number): void {
    setStepIndex(nextIndex);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  async function handleFinish(): Promise<void> {
    setFinishing(true);

    try {
      await completePrayers(route, localDate());
      router.back();
    } catch {
      setFinishing(false);
      Alert.alert('Could not save', 'Please try again in a moment.');
    }
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingBottom: insets.bottom + 12 }}>
      <View className="flex-row items-center px-5 pb-2 pt-5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
          onPress={() => router.back()}
          className="size-9 items-center justify-center rounded-full bg-surface-selected active:opacity-70"
        >
          <X size={18} color={muted} weight="bold" />
        </Pressable>

        <View className="flex-1 items-center pr-9">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
            Oraciones del día
          </Text>
          <Text className="text-base font-semibold capitalize text-foreground">{dateLabel}</Text>
        </View>
      </View>

      <View className="flex-row gap-1.5 px-5 py-3">
        {steps.map((entry, index) => (
          <View
            key={entry.key}
            className={`h-1 flex-1 rounded-full ${
              index <= stepIndex ? 'bg-primary-emphasis' : 'bg-surface-selected'
            }`}
          />
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-10 pt-4"
      >
        <View className="gap-1">
          <Text className="text-3xl font-bold text-foreground">{step.title}</Text>
          {step.subtitle ? <Text className="text-lg text-muted">{step.subtitle}</Text> : null}
        </View>

        {step.blocks.map((block, index) => (
          <BlockView key={index} block={block} />
        ))}
      </ScrollView>

      <View className="flex-row gap-3 px-5 pt-3">
        {stepIndex > 0 ? (
          <Button variant="secondary" size="lg" onPress={() => goTo(stepIndex - 1)}>
            Back
          </Button>
        ) : null}
        {isLast ? (
          <Button
            size="lg"
            loading={finishing}
            onPress={() => void handleFinish()}
            className="flex-1"
          >
            Finish
          </Button>
        ) : (
          <Button size="lg" onPress={() => goTo(stepIndex + 1)} className="flex-1">
            Next
          </Button>
        )}
      </View>
    </View>
  );
}

function BlockView({ block }: { block: PrayerBlock }) {
  switch (block.kind) {
    case 'paragraph': {
      return <Text className="text-lg leading-8 text-foreground">{block.text}</Text>;
    }

    case 'lines': {
      return (
        <View className="gap-0.5">
          {block.lines.map((line, index) => (
            <Text key={index} className="text-lg leading-8 text-foreground">
              {line}
            </Text>
          ))}
        </View>
      );
    }

    case 'versicle': {
      return (
        <View className="gap-2">
          <Text className="text-lg leading-8 text-foreground">
            <Text className="font-bold text-primary-emphasis">V. </Text>
            {block.call}
          </Text>
          <Text className="text-lg leading-8 text-foreground">
            <Text className="font-bold text-primary-emphasis">R. </Text>
            {block.response}
          </Text>
        </View>
      );
    }

    case 'litany': {
      return (
        <View className="gap-2.5">
          {block.items.map((item, index) => (
            <Text key={index} className="text-lg leading-7 text-foreground">
              {item.call}, <Text className="italic text-muted">{item.response}</Text>
            </Text>
          ))}
        </View>
      );
    }

    case 'note': {
      return <Text className="text-lg italic leading-8 text-muted">{block.text}</Text>;
    }
  }
}
