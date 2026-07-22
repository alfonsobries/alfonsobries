# Commands

Daily commands per project. Full reference: `commands.md` at the repo root.

## website/ (Next.js)

- `pnpm dev` / `pnpm build`
- `pnpm typecheck` / `pnpm lint` / `pnpm format`

## api/ (Laravel)

- `composer test` - Pest; single test: `./vendor/bin/pest --filter=TestName`
- `composer analyse` - PHPStan/Larastan
- `composer fix` - Pint (write); `composer lint` for check-only

## app/ (Expo)

- `pnpm start` - Expo dev server
- `pnpm typecheck` / `pnpm lint` / `pnpm format`
- `pnpm routes:generate` - regenerate the typed Ziggy route map after adding/renaming an `api.*` route
- `pnpm svg:optimize` - compress SVGs in `app/assets/`

## Repo root

- `pnpm lint:docs` / `pnpm format:docs` - Markdown lint/format
- `./start-api.sh [ip]` and `./start-mobile.sh [ip]` - local API + app against it
