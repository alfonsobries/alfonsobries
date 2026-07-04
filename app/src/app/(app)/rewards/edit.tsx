import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, ScrollView } from 'react-native';

import { createReward, updateReward } from '@/api/chores';
import { getPerson, isKid } from '@/api/family';
import { useApiRouter } from '@/api/router';
import {
  IllustrationField,
  type IllustrationFieldHandle,
  type IllustrationValue,
} from '@/components/behaviors/IllustrationField';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Stepper } from '@/components/ui/Stepper';

const MAX_COST = 999;

// The reward form: what the kid is saving for and how many chore points it
// takes. The illustration flow matches behaviors and chores.
export default function EditRewardScreen() {
  const params = useLocalSearchParams<{
    member?: string;
    id?: string;
    name?: string;
    cost?: string;
    image?: string;
  }>();
  const route = useApiRouter();

  const rewardId = params.id ? Number(params.id) : undefined;
  const person = params.member ? getPerson(params.member) : undefined;
  const kid = person && isKid(person.key) ? person.key : undefined;

  const illustrationRef = useRef<IllustrationFieldHandle>(null);
  const [name, setName] = useState(params.name ?? '');
  const [cost, setCost] = useState(() => {
    const parsed = Number(params.cost);
    return parsed >= 1 && parsed <= MAX_COST ? parsed : 10;
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
        cost,
        ...(illustration ? { image_path: illustration.path } : {}),
      };

      if (rewardId) {
        await updateReward(route, rewardId, payload);
      } else {
        await createReward(route, kid, payload);
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
        options={{ title: rewardId ? 'Edit reward' : `New reward for ${person.name}` }}
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
          placeholder="e.g. Ir al cine"
          value={name}
          onChangeText={setName}
          onBlur={() => illustrationRef.current?.generateIfEmpty()}
          autoFocus={!rewardId}
          maxLength={60}
        />

        <Stepper
          label="Cost in points"
          value={cost}
          onChange={setCost}
          max={MAX_COST}
          helperText="How many approved chore points it takes to claim it."
        />

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
