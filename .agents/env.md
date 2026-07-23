# Environment variables

`website/`, `api/`, and `app/` each keep their own `.env`, gitignored and never shared
between them. These values must stay in sync by hand - check the relevant `.env.example`
files when changing one:

- `SECRET_PREFIX` (`website/.env` and `api/.env`) - must match; gates the draft-preview
  URLs.
- `API_URL` (`website/.env`) and `APP_URL` (`api/.env`) - each points at the other
  service.
- `FRONT_URL` (`api/.env`) - the frontend's public URL.
- `EXPO_PUBLIC_API_URL` (`app/.env`) - the API base URL (including `/api`) the mobile app
  calls; `start-mobile.sh` sets it to the local API's LAN IP.
- `APPLE_CLIENT_ID` (`api/.env`) - the iOS bundle identifier Apple identity tokens are
  verified against (defaults to `com.alfonsobries.app`); see `docs/apple-sign-in.md`.
- `EAS_NOTIFY_SECRET` (`app/.env` and `api/.env`) - must match; signs the webhook the
  publish script fires after `eas update` so the API can push an "update ready"
  notification.
