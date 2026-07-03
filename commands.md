# Commands

Command reference for the monorepo. Three independent projects, each with its own
package manager state, plus repo-wide documentation tooling.

- **`website/`** — Next.js frontend (pnpm)
- **`api/`** — Laravel API backend (composer + pnpm for build tooling)
- **`app/`** — Expo (React Native) mobile app (pnpm)

Run each project's commands from inside its directory unless noted otherwise.

## Quality gates

Every project exposes the same check surface. CI runs exactly these, path-gated to
the project that changed. Run them locally before pushing, in this order:
**formatter → linter → static analysis → tests**.

| Check           | website             | app                 | api                                   |
| --------------- | ------------------- | ------------------- | ------------------------------------- |
| Format (write)  | `pnpm format`       | `pnpm format`       | `./vendor/bin/pint`                   |
| Format (check)  | `pnpm format:check` | `pnpm format:check` | `./vendor/bin/pint --test`            |
| Lint            | `pnpm lint`         | `pnpm lint`         | —                                     |
| Typecheck       | `pnpm typecheck`    | `pnpm typecheck`    | —                                     |
| Static analysis | —                   | —                   | `composer analyse` (PHPStan/Larastan) |
| Tests           | —                   | —                   | `composer test` (Pest)                |

## website (`website/`)

- `pnpm dev` — Next.js dev server
- `pnpm build` — production build (generates the sitemap via `postbuild`)
- `pnpm start` — serve the production build
- `pnpm typecheck` — TypeScript (`tsc`, strict)
- `pnpm lint` — ESLint
- `pnpm format` / `pnpm format:check` — Prettier write / check
- `pnpm svg-optimize` — optimize SVGs in `public/images`

## api (`api/`)

PHP (composer):

- `composer test` — run the Pest suite (`./vendor/bin/pest`)
- `./vendor/bin/pest --filter=TestName` — run a single test
- `composer test:coverage` — tests with coverage
- `composer analyse` — PHPStan/Larastan static analysis
- `composer fix` — format with Laravel Pint (`./vendor/bin/pint`)
- `composer lint` — Pint in check-only mode (`./vendor/bin/pint --test`)
- `php artisan …` — the usual Laravel CLI

JS build tooling (pnpm — Vite/Nova components, Puppeteer for the resume PDF):

- `pnpm build` — build the Nova component assets

## app (`app/`)

- `pnpm start` — Expo dev server
- `pnpm typecheck` — TypeScript (`tsc --noEmit`, strict)
- `pnpm lint` — ESLint (`expo lint`)
- `pnpm format` / `pnpm format:check` — Prettier write / check
- `pnpm routes:generate` — regenerate the typed Ziggy route map from the API
- `pnpm tokens:build` — regenerate color tokens from `tokens.json`
- `pnpm icons:tabs` / `pnpm icons:segments` — regenerate PNG icon sets
- `pnpm svg:optimize` — compress the SVGs in `assets/`

### Builds & release (EAS, iOS)

- `pnpm ios:build:production` — local production build (`eas build --local`)
- `pnpm ios:submit` — submit the built IPA to App Store Connect
- `pnpm ios:release` — build then submit
- `pnpm local:build` / `pnpm local:install` — local dev-client build + install

### OTA updates

- `pnpm ota:production` — publish an OTA update to the `production` channel
  straight from your machine (bundles locally, no EAS worker needed). The
  reliable fallback when the cloud workflow is stuck waiting for a worker.
- Pushing to `main` with changes under `app/**` also triggers the
  `eas-update-production.yml` EAS Workflow, which needs an available EAS worker.
- `eas workflow:run create-production-builds.yml` — trigger a full production build.

#### Runtime version — do not forget to bump it

The runtime version is a **fixed string** (`runtimeVersion` in `app.json`), so
every build and OTA update share it and updates reliably reach installed builds.
JS/asset-only changes ship over OTA to the same runtime — no bump needed.

⚠️ **Whenever a change touches the native layer, bump `runtimeVersion` in the
same change, then rebuild and submit a new binary.** Shipping such a change as an
OTA update to the old runtime pushes JS that expects native code the installed
binary doesn't have — it crashes. Bump when you:

- add, remove, or upgrade a native module / library with native code
- change a config plugin, or anything under `plugins` / `ios` / `android` in
  `app.json`
- change the Expo SDK version
- change native entitlements, permissions, or app icons/splash handled natively

Rule of thumb: **native change → bump the runtime + rebuild; JS-only → OTA, no
bump.** Use a plain incrementing string (`"1.0.0"` → `"1.0.1"` → …).

## Documentation (repo root)

Markdown across the repo (excluding the JS subprojects, which format their own):

- `pnpm format:docs` / `pnpm format:docs:check` — Prettier write / check
- `pnpm lint:docs` / `pnpm lint:docs:fix` — markdownlint

## Local development (repo root)

- `./start-api.sh [ip]` — serve the Laravel API; auto-detects the LAN IP (pass one
  for a physical device, or `127.0.0.1` for local only)
- `./start-mobile.sh [ip]` — start Expo pointed at the local API; sets
  `EXPO_PUBLIC_API_URL` from the same IP

## CI

`.github/workflows/ci.yml` runs on pushes to `main` and on pull requests. A
`changes` job path-gates the rest: a project's job runs only when its files (or
anything under `.github/`) changed.

- **api** — Pint check → PHPStan → Pest (PHP 8.4, SQLite in-memory)
- **website** — typecheck → lint → format check
- **app** — typecheck → lint → format check
- **docs** — markdown format check → markdownlint
