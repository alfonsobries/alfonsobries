import { useCallback, useEffect, useRef, useState } from 'react';

import { isOfflineError } from './connectivity';
import { readCacheEntry, writeCache } from './store';

export type CachedResourceStatus = 'loading' | 'ready' | 'error';

export type CachedResource<T> = {
  data: T | null;
  status: CachedResourceStatus;
  /** True while the data on screen came from the cache and not from the API. */
  isStale: boolean;
  /** Epoch milliseconds of the cached copy, or `null` when nothing is cached. */
  updatedAt: number | null;
  refresh: () => Promise<void>;
  /** Applies a local change and persists it, for optimistic updates. */
  update: (updater: (current: T | null) => T | null) => void;
};

type Options = {
  /** Skips fetching entirely — e.g. while the session is still resolving. */
  enabled?: boolean;
};

/**
 * Reads an API payload cache-first: whatever was last seen renders immediately,
 * then a refresh reconciles it. Offline, the cached copy simply stays on screen
 * instead of the screen collapsing into an error state.
 */
export function useCachedResource<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: Options = {},
): CachedResource<T> {
  const { enabled = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<CachedResourceStatus>('loading');
  const [isStale, setIsStale] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const activeKey = useRef(key);

  // The cached copy is read synchronously on the first render for this key, so
  // a cold start offline paints real data instead of an empty screen.
  useEffect(() => {
    activeKey.current = key;

    const entry = readCacheEntry<T>(key);

    if (entry) {
      setData(entry.value);
      setUpdatedAt(entry.updatedAt);
      setStatus('ready');
      setIsStale(true);
    } else {
      setData(null);
      setUpdatedAt(null);
      setStatus('loading');
      setIsStale(false);
    }
  }, [key]);

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }

    const requestKey = key;

    try {
      const value = await fetcherRef.current();

      if (activeKey.current !== requestKey) {
        return;
      }

      writeCache(key, value);
      setData(value);
      setUpdatedAt(Date.now());
      setStatus('ready');
      setIsStale(false);
    } catch (error) {
      if (activeKey.current !== requestKey) {
        return;
      }

      // Offline with a cached copy is a normal state, not a failure: keep what
      // is on screen and just mark it stale.
      if (isOfflineError(error) && readCacheEntry<T>(requestKey)) {
        setIsStale(true);
        setStatus('ready');
        return;
      }

      setStatus((current) => (current === 'ready' ? 'ready' : 'error'));
      setIsStale(true);
    }
  }, [enabled, key]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void refresh();
  }, [enabled, refresh]);

  const update = useCallback(
    (updater: (current: T | null) => T | null) => {
      setData((current) => {
        const next = updater(current);

        if (next !== null) {
          writeCache(key, next);
        }

        return next;
      });
      setStatus('ready');
    },
    [key],
  );

  return { data, status, isStale, updatedAt, refresh, update };
}
