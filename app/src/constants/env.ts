export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api';

// Ziggy route URIs already include the `api/` prefix, so routes resolve against
// the host origin rather than the `/api` base.
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');
