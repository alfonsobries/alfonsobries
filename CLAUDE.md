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

## Working Conventions

### Commits
- [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `chore:`, `style:`, `refactor:`, `test:`, `docs:`
- Subject line only, ideally under 50 characters — no body
- Human, direct tone. Avoid robotic phrasing ("this commit introduces…")
- Never add `Co-Authored-By` or any mention of Claude / AI / agents
- Commit incrementally as each logical chunk lands — don't batch everything at the end

### Pull Requests
- Open as draft (`gh pr create --draft`) against the default branch
- If `.github/PULL_REQUEST_TEMPLATE.md` exists, fill it in as the body (write it to a file and pass `--body-file`; `gh` ignores the template otherwise)
- Never reference Claude / AI / agents in title, body, branch name, or comments

### Pre-push checks
Order before pushing: **formatter → linter → static analysis → tests**. For long tasks run only the affected checks during the work and the full suite once at the end. If the formatter modifies files, commit those before pushing.

### Security
- Never commit `.env`, credentials, tokens, or secrets
- No destructive git operations (force-push, history rewrite, `git reset --hard`, `rm -rf`) without explicit confirmation
- Treat any new dependency as suspect (typosquatting, unknown maintainer) before adding it

## Code Style

### General
- Follow existing patterns and reuse existing components/helpers before introducing new ones
- No comments except a non-obvious **why** (a hidden constraint, a subtle invariant, a workaround). Don't narrate changes in comments (`// renamed from…`, `// added for #123`) — git history tells that story
- **Backend**: Laravel Pint with the Laravel preset

### JavaScript / TypeScript
- Prefer **pnpm** over `npm`/`yarn`, and prefer `package.json` scripts over invoking tools directly
- TypeScript strict mode — don't disable it per file. Avoid `any`; use `unknown` and narrow, or a precise type. Add explicit return types to exported functions
- Named exports over default exports, except where a framework requires a default (e.g. a Next.js page)
- Use curly braces for every control structure; don't mutate arguments — return new values

### React
- One exported component per file; small private sub-components may share it
- Component files are PascalCase matching the export (`VotesFilter.tsx`); hooks/utils are kebab-case (`use-validators.ts`)
- Name the props type after the component with a `Properties` suffix (`ButtonProperties`). When wrapping a host element, extend its props (`React.ComponentPropsWithoutRef<'button'> & { … }`)
- Callback props are `onX` (`onChange`); internal handlers are `handleX` (`handleSelectPage`)
- Rendering stays pure — derive JSX from props/state; side effects live in handlers or effects
- One source of truth per piece of state — don't copy props into state
- Reach for context only for genuinely cross-cutting state

## Overrides
Personal, machine-local preferences go in `CLAUDE.local.md` (gitignored). Repo-wide conventions belong in this file.
