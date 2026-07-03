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
 */
export function usePushRegistration(): void {
  const route = useApiRouter();
  const { status } = useAuth();

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
