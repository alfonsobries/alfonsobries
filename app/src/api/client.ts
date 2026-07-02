import { create } from 'axios';

// Ziggy resolves absolute URLs (see `useApiRouter`), so requests don't need a
// baseURL — this instance only centralizes shared headers and timeout.
export const apiClient = create({
  headers: { Accept: 'application/json' },
  timeout: 15000,
});
