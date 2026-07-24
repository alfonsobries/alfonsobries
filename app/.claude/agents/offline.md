# Offline

The app is a set of family utilities used away from wi-fi — on a plane, in the
car, at a park. A feature whose value doesn't come from the network should work
without one.

## What that means per feature

- **Works offline** — anything whose content is bundled or already fetched:
  prayers, the virtue calendar, chore checklists, behavior boards, past chat
  threads, every list that was read once.
- **Records offline, syncs later** — a write the device can decide on its own:
  marking a resolution, finishing the prayers, checking a chore, logging a
  behavior, setting a mood.
- **Needs the network, and says so** — anything the API has to compute or
  arbitrate: AI replies, image generation, redeeming a reward against a points
  balance, the evening chore review. These show a plain "you're offline"
  message; they never queue a half-applied result.

Don't force the third category into the second. A queued mutation that can't be
replayed faithfully is worse than an honest refusal.

## The pieces

Everything lives in `src/offline/`:

- **`store.ts`** — a JSON cache on disk (`expo-file-system`, document
  directory). `readCache`/`writeCache` never throw; a corrupt entry is a cache
  miss. Every key is declared in `cacheKeys` — one shape per key, never two.
- **`connectivity.ts`** — whether the API is reachable. Request outcomes are the
  truth; the radio (`NetInfo`) can only drop us offline, never declare us
  online, because a connected device can still sit behind a captive portal.
  While offline, requests fail immediately instead of burning the 15s timeout.
  `installConnectivityTracking()` wires it into the axios client at startup.
- **`queue.tsx`** — mutations waiting for a connection, replayed oldest-first
  and persisted across launches. `defineOfflineMutation(kind, handler)` returns
  the enqueue function for a mutation; pass a `dedupeKey` when only the latest
  value for a subject matters (a mood, a day's resolution), and leave it off
  when each call is its own event (a behavior log).
- **`use-cached-resource.ts`** — cache-first reads for a screen. Renders the
  last known payload immediately, then reconciles. The caller triggers
  `refresh` from `useFocusEffect`.

## Writing a screen

```tsx
const fetcher = useCallback(() => fetchThings(route, member), [route, member]);
const things = useCachedResource<Thing[]>(cacheKeys.things(member), fetcher);

useFocusEffect(
  useCallback(() => {
    void things.refresh();
  }, [things.refresh]),
);
```

For a write, apply it locally first, then reconcile — and only queue when the
failure was `isOfflineError`, so a real API rejection still surfaces:

```tsx
update((current) => withThing(current, next));

try {
  await saveThing(route, next);
} catch (error) {
  if (isOfflineError(error)) {
    queueThing({ id: next.id }, { dedupeKey: `things.save:${next.id}` });
    return;
  }

  await refresh();
  Alert.alert('Could not save', 'Please try again in a moment.');
}
```

Where a value is derived server-side (a streak, a total), mirror the derivation
locally so an offline change updates it straight away — and let the API's copy
win the moment it answers.

## Session

The stored token is what "signed in" means. Confirming it with the API is a
refresh, not a gate: an unreachable API says nothing about whether a token is
valid, so the session stands and revalidates later. Only an answer from the API
that rejects the token signs the user out — and that also clears the cache and
the queue.
