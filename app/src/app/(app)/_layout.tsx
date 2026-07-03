import { Stack } from 'expo-router';

import { MoodsProvider } from '@/api/moods';

export default function AppLayout() {
  return (
    <MoodsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="design-system" />
        <Stack.Screen
          name="mood"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.85],
            sheetGrabberVisible: true,
            headerShown: false,
          }}
        />
      </Stack>
    </MoodsProvider>
  );
}
