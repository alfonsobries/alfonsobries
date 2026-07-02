import { router, Stack } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import { Pressable } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export default function DesignSystemLayout() {
  const tint = useThemeColor('primary-emphasis');

  return (
    <Stack screenOptions={{ headerLargeTitle: true }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Design System',
          // This stack is pushed over the tabs from Settings, so its root needs
          // an explicit way back.
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <CaretLeft size={24} color={tint} weight="bold" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="sheet"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.5, 1],
          sheetGrabberVisible: true,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="sheet-fit"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.4],
          sheetGrabberVisible: true,
          headerShown: false,
        }}
      />
    </Stack>
  );
}
