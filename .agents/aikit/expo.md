<!-- aikit v0.1.0 - managed file, do not edit -->

# Expo / React Native

Conventions for Expo and React Native apps.

- Never hardcode API URLs or endpoints - resolve them through the project's route helpers / generated routes.
- App-side API types come from the backend's generated types; regenerate and commit them when the API changes, never hand-edit.
- All user-facing copy goes through i18n; every locale changes in the same PR. Never `t('key', { defaultValue: '...' })` - a missing key must fail loudly.
- Permissions render backend decisions (flags on the payload); never recompute permission logic client-side.
- Report significant failures to Sentry, not only the console.
