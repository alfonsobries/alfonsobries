<!-- aikit:begin - managed baseline, do not edit -->

## Baseline

Shared rules for every repo. Apply to any stack.

### Commits

- Format: [Conventional Commits](https://www.conventionalcommits.org) - `feat:`, `fix:`, `chore:`, `style:`, `refactor:`, `test:`, `docs:`
- Subject line only, ideally under 50 characters
- Human, direct tone. Avoid formal or robotic voice ("this commit introduces…", "this change implements…")
- **Never** add `Co-Authored-By` or any mention of Claude / AI / agents
- **Never** add a description or body - subject only
- Commit incrementally when a logical chunk lands - don't batch everything at the end

### Pull Requests

- Always draft (`gh pr create --draft`)
- Base branch: the repo's default
- If the repo has a `.github/PULL_REQUEST_TEMPLATE.md`, fill it in as the PR body and check off the items that apply. `gh pr create` ignores the template unless you pass it yourself - write the filled body to a file and use `--body-file`
- **Never** reference Claude / AI / agents in title, body, branch name, or comments
- The description states only what the PR does in its final form. Leave out the history, the decisions behind it, planned follow-ups, and any term that needs outside context. A stranger reading it should get what it does, nothing else
- When new commits change what the PR does, update the title and description to match
- Add a brief **How to test** note when the steps are easy to state; if they aren't clear, ask instead of guessing

### Pre-push checks

Standard order before pushing:

1. Formatter → 2. Linter → 3. Static analysis → 4. Tests

Exact commands are repo-defined (see the repo's `CLAUDE.md` / `AGENTS.md` / `composer.json` / `package.json`). If the formatter modifies files, commit those changes before pushing so CI doesn't kick back automated `style:` cleanup commits.

For long tasks, run only affected checks during the work and defer the full suite to the end. For short tasks, skip intermediate runs.

### Security

- Never commit `.env`, credentials, tokens, or any secret - check diffs for hardcoded values, not just filenames
- Never read or commit protected files: `.env*`, `auth.json`, `AuthKey_*.p8`, `*.pem`, `*.key`, service-account `*.json` credentials
- Flag any new dependency as suspect before adding it (typosquatting, unknown maintainer)
- No destructive operations (`force-push`, branch deletion, history rewrite, `git reset --hard`, `rm -rf`) without explicit confirmation from the dev
- For external tools (CI, pastebins, gists): consider whether uploaded content could be sensitive - it may be cached or indexed even if later deleted

### Code style

- Follow existing patterns before introducing new ones; reuse existing components/helpers before writing new ones
- Comments and identifiers in **English**
- No comments unless explaining a non-obvious **why** (a hidden constraint, a subtle invariant, a workaround for a specific bug). A well-named identifier beats a comment explaining the "what"
- **Don't document changes in comments.** A comment describes the code as it is, not how it got there:
  - ❌ `// moved from backend to frontend`
  - ❌ `// renamed from foo to bar`
  - ❌ `// replaces the previous logic that used X`
  - ❌ `// added for issue #123`
  - ✅ omit it - git log / PR tells the story
- Don't reference callers or temporal context: no `// used by X`, `// for the Y flow`, `// added in sprint Z`
- Never hand-edit generated files (types, route helpers, lockfiles) - rerun the generator instead

### Writing

Applies to everything written - code, comments, commits, PRs, docs, UI copy.

- Use a plain hyphen `-`, never em or en dashes (`—`, `–`). They read as AI-generated.
- Prefer straight quotes (`"` `'`) over curly ones, and regular spaces over non-breaking spaces.

### Docs & rules

Write docs, READMEs, and rule files as the **final state**, for a reader with no prior context. Keep them brief - don't over-explain.

- Don't narrate history - what something replaces, used to be, or was added for. Git history and PRs carry that story
- Don't situate a file among its siblings ("pairs with `x.md`", "like `y.md`"). Files move; each doc stands alone
- Reference another file only when the reader must **act on it**, and by what it contains

### Reply style

- Concise. Skip the obvious
- End-of-turn summary: one or two sentences - what changed, what's next
- No long essays, no unnecessary disclaimers, no "sure, happy to help…"

### Overrides

- Personal override (gitignored): `CLAUDE.local.md` for Claude Code; `AGENTS.override.md` for Codex (replaces `AGENTS.md` for that machine - start it by copying `AGENTS.md`). Cursor personal rules live in its User Rules setting, not in a file
- Per-repo override: add rules below the imports in `CLAUDE.md` and below the managed block in `AGENTS.md`
- Permanent override: PR to the aikit repo

---

## PHP

Code-writing rules for PHP files. Apply when writing or editing PHP code. In Laravel apps these rules layer on top of whatever `laravel/boost` provides.

### Types

- Declare `strict_types=1` at the top of every PHP file.
- Add explicit return type declarations to every method.
- Add type hints to every parameter.
- Use union and intersection types when they fit. Avoid `mixed` unless genuinely unbounded.
- Use `readonly` properties when the value doesn't change after construction.

### Syntax

- Use PHP 8 constructor property promotion. Don't leave empty `__construct()` methods.
- Use curly braces for every control structure, even single-line bodies.
- Use `match` instead of `switch` when assigning a value or returning early.
- Use first-class callable syntax (`Foo::bar(...)`) over closures wrapping a single call.
- Use named arguments when a call has multiple booleans or optional params and clarity beats brevity.

### Enums

- Use enum classes for fixed sets of values; don't use string constants on a class.
- TitleCase for enum case keys: `FavoritePerson`, `Monthly`.

### Comments and PHPDoc

- Prefer PHPDoc blocks over inline comments. Inline comments only for non-obvious WHY.
- Use array shape definitions in PHPDoc for structured arrays:

```php
/** @return array{name: string, age: int} */
```

### PHP 8.4+ array helpers

Prefer the built-in helpers over manual loops:

- `array_find` over `foreach` + early return
- `array_find_key` over manual key lookup
- `array_any` / `array_all` over `foreach` + boolean accumulator

### Composer scripts

Prefer the repo's `composer.json` scripts (`composer format`, `composer analyse`, `composer test`) over invoking the underlying tool directly. If a script is missing, add it.

### Avoid

- Mutating function arguments - take immutable inputs, return new values.
- Static state (singletons, statics for caching). Prefer dependency injection.

---

## Laravel

Conventions for Laravel apps, on top of whatever `laravel/boost` provides.

### Errors and observability

- Report significant failures with `report($e)` (or `\Sentry\captureMessage()` for non-exceptional events) - never `Log::error` as the only signal. A log line nobody tails is where incidents die.
- When a failure affects a user, tell them (notification or localized response), not silence.

### Performance

- Eager-load relations; treat any N+1 as a bug. When a view or DTO touches a relation, verify the query loads it.

### Authorization

- Controllers authorize with `$this->authorize(...)` (the `AuthorizesRequests` trait), never inline `Gate::` calls.
- Permission logic lives in policies/gates. When the UI needs it, expose a `can` map on the DTO (one boolean per ability, filled from the gate) - the frontend renders the backend's decision, never recomputes it.
- Hidden means not sent: when a permission hides data, omit the value from the payload instead of trusting the UI to hide it.

### Dates

- Serialize dates as ISO 8601 with offset (`$model->created_at?->toIso8601String()`); store UTC. Never pre-format for display (`->format('Y-m-d')`, `->toDateString()`) - the frontend formats through its shared helpers.

### Migrations

- While the project has no production database, keep migrations clean: edit the original create migration and reset, instead of stacking alter-table migrations.

### i18n

- User-facing strings are translation keys in lang files, never literals in code - including `ValidationException`, `abort()` messages, and notification copy. All locales change in the same PR.
- Admin-only surfaces (Nova and similar) stay plain English, no translation.

### Frontend types

- Expose API shapes through DTOs (`spatie/laravel-data`) annotated with `#[TypeScript]`, and regenerate the frontend types after changing them.

### Seeders and factories

- Realistic data in the product's locale (real cities, plausible names and prices), not lorem ipsum.

---

## Pest

Testing rules for repos using Pest. Apply when writing or editing tests.

- Write tests as Pest `it()` blocks: `it('rejects expired tokens', function (): void { ... });`. No PHPUnit test classes, no `test()`.
- Convert class-based stubs (e.g. from `php artisan make:test`) to `it()` before filling them in.
- Every bug fix ships with a regression test that fails without the fix.
- While working, run only the affected tests (`--filter=...`); run the full suite once before push, or when asked.
- Test names and code in English.

---

## JavaScript / TypeScript

Code-writing rules for JS/TS files. Apply when writing or editing JS/TS code.

### Types

- TypeScript in strict mode. Don't disable strict checks per file.
- Avoid `any` - use `unknown` and narrow, or a precise type.
- Add explicit return types to exported functions.

### Syntax

- Named exports over default exports (except where a framework requires default, e.g. an Inertia page).
- Use curly braces for every control structure, even single-line bodies.

### Formatting values

- Format dates and amounts through the project's shared formatter helpers, never inline `toLocaleDateString()` / `toLocaleString()`.
- Parse API dates as ISO 8601 (`new Date(iso)`); the backend never pre-formats.

### Package manager

- Prefer **pnpm** over `npm` or `yarn`. Use the shorthand without `run`: `pnpm test`, not `pnpm run test`.

### Scripts

- Prefer the repo's `package.json` scripts over invoking the underlying tool directly.

### Avoid

- Mutating arguments or inputs - take them immutable, return new values.

---

## React

React/TSX conventions. Tiers run from **Essential** (non-negotiable) to **Use with caution** (judgment calls).

### Essential

- One exported component per file; small private sub-components can share it.
- Component files are PascalCase, matching the export (`VotesFilter.tsx`); other files - hooks, utils - are kebab-case (`use-validators.ts`).
- Components use named exports - except where a framework requires a default (Inertia / Next.js pages).
- Name the props type after the component with a `Properties` suffix (`ButtonProperties`), not an inline anonymous shape.
- When a component wraps a host element, extend that element's props so callers can pass native attributes through: `type ButtonProperties = React.ComponentPropsWithoutRef<'button'> & { … }` (use `Omit<…>` to replace one).
- Callback props are named `onX` (`onChange`, `onConfirm`); a component's own internal handlers are named `handleX` (`handleSelectPage`).
- Rendering is pure: compute the JSX from props and state without side effects or mutating them. Side effects belong in event handlers or effects.

### Strongly recommended

- Render list items as named subcomponents (`UsersTable` → `UsersTableRow`), not inline markup inside a `.map()`. Passing the item down or wiring a handler per row is the signal to extract.
- Group code by feature/domain (`domains/vote/{components,hooks,utils}`), not by technical type spread across the app.
- Cross-domain code lives in one dedicated shared area (`shared/`, `app/`), not inside a feature folder. Shared primitives keep plain names (`Button`, `Modal`) - their location, not a prefix, marks them as shared.
- Co-locate tests with the code they cover as `*.test.tsx`.
- One source of truth per piece of state - don't copy props into state.
- Name from general to specific so siblings group together (`SearchInput`, `SearchButton` - not `InputSearch`).

### Recommended

- Order a component file: imports, types, then the component - inside it, hooks → derived values → handlers → `return`.
- For shared context, pair an `XProvider` with a `useXContext` hook that throws when used outside the provider, instead of exporting the raw context.

### Use with caution

- Prefer typing the props parameter over `React.FC` - it mainly adds an implicit `children` you usually don't want.
- Reach for context only for genuinely cross-cutting state - passing a couple of props is not prop-drilling.

---

## Expo / React Native

Conventions for Expo and React Native apps.

- Never hardcode API URLs or endpoints - resolve them through the project's route helpers / generated routes.
- App-side API types come from the backend's generated types; regenerate and commit them when the API changes, never hand-edit.
- All user-facing copy goes through i18n; every locale changes in the same PR. Never `t('key', { defaultValue: '...' })` - a missing key must fail loudly.
- Permissions render backend decisions (flags on the payload); never recompute permission logic client-side.
- Report significant failures to Sentry, not only the console.

<!-- aikit:end -->

<!-- aikit:project:begin - synced from .agents/*.md - edit those files and run aikit update -->

## Project

Personal website and blog (alfonsobries.com), plus a private family app. Top-level
projects: `website/` (Next.js frontend), `api/` (Laravel API backend), `app/` (Expo /
React Native mobile app).

### When to read what

- Backend conventions live in `api/CLAUDE.md` and `api/AGENTS.md`, maintained by Laravel
  Boost. Claude Code and Cursor load them automatically when working under `api/`; if
  your harness hasn't loaded `api/AGENTS.md` (e.g. a root Codex session), read it before
  touching `api/`.
- Before touching architecture, data flow, or auth, read `.agents/architecture.md`.
- Before changing any `.env` value, read `.agents/env.md` - several values must stay in
  sync across projects by hand.
- Before building or styling UI, read `.agents/guides/design-system.md`.
- Before changing Virtue scoring, points, or stage curves, read
  `docs/virtue-philosophy.md` — pacing is calibrated to habit science and
  covered by tests.
- Full command reference (quality gates, builds, local dev): `commands.md` at the repo
  root.

---

## Commands

Daily commands per project. Full reference: `commands.md` at the repo root.

### website/ (Next.js)

- `pnpm dev` / `pnpm build`
- `pnpm typecheck` / `pnpm lint` / `pnpm format`

### api/ (Laravel)

- `composer test` - Pest; single test: `./vendor/bin/pest --filter=TestName`
- `composer analyse` - PHPStan/Larastan
- `composer fix` - Pint (write); `composer lint` for check-only

### app/ (Expo)

- `pnpm start` - Expo dev server
- `pnpm typecheck` / `pnpm lint` / `pnpm format`
- `pnpm routes:generate` - regenerate the typed Ziggy route map after adding/renaming an `api.*` route
- `pnpm svg:optimize` - compress SVGs in `app/assets/`

### Repo root

- `pnpm lint:docs` / `pnpm format:docs` - Markdown lint/format
- `./start-api.sh [ip]` and `./start-mobile.sh [ip]` - local API + app against it

---

## Conventions

- **Any native-layer change in `app/` MUST bump `runtimeVersion` in `app/app.json` in the
  same change, then rebuild + submit.** OTA updates only reach builds on the same
  runtime; shipping JS a binary can't run crashes the app. Native change =
  adding/removing/upgrading a native module, editing `plugins`/`ios`/`android` in
  `app.json`, changing the Expo SDK, or native entitlements/permissions. JS/asset-only
  changes ship over OTA - no bump.
- The mobile app consumes API routes by their Laravel route name through
  `useApiRouter()` / `route(...)` - never hardcode URLs. After adding or renaming an
  `api.*` route, run `pnpm routes:generate` in `app/` and commit the regenerated map.
- User-facing copy on the website is bilingual (EN/ES via `next-i18next`); both locale
  files change in the same PR.

<!-- aikit:project:end -->

<!-- Project-specific instructions go below. -->
