# Architecture

## website/ - Next.js + TypeScript + Tailwind CSS

- Pages router (`website/pages/`) with `getStaticProps` for SSG.
- Bilingual EN/ES via `next-i18next`; translations in `website/public/locales/{en,es}/`.
- Dark mode: `next-themes` with Tailwind dark classes.
- API client: `website/lib/api.ts` fetches from the Laravel backend at build time.
- Tailwind CSS 4 (CSS-first `@import "tailwindcss"`, JS config via `@config`) with the
  typography and forms plugins; Prettier plugin sorts classes.
- SVG system: custom SVGO config adds dark-mode class variants based on layer naming.

## api/ - Laravel + PHP 8.4+

- API-only: routes in `api/routes/api.php` - articles, projects, resume, contact form,
  typo reporting.
- Admin: Laravel Nova for content management.
- Content: Spatie Translatable (multilingual), Spatie Sluggable (URLs), slug history for
  redirects.
- Resume PDF via Spatie Browsershot + Puppeteer.
- Testing: Pest with SQLite in-memory DB. Formatting: Pint, Laravel preset.

## app/ - Expo + React Native + NativeWind

Purpose: a private, growing set of utilities for Alfonso and his family (not a public
product) - e.g. shared expenses, tools for the kids.

- Expo Router (`app/src/app/`) with a file-based routes tree.
- Styling: NativeWind (Tailwind classes) with semantic tokens from `app/tokens.json`.
- Art: family avatars and brand art live in `app/assets/`; `app/.claude/agents/icons.md`
  says which file is whose.
- API access: `ApiRouterProvider` exposes `useApiRouter()` -> `route('api.status')`,
  resolving absolute URLs against `EXPO_PUBLIC_API_URL`; requests go through the axios
  client in `app/src/api/client.ts`. The typed route map lives in
  `app/src/api/ziggy.gen.{js,d.ts}` (committed).
- Auth: Sign in with Apple only. `AuthProvider` (`app/src/api/auth.tsx`) exchanges the
  Apple identity token at `POST /api/auth/apple` for a Sanctum bearer token, persisted in
  `expo-secure-store`. The root layout gates routes with `Stack.Protected`. Credential
  setup: `docs/apple-sign-in.md`.

## Data flow

- The Laravel API serves content (articles, projects, resume) from the database.
- Next.js fetches at build time via `getStaticProps` and generates static pages.
- Draft articles are viewable via secret preview URLs (`/secret/[secret]/posts/[slug]`).
- The contact form POSTs directly to the API, which sends Telegram notifications.
