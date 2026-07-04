import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { Minus, Plus } from 'phosphor-react-native';
import { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { createBehavior, updateBehavior } from '@/api/behaviors';
import { getPerson, isKid } from '@/api/family';
import { useApiRouter } from '@/api/router';
import {
  IllustrationField,
  type IllustrationFieldHandle,
  type IllustrationValue,
} from '@/components/behaviors/IllustrationField';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useThemeColor } from '@/hooks/use-theme-color';

const MAX_POINTS = 9;

// The behavior form. Typing a name and leaving the field kicks off the AI
// illustration on its own; saving attaches whatever image ended up chosen.
export default function EditBehaviorScreen() {
  const params = useLocalSearchParams<{
    member?: string;
    id?: string;
    name?: string;
    points?: string;
    image?: string;
  }>();
  const route = useApiRouter();

  const behaviorId = params.id ? Number(params.id) : undefined;
  const person = params.member ? getPerson(params.member) : undefined;
  const kid = person && isKid(person.key) ? person.key : undefined;

  const illustrationRef = useRef<IllustrationFieldHandle>(null);
  const [name, setName] = useState(params.name ?? '');
  const [points, setPoints] = useState(() => {
    const parsed = Number(params.points);
    return parsed >= 1 && parsed <= MAX_POINTS ? parsed : 1;
  });
  const [illustration, setIllustration] = useState<IllustrationValue | null>(null);
  const [illustrationBusy, setIllustrationBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!person || !kid) {
    return <Redirect href="/" />;
  }

  const canSave = name.trim().length > 0 && !illustrationBusy && !saving;

  async function handleSave(): Promise<void> {
    if (!canSave || !kid) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        points,
        ...(illustration ? { image_path: illustration.path } : {}),
      };

      if (behaviorId) {
        await updateBehavior(route, behaviorId, payload);
      } else {
        await createBehavior(route, kid, payload);
      }

      router.back();
    } catch {
      setSaving(false);
      Alert.alert('Could not save', 'Please try again in a moment.');
    }
  }

  return (
    <>
      <Stack.Screen
        options={{ title: behaviorId ? 'Edit behavior' : `New behavior for ${person.name}` }}
      />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 p-4"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Name"
          placeholder="e.g. Shouting"
          value={name}
          onChangeText={setName}
          onBlur={() => illustrationRef.current?.generateIfEmpty()}
          autoFocus={!behaviorId}
          maxLength={60}
        />

        <PointsStepper value={points} onChange={setPoints} />

        <IllustrationField
          ref={illustrationRef}
          member={kid}
          name={name}
          value={illustration}
          onChange={setIllustration}
          currentUrl={params.image ?? null}
          onBusyChange={setIllustrationBusy}
        />

        <Button fullWidth loading={saving} disabled={!canSave} onPress={() => void handleSave()}>
          Save
        </Button>
      </ScrollView>
    </>
  );
}

function PointsStepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const tint = useThemeColor('foreground');

  return (
    <View className="w-full gap-1.5">
      <Text className="px-4 text-sm font-medium text-foreground">Mood points</Text>
      <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface px-4 py-2">
        <StepperButton
          accessibilityLabel="Fewer points"
          disabled={value <= 1}
          onPress={() => onChange(Math.max(1, value - 1))}
        >
          <Minus size={20} color={tint} weight="bold" />
        </StepperButton>
        <Text className="text-lg font-semibold text-foreground">{value}</Text>
        <StepperButton
          accessibilityLabel="More points"
          disabled={value >= MAX_POINTS}
          onPress={() => onChange(Math.min(MAX_POINTS, value + 1))}
        >
          <Plus size={20} color={tint} weight="bold" />
        </StepperButton>
      </View>
      <Text className="px-4 text-xs text-muted">
        How much this weighs on your mood when it happens.
      </Text>
    </View>
  );
}

function StepperButton({
  children,
  accessibilityLabel,
  disabled,
  onPress,
}: {
  children: React.ReactNode;
  accessibilityLabel: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`size-11 items-center justify-center rounded-full bg-surface-selected ${
        disabled ? 'opacity-40' : 'active:opacity-80'
      }`}
    >
      {children}
    </Pressable>
  );
}
