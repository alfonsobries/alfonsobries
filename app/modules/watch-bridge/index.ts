import { requireOptionalNativeModule } from 'expo';

const WatchBridge = requireOptionalNativeModule<{
  syncContext(token: string, rosaryUrl: string): Promise<void>;
}>('WatchBridge');

/** Hands the watch what it needs to mark the rosary against the API on its own. */
export async function syncWatchContext(token: string, rosaryUrl: string): Promise<void> {
  await WatchBridge?.syncContext(token, rosaryUrl);
}
