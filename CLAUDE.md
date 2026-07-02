# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website and blog (alfonsobries.com), split into top-level projects:

- **`website/`** — Next.js frontend
- **`api/`** — Laravel API backend

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

### Key Data Flow
- Laravel API serves content (articles, projects, resume) from a database
- Next.js fetches at build time via `getStaticProps` and generates static pages
- Draft articles viewable via secret preview URLs (`/secret/[secret]/posts/[slug]`)
- Contact form POSTs directly to the API, which sends Telegram notifications

## Environment variables

`website/` and `api/` each keep their own `.env`, gitignored and never shared between them. A few values must stay in sync by hand — check both `.env.example` files when changing one:

- `SECRET_PREFIX` (`website/.env`) and `SECRET_PREFIX` (`api/.env`) — must match; it gates the draft-preview URLs
- `API_URL` (`website/.env`) and `APP_URL` (`api/.env`) — each points at the other service
- `FRONT_URL` (`api/.env`) — points at the frontend's public URL

---

@.claude/agents/core.md
@.claude/agents/js.md
@.claude/agents/react.md
@.claude/agents/design-system.md
