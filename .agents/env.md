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
- `PRIVACYNUMBER_API_KEY` and `PRIVACYNUMBER_WEBHOOK_SECRET` (`api/.env` only) - the
  private line provider. Server-only; never put them in `app/.env` or commit them. The
  webhook secret is the signing secret returned by `POST /v1/webhook_endpoints`.
- `SUPPORT_SYNC_{ZEBRASNAP,KONDABLE,VEXILO}_URL` and `SUPPORT_SYNC_{BRAND}_SECRET`
  (`api/.env` only) - each support brand's API base URL (including `/api`, e.g.
  `https://zebrasnap.com/api`) and the secret shared with that brand. The secret must
  match the one configured on the brand: it signs the availability pushes
  (`X-Availability-Signature`) and is the bearer token the brand pulls with. A brand is
  enabled once both are set; run `php artisan availability:sync-brands --push` after
  changing them. `SUPPORT_TIMEZONE` sets the schedule's initial timezone.
