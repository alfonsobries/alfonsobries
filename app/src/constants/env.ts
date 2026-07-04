export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api';

// Ziggy route URIs already include the `api/` prefix, so routes resolve against
// the host origin rather than the `/api` base.
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

// The shared Reverb websocket server for live updates. Leaving the key empty
// disables sockets; anything waiting on them falls back to polling.
export const REVERB_KEY = process.env.EXPO_PUBLIC_REVERB_KEY ?? '';
export const REVERB_HOST = process.env.EXPO_PUBLIC_REVERB_HOST ?? 'ws.vexilo.com';
export const REVERB_PORT = Number(process.env.EXPO_PUBLIC_REVERB_PORT ?? 443);
export const REVERB_SCHEME = process.env.EXPO_PUBLIC_REVERB_SCHEME ?? 'https';
