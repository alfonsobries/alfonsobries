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
        {/* The thread draws its own header so the keyboard avoidance needs no offset. */}
        <Stack.Screen name="chat/thread" />
        <Stack.Screen
          name="profile"
          options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
        />
        <Stack.Screen
          name="behaviors/manage"
          options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
        />
        <Stack.Screen
          name="behaviors/edit"
          options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
        />
        <Stack.Screen
          name="chores/manage"
          options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
        />
        <Stack.Screen
          name="chores/edit"
          options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
        />
        <Stack.Screen
          name="rewards/manage"
          options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
        />
        <Stack.Screen
          name="rewards/edit"
          options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
        />
        <Stack.Screen name="chores-today" options={{ presentation: 'modal', headerShown: true }} />
        <Stack.Screen
          name="behaviors-board"
          options={{ presentation: 'modal', headerShown: true }}
        />
        <Stack.Screen
          name="behavior-feed"
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
        <Stack.Screen
          name="behavior-log"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.85],
            sheetGrabberVisible: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="chores-review"
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
