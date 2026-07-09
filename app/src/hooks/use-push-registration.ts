import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/api/auth';
import { apiClient } from '@/api/client';
import { getExpoPushToken } from '@/api/push';
import { useApiRouter } from '@/api/router';

/**
 * Once signed in, obtain the device's Expo push token and register it with the
 * API so the backend can send this device notifications. Best-effort: failures
 * (no permission, simulator, offline) are swallowed.
 *
 * Also routes notification taps: a payload with a `conversation_id` (e.g.
 * "your illustration is ready") opens that chat.
 */
export function usePushRegistration(): void {
  const route = useApiRouter();
  const { status } = useAuth();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const conversationId = response.notification.request.content.data?.conversation_id;

      if (typeof conversationId === 'number' || typeof conversationId === 'string') {
        router.push(`/chat/thread?conversation=${conversationId}`);
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    void (async () => {
      const token = await getExpoPushToken();

      if (!token) {
        return;
      }

      try {
        await apiClient.post(route('api.push-tokens.store'), {
          token,
          platform: Platform.OS,
        });
      } catch {
        // The device can register on the next launch.
      }
    })();
  }, [status, route]);
}
