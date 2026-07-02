import { router, Stack } from 'expo-router';
import { ReactNode, useState } from 'react';
import { ActionSheetIOS, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</Text>
      {children}
    </View>
  );
}

const ITEM_ACTIONS = ['Edit', 'Archive', 'Delete', 'Cancel'];

export default function Overlays() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  function openActionSheet() {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: 'Water filter',
        options: ITEM_ACTIONS,
        destructiveButtonIndex: 2,
        cancelButtonIndex: 3,
      },
      (index) => {
        if (index !== 3) {
          setLastAction(ITEM_ACTIONS[index]);
        }
      },
    );
  }

  return (
    <>
      <Stack.Screen.Title large>Overlays</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 p-4">
        <Section title="Sheet · medium → full">
          <Text className="text-sm text-muted">
            Native form sheet, draggable between half and full height.
          </Text>
          <View className="items-start">
            <Button onPress={() => router.push('/design-system/sheet')}>Open sheet</Button>
          </View>
        </Section>

        <Section title="Sheet · compact">
          <Text className="text-sm text-muted">A shorter native sheet at a fixed height.</Text>
          <View className="items-start">
            <Button onPress={() => router.push('/design-system/sheet-fit')}>Open compact sheet</Button>
          </View>
        </Section>

        <Section title="Action sheet">
          <Text className="text-sm text-muted">Native iOS action sheet for row actions.</Text>
          <View className="items-start gap-2">
            <Button variant="secondary" onPress={openActionSheet}>
              Item actions
            </Button>
            {lastAction ? <Text className="text-sm text-foreground">Selected: {lastAction}</Text> : null}
          </View>
        </Section>
      </ScrollView>
    </>
  );
}
