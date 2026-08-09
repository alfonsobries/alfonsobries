import { useEffect } from 'react';
import { Platform } from 'react-native';

import { getAuthToken, useAuth } from '@/api/auth';
import { useApiRouter } from '@/api/router';
import { localDate } from '@/api/virtue';
import { fetchWorkoutSummary, workoutDay } from '@/api/workout';
import { syncWatchContext } from '../../modules/watch-bridge';

/**
 * Keeps the paired watch able to work on its own: the token, the endpoints it
 * writes to, and the daily routine with the sets already done travel over
 * WatchConnectivity as application context whenever the session is Alfonso's.
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

      if (!token) {
        return;
      }

      const context: Record<string, string> = {
        token,
        rosaryUrl: route('api.virtue.rosary.store'),
        prayersUrl: route('api.virtue.prayers.store'),
        workoutIndexUrl: route('api.workout.index'),
        // The watch fills in the day and the exercise it is marking.
        workoutUrl: route('api.workout.update', { date: '__date__', exercise: '__exercise__' }),
      };

      try {
        const summary = await fetchWorkoutSummary(route);

        context.workoutPlan = JSON.stringify(summary.plan);
        context.workoutToday = JSON.stringify(workoutDay(summary, localDate()));
      } catch {
        // Without a routine the watch keeps the last one it was given.
      }

      await syncWatchContext(context).catch(() => undefined);
    })();
  }, [user, route]);
}
