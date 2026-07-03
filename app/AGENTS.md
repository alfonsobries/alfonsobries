# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## OTA runtime version

`runtimeVersion` in `app.json` is a fixed manual string — OTA updates only reach
builds on the same runtime. **Any change to the native layer MUST bump
`runtimeVersion` in the same change, followed by a rebuild + submit** — otherwise
the OTA ships JS that the installed binary can't run and it crashes. Native
changes = adding/removing/upgrading a native module, editing `plugins` / `ios` /
`android` in `app.json`, changing the Expo SDK, or native entitlements/permissions.
JS/asset-only changes ship over OTA to the same runtime — no bump. See the OTA
section in the repo-root `commands.md`.
