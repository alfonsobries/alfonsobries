import { Stack } from 'expo-router';

import { KidEmotionsProvider } from '@/api/kid-emotions';
import { MoodsProvider } from '@/api/moods';
import { useHomePresence } from '@/hooks/use-home-presence';
import { usePushRegistration } from '@/hooks/use-push-registration';
import { useDailyReminders } from '@/hooks/use-daily-reminders';
import { useWatchSync } from '@/hooks/use-watch-sync';

// A link that opens a screen directly (a scanned box label) still gets the
// tabs underneath, so back always leads somewhere.
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function AppLayout() {
  usePushRegistration();
  useDailyReminders();
  useWatchSync();
  useHomePresence();

  return (
    <MoodsProvider>
      <KidEmotionsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="design-system" />
          <Stack.Screen
            name="chat/thread"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="illustrations/favorites"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
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
          <Stack.Screen
            name="rewards/points"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="climate"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="family-time"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="ai-models"
            options={{
              headerShown: true,
              headerBackButtonDisplayMode: 'minimal',
              title: 'AI Models',
            }}
          />
          <Stack.Screen
            name="exercises"
            options={{
              headerShown: true,
              headerBackButtonDisplayMode: 'minimal',
              title: 'Daily exercises',
            }}
          />
          <Stack.Screen
            name="virtue/index"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal', title: 'Virtud' }}
          />
          <Stack.Screen
            name="virtue/[area]"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="virtue/day"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.85],
              sheetGrabberVisible: true,
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="chores-today"
            options={{ presentation: 'modal', headerShown: true }}
          />
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
            name="emotion"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
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
          <Stack.Screen
            name="save-result"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.55],
              sheetGrabberVisible: true,
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="expenses/index"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="expenses/stats"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="expenses/edit"
            options={{ presentation: 'modal', headerShown: true }}
          />
          <Stack.Screen
            name="expenses/categories"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="expenses/category"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.6],
              sheetGrabberVisible: true,
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="expenses/accounts"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="expenses/account"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.9],
              sheetGrabberVisible: true,
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="telegram"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="boxes/index"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="b/[token]"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="boxes/edit"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.75],
              sheetGrabberVisible: true,
              headerShown: false,
            }}
          />
          <Stack.Screen name="boxes/item" options={{ presentation: 'modal', headerShown: true }} />
          <Stack.Screen
            name="boxes/label"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="boxes/labels"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="photo"
            options={{ presentation: 'fullScreenModal', headerShown: false, animation: 'fade' }}
          />
        </Stack>
      </KidEmotionsProvider>
    </MoodsProvider>
  );
}
