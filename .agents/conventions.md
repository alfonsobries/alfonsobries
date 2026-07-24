# Conventions

- **Any native-layer change in `app/` MUST bump `runtimeVersion` in `app/app.json` in the
  same change, then rebuild + submit.** OTA updates only reach builds on the same
  runtime; shipping JS a binary can't run crashes the app. Native change =
  adding/removing/upgrading a native module, editing `plugins`/`ios`/`android` in
  `app.json`, changing the Expo SDK, or native entitlements/permissions. JS/asset-only
  changes ship over OTA - no bump.
- The mobile app consumes API routes by their Laravel route name through
  `useApiRouter()` / `route(...)` - never hardcode URLs. After adding or renaming an
  `api.*` route, run `pnpm routes:generate` in `app/` and commit the regenerated map.
- User-facing copy on the website is bilingual (EN/ES via `next-i18next`); both locale
  files change in the same PR.
