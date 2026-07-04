import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, ScrollView } from 'react-native';

import { createChore, updateChore } from '@/api/chores';
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

const MAX_POINTS = 9;

// The chore form. Same flow as behaviors: typing a name and leaving the
// field kicks off the AI illustration; saving attaches the chosen image.
export default function EditChoreScreen() {
  const params = useLocalSearchParams<{
    member?: string;
    id?: string;
    name?: string;
    points?: string;
    image?: string;
  }>();
  const route = useApiRouter();

  const choreId = params.id ? Number(params.id) : undefined;
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

      if (choreId) {
        await updateChore(route, choreId, payload);
      } else {
        await createChore(route, kid, payload);
      }

      router.back();
    } catch {
      setSaving(false);
      Alert.alert('Could not save', 'Please try again in a moment.');
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: choreId ? 'Edit chore' : `New chore for ${person.name}` }} />
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
          placeholder="e.g. Lavarse los dientes"
          value={name}
          onChangeText={setName}
          onBlur={() => illustrationRef.current?.generateIfEmpty()}
          autoFocus={!choreId}
          maxLength={60}
        />

        <Stepper
          label="Points"
          value={points}
          onChange={setPoints}
          max={MAX_POINTS}
          helperText="What it earns toward the reward — and lifts your mood on approval."
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
