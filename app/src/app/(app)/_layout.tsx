import { Stack } from 'expo-router';

import { MoodsProvider } from '@/api/moods';
import { usePushRegistration } from '@/hooks/use-push-registration';

export default function AppLayout() {
  usePushRegistration();

  return (
    <MoodsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="design-system" />
        <Stack.Screen
          name="profile"
          options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
        />
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
