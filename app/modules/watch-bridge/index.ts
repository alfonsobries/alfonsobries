import { requireOptionalNativeModule } from 'expo';

const WatchBridge = requireOptionalNativeModule<{
  syncContext(token: string, rosaryUrl: string, prayersUrl: string): Promise<void>;
}>('WatchBridge');

/**
 * Hands the watch what it needs to mark the rosary and the daily prayers
 * against the API on its own.
 */
export async function syncWatchContext(
  token: string,
  rosaryUrl: string,
  prayersUrl: string,
): Promise<void> {
  await WatchBridge?.syncContext(token, rosaryUrl, prayersUrl);
}
