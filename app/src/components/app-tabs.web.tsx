import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { ArrowSquareOut } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { ExternalLink } from './external-link';

import { useThemeColor } from '@/hooks/use-theme-color';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Explore</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} className="active:opacity-70">
      <View className={`rounded-2xl px-4 py-1 ${isFocused ? 'bg-surface-selected' : 'bg-surface'}`}>
        <Text className={`text-sm font-medium ${isFocused ? 'text-foreground' : 'text-muted'}`}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const tint = useThemeColor('foreground');

  return (
    <View {...props} className="absolute w-full flex-row items-center justify-center p-4">
      <View className="w-full max-w-[800px] grow flex-row items-center gap-2 rounded-full bg-surface px-8 py-2">
        <Text className="mr-auto text-sm font-bold text-foreground">Alfonso Bries</Text>

        {props.children}

        <ExternalLink href="https://docs.expo.dev" asChild>
          <Pressable className="ml-4 flex-row items-center justify-center gap-1">
            <Text className="text-sm text-foreground">Docs</Text>
            <ArrowSquareOut size={12} color={tint} />
          </Pressable>
        </ExternalLink>
      </View>
    </View>
  );
}
