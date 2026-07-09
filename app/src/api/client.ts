import { create } from 'axios';

// Ziggy resolves absolute URLs (see `useApiRouter`), so requests don't need a
// baseURL — this instance only centralizes shared headers and timeout.
export const apiClient = create({
  headers: { Accept: 'application/json' },
  timeout: 15000,
});

/**
 * The current bearer header for image loaders (expo-image) that fetch from
 * authenticated API routes outside the axios client.
 */
export function authImageHeaders(): Record<string, string> {
  const authorization = apiClient.defaults.headers.common.Authorization;

  return typeof authorization === 'string' ? { Authorization: authorization } : {};
}
