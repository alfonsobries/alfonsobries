import { requireOptionalNativeModule } from 'expo';

const WatchBridge = requireOptionalNativeModule<{
  syncContext(context: Record<string, string>): Promise<void>;
}>('WatchBridge');

/**
 * Hands the watch what it needs to work against the API on its own: the auth
 * token, the endpoints it can write to, and the daily routine to show.
 */
export async function syncWatchContext(context: Record<string, string>): Promise<void> {
  await WatchBridge?.syncContext(context);
}
