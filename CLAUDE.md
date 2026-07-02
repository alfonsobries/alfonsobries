# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website and blog (alfonsobries.com), split into top-level projects:

- **`website/`** — Next.js frontend
- **`api/`** — Laravel API backend
- **`app/`** — Expo (React Native) mobile app

## Commands

### Frontend (`website/` directory)
- `pnpm dev` — Start Next.js dev server
- `pnpm build` — Production build (also generates sitemap via postbuild)
- `pnpm typecheck` — Run TypeScript type checking (`tsc`)
- `pnpm lint` — Run ESLint (`eslint .`, flat config)
- `pnpm prepare` — SVG optimize + typecheck + lint (runs on install)

### Backend (`api/` directory)
- `./vendor/bin/pest` — Run PHP tests
- `./vendor/bin/pest --filter=TestName` — Run a single test
- `./vendor/bin/pest --coverage` — Run tests with coverage
- `./vendor/bin/pint` — Format PHP code (Laravel Pint)

### Mobile app (`app/` directory)
- `pnpm start` — Start the Expo dev server
- `pnpm typecheck` — TypeScript type checking (`tsc`)
- `pnpm lint` — Run ESLint (`expo lint`)
- `pnpm routes:generate` — Regenerate the typed Ziggy route map from the API (run after adding/renaming an `api.*` route)
- `pnpm svg:optimize` — Compress the SVGs in `app/assets/` with SVGO

### Local API + app (repo root)
- `./start-api.sh [ip]` — Serve the Laravel API; auto-detects the LAN IP (pass one for a physical device, or `127.0.0.1` for local only)
- `./start-mobile.sh [ip]` — Start Expo pointed at the local API; sets `EXPO_PUBLIC_API_URL` from the same IP

## Architecture

### Frontend (Next.js + TypeScript + Tailwind CSS)
- **Pages router** (`website/pages/`) with `getStaticProps` for SSG
- **Bilingual**: English and Spanish via `next-i18next`. Translations in `website/public/locales/{en,es}/`
- **Dark mode**: `next-themes` with Tailwind dark classes
- **API client**: `website/lib/api.ts` fetches from the Laravel backend at build time
- **Styling**: Tailwind CSS 4 (CSS-first `@import "tailwindcss"`, JS config via `@config`) with the typography and forms plugins. Prettier plugin for class sorting.
- **SVG system**: Custom SVGO config adds dark mode class variants automatically based on layer naming

### Backend (Laravel 13 + PHP 8.3+)
- **API-only**: Routes in `api/routes/api.php` — articles, projects, resume, contact form, typo reporting
- **Admin**: Laravel Nova 5 for content management
- **Content features**: Spatie Translatable (multilingual), Spatie Sluggable (URLs), slug history for redirects
- **Resume PDF**: Generated via Spatie Browsershot + Puppeteer
- **Testing**: Pest PHP with SQLite in-memory DB
- **Formatting**: Laravel Pint with the Laravel preset

### Mobile app (Expo + React Native + NativeWind)
- **Expo Router** (`app/src/app/`) with a file-based routes tree
- **Styling**: NativeWind v4 (Tailwind classes) with semantic tokens from `app/tokens.json`
- **API access**: routes are consumed by their Laravel name. `pnpm routes:generate` runs `php artisan ziggy:generate` in `api/` and writes a typed route map to `app/src/api/ziggy.gen.{js,d.ts}` (committed). `ApiRouterProvider` exposes `useApiRouter()` → `route('api.status')`, which resolves an absolute URL against `EXPO_PUBLIC_API_URL`; requests go through the axios client in `app/src/api/client.ts`
- **Auth**: Sign in with Apple only. `AuthProvider` (`app/src/api/auth.tsx`) exchanges the Apple identity token at `POST /api/auth/apple` for a Sanctum bearer token, persisted in `expo-secure-store`. The root layout gates routes with `Stack.Protected`: the `login` welcome screen when signed out, the `(app)` tab group when signed in. Credential setup: `docs/apple-sign-in.md`

### Key Data Flow
- Laravel API serves content (articles, projects, resume) from a database
- Next.js fetches at build time via `getStaticProps` and generates static pages
- Draft articles viewable via secret preview URLs (`/secret/[secret]/posts/[slug]`)
- Contact form POSTs directly to the API, which sends Telegram notifications

## Environment variables

`website/`, `api/`, and `app/` each keep their own `.env`, gitignored and never shared between them. A few values must stay in sync by hand — check the relevant `.env.example` files when changing one:

- `SECRET_PREFIX` (`website/.env`) and `SECRET_PREFIX` (`api/.env`) — must match; it gates the draft-preview URLs
- `API_URL` (`website/.env`) and `APP_URL` (`api/.env`) — each points at the other service
- `FRONT_URL` (`api/.env`) — points at the frontend's public URL
- `EXPO_PUBLIC_API_URL` (`app/.env`) — the API base URL (including `/api`) the mobile app calls; `start-mobile.sh` sets it to the local API's LAN IP
- `APPLE_CLIENT_ID` (`api/.env`) — the iOS bundle identifier Apple identity tokens are verified against (defaults to `com.alfonsobries.app`); see `docs/apple-sign-in.md`

---

@.claude/agents/core.md
@.claude/agents/js.md
@.claude/agents/react.md
@.claude/agents/design-system.md
