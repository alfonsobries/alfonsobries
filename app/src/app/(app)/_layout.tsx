import { Stack } from 'expo-router';

import { KidEmotionsProvider } from '@/api/kid-emotions';
import { MoodsProvider } from '@/api/moods';
import { useLineIncoming } from '@/hooks/use-line-incoming';
import { usePushRegistration } from '@/hooks/use-push-registration';
import { useDailyReminders } from '@/hooks/use-daily-reminders';
import { useWatchSync } from '@/hooks/use-watch-sync';

export default function AppLayout() {
  usePushRegistration();
  useLineIncoming();
  useDailyReminders();
  useWatchSync();

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
          <Stack.Screen name="virtue/prayers" options={{ presentation: 'modal' }} />
          <Stack.Screen name="virtue/rosary" options={{ presentation: 'modal' }} />
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
            name="virtue/guide"
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
            name="line/index"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="line/thread"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="line/calls"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="line/voicemail"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="line/dialer"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="line/contact"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="line/settings"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="line/incoming"
            options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="line/compose"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="line/live"
            options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
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
            name="photo"
            options={{ presentation: 'fullScreenModal', headerShown: false, animation: 'fade' }}
          />
        </Stack>
      </KidEmotionsProvider>
    </MoodsProvider>
  );
}
