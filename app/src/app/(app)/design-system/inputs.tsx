import { Stack } from 'expo-router';
import { MagnifyingGlass } from 'phosphor-react-native';
import { ReactNode, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Switch } from '@/components/ui/Switch';

const REMINDER_FREQUENCIES = [
  { label: 'Every day', value: 'daily' },
  { label: 'Every week', value: 'weekly' },
  { label: 'Never', value: 'never' },
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</Text>
      {children}
    </View>
  );
}

export default function Inputs() {
  const [notify, setNotify] = useState(true);
  const [agree, setAgree] = useState(false);
  const [frequency, setFrequency] =
    useState<(typeof REMINDER_FREQUENCIES)[number]['value']>('weekly');

  return (
    <>
      <Stack.Screen.Title large>Inputs</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-8 p-4"
      >
        <Section title="Text field">
          <Input label="Item name" placeholder="e.g. Water filter" />
        </Section>

        <Section title="With icon">
          <Input icon={MagnifyingGlass} placeholder="Search" />
        </Section>

        <Section title="Password">
          <Input label="Password" placeholder="••••••••" secureTextEntry />
        </Section>

        <Section title="Error">
          <Input
            label="Email"
            placeholder="you@example.com"
            defaultValue="not an email"
            error="Enter a valid email"
          />
        </Section>

        <Section title="Disabled">
          <Input label="Household" defaultValue="Bribiesca family" editable={false} />
        </Section>

        <Section title="Textarea">
          <Input label="Notes" placeholder="Anything to remember?" multiline />
        </Section>

        <Section title="Switch">
          <View className="flex-row items-center justify-between rounded-2xl bg-surface px-4 py-3">
            <Text className="text-base text-foreground">Notifications</Text>
            <Switch value={notify} onValueChange={setNotify} />
          </View>
        </Section>

        <Section title="Checkbox">
          <View className="gap-3">
            <Checkbox checked={agree} onChange={setAgree} label="Notify me by push" />
            <Checkbox checked disabled label="Account alerts (always on)" onChange={() => {}} />
          </View>
        </Section>

        <Section title="Radio">
          <RadioGroup
            value={frequency}
            onChange={setFrequency}
            options={[...REMINDER_FREQUENCIES]}
          />
        </Section>
      </ScrollView>
    </>
  );
}
