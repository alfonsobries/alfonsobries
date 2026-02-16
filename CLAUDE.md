# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website and blog (alfonsobries.com) with a **Next.js frontend** and a **Laravel API backend** in the `api/` directory.

## Commands

### Frontend (root directory)
- `yarn dev` — Start Next.js dev server
- `yarn build` — Production build (also generates sitemap via postbuild)
- `yarn typecheck` — Run TypeScript type checking (`tsc`)
- `yarn lint` — Run ESLint (`next lint`)
- `yarn prepare` — SVG optimize + typecheck + lint (runs on install)

### Backend (`api/` directory)
- `./vendor/bin/pest` — Run PHP tests
- `./vendor/bin/pest --filter=TestName` — Run a single test
- `./vendor/bin/pest --coverage` — Run tests with coverage
- `./vendor/bin/pint` — Format PHP code (Laravel Pint)

## Architecture

### Frontend (Next.js + TypeScript + Tailwind CSS)
- **Pages router** (`pages/`) with `getStaticProps` for SSG
- **Bilingual**: English and Spanish via `next-i18next`. Translations in `public/locales/{en,es}/`
- **Dark mode**: `next-themes` with Tailwind dark classes
- **API client**: `lib/api.ts` fetches from the Laravel backend at build time
- **Styling**: Tailwind CSS 3 with typography, forms, aspect-ratio, and line-clamp plugins. Prettier plugin for class sorting.
- **SVG system**: Custom SVGO config adds dark mode class variants automatically based on layer naming

### Backend (Laravel 9 + PHP)
- **API-only**: Routes in `api/routes/api.php` — articles, projects, resume, contact form, typo reporting
- **Admin**: Laravel Nova for content management
- **Content features**: Spatie Translatable (multilingual), Spatie Sluggable (URLs), slug history for redirects
- **Resume PDF**: Generated via Spatie Browsershot + Puppeteer
- **Testing**: Pest PHP with SQLite in-memory DB

### Key Data Flow
- Laravel API serves content (articles, projects, resume) from a database
- Next.js fetches at build time via `getStaticProps` and generates static pages
- Draft articles viewable via secret preview URLs (`/secret/[secret]/posts/[slug]`)
- Contact form POSTs directly to the API, which sends Telegram notifications

## Code Style
- **Frontend**: ESLint (`next/core-web-vitals` + Prettier), TypeScript strict
- **Backend**: Laravel Pint with Laravel preset
- **Commits**: Conventional Commits (e.g. `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`)
