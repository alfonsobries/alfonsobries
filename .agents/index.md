# Project

Personal website and blog (alfonsobries.com), plus a private family app. Top-level
projects: `website/` (Next.js frontend), `api/` (Laravel API backend), `app/` (Expo /
React Native mobile app).

## When to read what

- Backend conventions live in `api/CLAUDE.md` and `api/AGENTS.md`, maintained by Laravel
  Boost. Claude Code and Cursor load them automatically when working under `api/`; if
  your harness hasn't loaded `api/AGENTS.md` (e.g. a root Codex session), read it before
  touching `api/`.
- Before touching architecture, data flow, or auth, read `.agents/architecture.md`.
- Before changing any `.env` value, read `.agents/env.md` - several values must stay in
  sync across projects by hand.
- Before building or styling UI, read `.agents/guides/design-system.md`.
- Full command reference (quality gates, builds, local dev): `commands.md` at the repo
  root.
