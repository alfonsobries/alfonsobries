import { useEffect, useSyncExternalStore, type ReactNode } from 'react';

import { useApiRouter } from '@/api/router';

import { getIsOnline, isOfflineError, subscribeToConnectivity } from './connectivity';
import { cacheKeys, readCache, writeCache } from './store';

type ApiRoute = ReturnType<typeof useApiRouter>;

export type QueuedMutation = {
  id: string;
  kind: string;
  payload: unknown;
  createdAt: number;
  /** Replaces an earlier pending mutation carrying the same key. */
  dedupeKey?: string;
  attempts: number;
};

type MutationHandler = (payload: never, route: ApiRoute) => Promise<void>;

const handlers = new Map<string, MutationHandler>();
const listeners = new Set<() => void>();

let queue: QueuedMutation[] = readCache<QueuedMutation[]>(cacheKeys.mutationQueue) ?? [];
let sequence = 0;
let flushing = false;

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function persist(next: QueuedMutation[]): void {
  queue = next;
  writeCache(cacheKeys.mutationQueue, queue);
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getQueue(): QueuedMutation[] {
  return queue;
}

/** The mutations waiting for connectivity, oldest first. */
export function usePendingMutations(): QueuedMutation[] {
  return useSyncExternalStore(subscribe, getQueue, getQueue);
}

/**
 * Declares a mutation that survives being offline. Returns the enqueue function
 * for it, typed to the handler's payload: callers hand it a payload and it is
 * replayed against the API as soon as the device is back online.
 */
export function defineOfflineMutation<P>(
  kind: string,
  handler: (payload: P, route: ApiRoute) => Promise<void>,
): (payload: P, options?: { dedupeKey?: string }) => void {
  handlers.set(kind, handler as MutationHandler);

  return (payload, options) => {
    sequence += 1;

    const entry: QueuedMutation = {
      id: `${Date.now()}-${sequence}`,
      kind,
      payload,
      createdAt: Date.now(),
      dedupeKey: options?.dedupeKey,
      attempts: 0,
    };

    const withoutDuplicate = entry.dedupeKey
      ? queue.filter((item) => item.dedupeKey !== entry.dedupeKey)
      : queue;

    persist([...withoutDuplicate, entry]);
  };
}

export function clearQueue(): void {
  persist([]);
}

/**
 * Drops a pending mutation that has been undone before it ever reached the API.
 * Returns whether one was actually waiting.
 */
export function cancelQueued(dedupeKey: string): boolean {
  const remaining = queue.filter((item) => item.dedupeKey !== dedupeKey);

  if (remaining.length === queue.length) {
    return false;
  }

  persist(remaining);

  return true;
}

/**
 * Replays pending mutations oldest-first. Stops at the first one that fails for
 * lack of connectivity so ordering is preserved; a mutation the API rejects
 * outright is dropped, since replaying it would fail forever.
 */
export async function flushQueue(route: ApiRoute): Promise<void> {
  if (flushing || queue.length === 0 || !getIsOnline()) {
    return;
  }

  flushing = true;

  // Entries are removed by id, never by position: a mutation enqueued while one
  // is in flight can have deduped the in-flight entry away, and dropping the
  // head would then discard the newer change instead of the one that just ran.
  const drop = (entry: QueuedMutation): void => {
    persist(queue.filter((item) => item.id !== entry.id));
  };

  try {
    while (queue.length > 0 && getIsOnline()) {
      const [entry] = queue;
      const handler = handlers.get(entry.kind);

      if (!handler) {
        // The mutation was defined by a build that is no longer running.
        drop(entry);
        continue;
      }

      try {
        await handler(entry.payload as never, route);
        drop(entry);
      } catch (error) {
        if (isOfflineError(error)) {
          return;
        }

        const attempts = entry.attempts + 1;

        // The API answered and refused. Give it a couple more passes in case it
        // was transient, then drop it rather than block everything behind it.
        if (attempts >= 3) {
          drop(entry);
          continue;
        }

        persist(queue.map((item) => (item.id === entry.id ? { ...item, attempts } : item)));
        return;
      }
    }
  } finally {
    flushing = false;
  }
}

type OfflineQueueProviderProperties = {
  children: ReactNode;
  /** Replaying only makes sense with a live session. */
  enabled: boolean;
};

export function OfflineQueueProvider({
  children,
  enabled,
}: OfflineQueueProviderProperties): ReactNode {
  const route = useApiRouter();
  const pending = usePendingMutations();
  const online = useSyncExternalStore(subscribeToConnectivity, getIsOnline, getIsOnline);

  useEffect(() => {
    if (!enabled || !online || pending.length === 0) {
      return;
    }

    void flushQueue(route);
  }, [enabled, online, pending.length, route]);

  return children;
}
