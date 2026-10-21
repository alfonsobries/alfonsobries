import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { Alert } from 'react-native';

import { useApiRouter } from '@/api/router';
import { fetchSupportAvailability, type SupportAvailability } from '@/api/support-availability';
import { isOfflineError } from '@/offline/connectivity';
import { cacheKeys, readCache, writeCache } from '@/offline/store';

export type SupportAvailabilityStatus = 'loading' | 'ready' | 'error';

type State = {
  data: SupportAvailability | null;
  failed: boolean;
};

/**
 * One copy for every screen that shows the availability (the home card, the
 * main screen and its sheets), so an optimistic change made in a sheet is
 * already on screen behind it. Seeded from the disk cache, like
 * `useCachedResource`, and written back on every change.
 */
let state: State | null = null;
const listeners = new Set<() => void>();

function current(): State {
  state ??= { data: readCache<SupportAvailability>(cacheKeys.supportAvailability), failed: false };

  return state;
}

function setState(next: State): void {
  state = next;

  if (next.data) {
    writeCache(cacheKeys.supportAvailability, next.data);
  }

  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/** Forgets the in-memory copy, e.g. on sign-out once the disk cache is cleared. */
export function resetSupportAvailability(): void {
  state = null;
}

function errorMessage(error: unknown): string {
  if (isOfflineError(error)) {
    return 'Estás sin conexión. Los cambios necesitan internet para llegar a los chats.';
  }

  const message = (error as { response?: { data?: { message?: unknown } } }).response?.data
    ?.message;

  return typeof message === 'string' ? message : 'Intenta de nuevo en un momento.';
}

/** Refreshes once the current mode is due to change, so the screen never shows an ended mode. */
const MAX_TIMER_MS = 6 * 60 * 60 * 1000;

export function useSupportAvailability() {
  const route = useApiRouter();
  const snapshot = useSyncExternalStore(subscribe, current, current);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setState({ data: await fetchSupportAvailability(route), failed: false });
    } catch (error) {
      // Offline with a cached copy is normal: keep showing it.
      if (isOfflineError(error) && current().data) {
        return;
      }

      setState({ ...current(), failed: true });
    }
  }, [route]);

  /**
   * Applies `optimistic` right away, then the server's answer. On failure the
   * previous copy comes back and the reason is shown. Writes are never queued:
   * a change only matters once the brands hear it, and a replay hours later
   * would apply an override that already ran out.
   */
  const mutate = useCallback(
    async (
      request: () => Promise<SupportAvailability>,
      failureTitle: string,
      optimistic?: (current: SupportAvailability) => SupportAvailability,
    ): Promise<boolean> => {
      const previous = current().data;

      if (previous && optimistic) {
        setState({ data: optimistic(previous), failed: false });
      }

      try {
        setState({ data: await request(), failed: false });

        return true;
      } catch (error) {
        setState({ data: previous, failed: false });
        Alert.alert(failureTitle, errorMessage(error));

        return false;
      }
    },
    [],
  );

  const nextAt = snapshot.data?.status.next_transition?.at;

  useEffect(() => {
    if (!nextAt) {
      return;
    }

    const delay = new Date(nextAt).getTime() - Date.now() + 1000;

    if (delay > MAX_TIMER_MS) {
      return;
    }

    const timer = setTimeout(() => void refresh(), Math.max(1000, delay));

    return () => clearTimeout(timer);
  }, [nextAt, refresh]);

  const status: SupportAvailabilityStatus = snapshot.data
    ? 'ready'
    : snapshot.failed
      ? 'error'
      : 'loading';

  return { data: snapshot.data, status, refresh, mutate };
}
