import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/api/auth';
import { apiClient } from '@/api/client';
import { getExpoPushToken } from '@/api/push';
import { useApiRouter } from '@/api/router';

function asPath(value: unknown): string | null {
  return typeof value === 'string' && value.startsWith('/') ? value : null;
}

/**
 * Once signed in, obtain the device's Expo push token and register it with the
 * API so the backend can send this device notifications. Best-effort: failures
 * (no permission, simulator, offline) are swallowed.
 *
 * Taps follow `data.url` when present.
 */
export function usePushRegistration(): void {
  const route = useApiRouter();
  const { status } = useAuth();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data ?? {};
      const url = asPath(data.url);

      if (url) {
        router.push(url as Href);
        return;
      }

      const conversationId = data.conversation_id;

      if (typeof conversationId === 'number' || typeof conversationId === 'string') {
        router.push(`/chat/thread?conversation=${conversationId}`);
      }
    });

    return () => subscription.remove();
  }, [route]);

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

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    // Nothing in the app keeps an unread count, so a leftover badge is stale.
    void Notifications.setBadgeCountAsync(0).catch(() => undefined);
  }, [status]);
}
