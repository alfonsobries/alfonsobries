import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/api/auth';
import { fetchClimateAutomation } from '@/api/climate';
import { useApiRouter } from '@/api/router';
import { syncHomeGeofence } from '@/lib/home-presence';

const PARENTS = new Set(['alfonso', 'saida']);

/**
 * Keeps a parent's phone watching the home geofence: on launch and whenever
 * the app returns to the foreground, it re-reads the shared home location and
 * re-arms the region. Never prompts; permission is asked from the Aires screen.
 */
export function useHomePresence(): void {
  const { user } = useAuth();
  const route = useApiRouter();
  const isParent = PARENTS.has(user?.family_member ?? '');

  useEffect(() => {
    if (!isParent) {
      return;
    }

    const sync = (): void => {
      void fetchClimateAutomation(route)
        .then((automation) => syncHomeGeofence(automation.home, automation.enabled))
        .catch(() => undefined);
    };

    sync();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        sync();
      }
    });

    return () => subscription.remove();
  }, [isParent, route]);
}
