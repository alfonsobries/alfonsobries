import { Directory, File, Paths } from 'expo-file-system';

// Cached API payloads live in the document directory so the OS never reclaims
// them: without them the app is unusable on a plane, which is the whole point.
const CACHE_DIRECTORY = 'offline-cache';

const CACHE_VERSION = 1;

type CacheEnvelope<T> = {
  version: number;
  updatedAt: number;
  value: T;
};

export type CacheEntry<T> = {
  value: T;
  /** Epoch milliseconds of the write that produced this entry. */
  updatedAt: number;
};

/** Filenames come from code-defined keys, but stay defensive about separators. */
function fileNameFor(key: string): string {
  return `${key.replace(/[^a-zA-Z0-9._-]/g, '_')}.json`;
}

function cacheDirectory(): Directory {
  return new Directory(Paths.document, CACHE_DIRECTORY);
}

function fileFor(key: string): File {
  return new File(cacheDirectory(), fileNameFor(key));
}

function ensureDirectory(): void {
  const directory = cacheDirectory();

  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }
}

/**
 * Reads a cached payload. Returns `null` when nothing is cached, and also when
 * the entry is unreadable — a corrupt cache should degrade to a cache miss,
 * never crash a screen.
 */
export function readCacheEntry<T>(key: string): CacheEntry<T> | null {
  try {
    const file = fileFor(key);

    if (!file.exists) {
      return null;
    }

    const envelope = JSON.parse(file.textSync()) as CacheEnvelope<T>;

    if (envelope.version !== CACHE_VERSION) {
      return null;
    }

    return { value: envelope.value, updatedAt: envelope.updatedAt };
  } catch {
    return null;
  }
}

export function readCache<T>(key: string): T | null {
  return readCacheEntry<T>(key)?.value ?? null;
}

export function writeCache<T>(key: string, value: T): void {
  try {
    ensureDirectory();

    const file = fileFor(key);

    if (!file.exists) {
      file.create({ intermediates: true, overwrite: true });
    }

    const envelope: CacheEnvelope<T> = { version: CACHE_VERSION, updatedAt: Date.now(), value };
    file.write(JSON.stringify(envelope));
  } catch {
    // A failed cache write only costs freshness on the next cold start.
  }
}

export function removeCache(key: string): void {
  try {
    const file = fileFor(key);

    if (file.exists) {
      file.delete();
    }
  } catch {
    // Nothing to do — the entry is already gone or unreadable.
  }
}

/** Drops every cached payload. Used on sign-out so no data outlives a session. */
export function clearCache(): void {
  try {
    const directory = cacheDirectory();

    if (directory.exists) {
      directory.delete();
    }
  } catch {
    // Same reasoning as `removeCache`.
  }
}

export const cacheKeys = {
  user: 'auth-user',
  mutationQueue: 'mutation-queue',
  virtueSummary: 'virtue-summary',
  moods: 'moods',
  family: 'family',
  chores: (member: string) => `chores-${member}`,
  rewards: (member: string) => `rewards-${member}`,
  choreLogs: (member?: string) => `chore-logs-${member ?? 'all'}`,
  behaviors: (member: string) => `behaviors-${member}`,
  behaviorFeed: (member: string) => `behavior-feed-${member}`,
  behaviorSummary: (member: string) => `behavior-summary-${member}`,
  assistants: 'chat-assistants',
  conversation: (assistant: string) => `chat-conversation-${assistant}`,
} as const;
