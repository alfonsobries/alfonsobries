# Offline

The app is a set of family utilities used away from wi-fi — on a plane, in the
car, at a park. A feature whose value doesn't come from the network should work
without one.

**Every new feature gets sorted into one of the three categories below before
it's built.** Utilities and everyday tools default to the first two; only reach
for the third when the network is genuinely what the feature is for.

## What that means per feature

- **Works offline** — anything whose content is bundled or already fetched: the
  rosary and the daily prayers, the virtue calendar and journey, chore
  checklists, behavior boards, past chat threads, every list read once.
- **Records offline, syncs later** — a write the device can decide on its own:
  praying the rosary, marking a habit or a resolution, checking a chore, logging
  a behavior, setting a mood. Apple Health belongs here too — the workout
  minutes are already on the device, so they're recorded locally and reported on
  sync.
- **Needs the network, and says so** — anything the API has to compute or
  arbitrate: AI replies, image generation, invoicing a client, redeeming a
  reward against a points balance, the evening chore review. These show a plain
  "you're offline" message; they never queue a half-applied result.

Don't force the third category into the second — a queued mutation that can't be
replayed faithfully is worse than an honest refusal. And don't let the third
category swallow a feature that merely touches the API: needing to _sync_ is not
the same as needing to be _online_.

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

## Don't mirror a scoring engine

Mirror a derived value locally only when the derivation is trivial and lives in
one place. Virtue's points, stages and floors are a calibrated engine covered by
tests on the API (`docs/virtue-philosophy.md`); a second copy here would be a
copy that drifts, and a wrong stage on screen is worse than a stale one. So an
offline mark flips the day's checkmarks instantly — that's what the tap is for —
while the score beside it stays at its last synced value until the API
recomputes it. Nothing is lost in between; the pill says what's still queued.

## Session

The stored token is what "signed in" means. Confirming it with the API is a
refresh, not a gate: an unreachable API says nothing about whether a token is
valid, so the session stands and revalidates later. Only an answer from the API
that rejects the token signs the user out — and that also clears the cache and
the queue.
