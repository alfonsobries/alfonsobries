import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { Pressable, Text, View } from 'react-native';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" asChild>
            <TabButton>Settings</TabButton>
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
  return (
    <View {...props} className="absolute w-full flex-row items-center justify-center p-4">
      <View className="w-full max-w-[800px] grow flex-row items-center gap-2 rounded-full bg-surface px-8 py-2">
        <Text className="mr-auto text-sm font-bold text-foreground">Alfonso&apos;s App</Text>
        {props.children}
      </View>
    </View>
  );
}
