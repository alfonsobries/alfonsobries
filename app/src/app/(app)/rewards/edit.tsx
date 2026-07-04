import { DatePicker, Host } from '@expo/ui/swift-ui';
import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

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
import { Switch } from '@/components/ui/Switch';

const MAX_COST = 999;

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// The reward form: what the kid is saving for, how many chore points it
// takes, optionally a date it unlocks on, and (on by default) the mood gate
// that asks for both parents to feel good.
export default function EditRewardScreen() {
  const params = useLocalSearchParams<{
    member?: string;
    id?: string;
    name?: string;
    cost?: string;
    available_on?: string;
    requires_content_parents?: string;
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
  const [hasDate, setHasDate] = useState(Boolean(params.available_on));
  const [availableOn, setAvailableOn] = useState<Date>(() =>
    params.available_on ? new Date(`${params.available_on}T12:00:00`) : new Date(),
  );
  const [requiresContentParents, setRequiresContentParents] = useState(
    // On by default for new rewards; editing keeps the stored choice.
    params.requires_content_parents === undefined ? true : params.requires_content_parents === '1',
  );
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
        available_on: hasDate ? toDateString(availableOn) : null,
        requires_content_parents: requiresContentParents,
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

        <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-foreground">Only from a date</Text>
            <Switch value={hasDate} onValueChange={setHasDate} />
          </View>
          {hasDate ? (
            <Host matchContents>
              <DatePicker
                title="Available on"
                selection={availableOn}
                displayedComponents={['date']}
                onDateChange={setAvailableOn}
              />
            </Host>
          ) : null}
        </View>

        <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface p-4">
          <View className="flex-1 pr-3">
            <Text className="text-sm font-medium text-foreground">Mom and dad feeling good</Text>
            <Text className="mt-0.5 text-xs text-muted">
              Claimable only while both moods sit above the neutral face.
            </Text>
          </View>
          <Switch value={requiresContentParents} onValueChange={setRequiresContentParents} />
        </View>

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
