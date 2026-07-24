import { useCallback, useMemo, useRef, useState } from 'react';

import { isOfflineError } from './connectivity';
import { readCacheEntry, writeCache } from './store';

export type CachedResourceStatus = 'loading' | 'ready' | 'error';

export type CachedResource<T> = {
  data: T | null;
  status: CachedResourceStatus;
  /** True while the data on screen came from the cache and not from the API. */
  isStale: boolean;
  /** Epoch milliseconds of the copy on screen, or `null` when there is none. */
  updatedAt: number | null;
  refresh: () => Promise<void>;
  /** Applies a local change and persists it, for optimistic updates. */
  update: (updater: (current: T | null) => T | null) => void;
};

type Options = {
  /** Skips fetching entirely — e.g. while a route param is still undefined. */
  enabled?: boolean;
};

type Local<T> = {
  key: string;
  value: T;
  updatedAt: number;
};

/**
 * Reads an API payload cache-first: whatever was last seen renders immediately,
 * then a refresh reconciles it. Offline, the cached copy simply stays on screen
 * instead of the screen collapsing into an empty or error state.
 *
 * Fetching is the caller's call — screens trigger `refresh` from `useFocusEffect`,
 * which is also what decides when the data is worth re-reading.
 */
export function useCachedResource<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: Options = {},
): CachedResource<T> {
  const { enabled = true } = options;

  // Read synchronously so a cold start offline paints real data on the very
  // first render rather than after an effect.
  const cached = useMemo(() => readCacheEntry<T>(key), [key]);

  const [local, setLocal] = useState<Local<T> | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);

  const requestedKey = useRef(key);

  const current = local?.key === key ? local : null;
  const data = current ? current.value : (cached?.value ?? null);
  const updatedAt = current ? current.updatedAt : (cached?.updatedAt ?? null);

  const status: CachedResourceStatus =
    data !== null ? 'ready' : failedKey === key ? 'error' : 'loading';

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }

    requestedKey.current = key;

    try {
      const value = await fetcher();

      if (requestedKey.current !== key) {
        return;
      }

      writeCache(key, value);
      setLocal({ key, value, updatedAt: Date.now() });
      setFailedKey(null);
    } catch (error) {
      if (requestedKey.current !== key) {
        return;
      }

      // Offline with something cached is a normal state, not a failure: leave
      // what is on screen and let it read as stale.
      if (isOfflineError(error) && readCacheEntry<T>(key)) {
        return;
      }

      setFailedKey(key);
    }
  }, [enabled, key, fetcher]);

  const update = useCallback(
    (updater: (current: T | null) => T | null) => {
      setLocal((previous) => {
        const base =
          previous?.key === key ? previous.value : (readCacheEntry<T>(key)?.value ?? null);
        const next = updater(base);

        if (next === null) {
          return previous;
        }

        writeCache(key, next);

        return { key, value: next, updatedAt: Date.now() };
      });
      setFailedKey(null);
    },
    [key],
  );

  return { data, status, isStale: current === null, updatedAt, refresh, update };
}
