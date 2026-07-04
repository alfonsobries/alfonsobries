import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';

import { API_ORIGIN, REVERB_HOST, REVERB_KEY, REVERB_PORT, REVERB_SCHEME } from '@/constants/env';

import { apiClient } from './client';

/**
 * A Reverb-backed Echo client for private channels. React Native needs the
 * `pusher-js/react-native` build (which requires @react-native-community/netinfo)
 * and the Pusher client passed explicitly — there is no `window.Pusher` here.
 * Channel auth reuses the Sanctum bearer header already set on the API client.
 * Returns null when Reverb isn't configured so callers can fall back to polling.
 */
export function createEcho(): Echo<'reverb'> | null {
  const authorization = apiClient.defaults.headers.common.Authorization;

  if (!REVERB_KEY || !REVERB_HOST || typeof authorization !== 'string') {
    return null;
  }

  return new Echo({
    broadcaster: 'reverb',
    Pusher,
    key: REVERB_KEY,
    wsHost: REVERB_HOST,
    wsPort: REVERB_PORT,
    wssPort: REVERB_PORT,
    forceTLS: REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${API_ORIGIN}/api/broadcasting/auth`,
    auth: {
      headers: {
        Accept: 'application/json',
        Authorization: authorization,
      },
    },
  });
}
