import { useEffect } from 'react';
import { Platform } from 'react-native';

import { getAuthToken, useAuth } from '@/api/auth';
import { useApiRouter } from '@/api/router';
import { syncWatchContext } from '../../modules/watch-bridge';

/**
 * Keeps the paired watch able to mark the rosary on its own: whenever the
 * session is Alfonso's, the token and the rosary endpoint travel over
 * WatchConnectivity as application context.
 */
export function useWatchSync(): void {
  const { user } = useAuth();
  const route = useApiRouter();

  useEffect(() => {
    if (Platform.OS !== 'ios' || user?.family_member !== 'alfonso') {
      return;
    }

    void (async () => {
      const token = await getAuthToken();

      if (token) {
        await syncWatchContext(token, route('api.virtue.rosary.store')).catch(() => undefined);
      }
    })();
  }, [user, route]);
}
