# Baseline

Shared rules for every repo in this project. Apply to any stack.

## Commits
- [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `chore:`, `style:`, `refactor:`, `test:`, `docs:`
- Subject line only, ideally under 50 characters — no body
- Human, direct tone. Avoid robotic phrasing ("this commit introduces…")
- Never add `Co-Authored-By` or any mention of Claude / AI / agents
- Commit incrementally as each logical chunk lands — don't batch everything at the end

## Pull Requests
- Open as draft (`gh pr create --draft`) against the default branch
- If `.github/PULL_REQUEST_TEMPLATE.md` exists, fill it in as the body (write it to a file and pass `--body-file`; `gh` ignores the template otherwise)
- Never reference Claude / AI / agents in title, body, branch name, or comments
- When new commits change what the PR does, update the title and description to match — don't leave them describing an earlier version
- Keep the description brief: explain what the PR does and why, in its current final form. Don't narrate the round trip of requested changes that got it there

## Pre-push checks
Order before pushing: **formatter → linter → static analysis → tests**. For long tasks run only the affected checks during the work and the full suite once at the end. If the formatter modifies files, commit those before pushing.

## Security
- This repo is **100% open source and public** — treat every file as visible to anyone before committing it
- Never commit `.env`, credentials, tokens, API keys, or secrets — check diffs for accidentally hardcoded values, not just filenames
- No destructive git operations (force-push, history rewrite, `git reset --hard`, `rm -rf`) without explicit confirmation
- Treat any new dependency as suspect (typosquatting, unknown maintainer) before adding it
- Before pasting content into an external tool (CI logs, pastebins, gists), consider whether it could be sensitive — it may be cached or indexed even after deletion

## Docs & rules
Write docs, READMEs, and rule files as the **final state**, for a reader with no prior context.
- Don't narrate history — what something replaces, used to be, or was added for. Git history and PRs carry that story.
- Don't situate a file among its siblings ("pairs with `x.md`", "like `y.md`"). Files move; each doc should stand alone.
- Reference another file only when the reader must act on it, and describe it by what it contains — not by its relationship to this one.
- The root `README.md` is the project's front door — no roadmaps, no "will move here," no in-progress notes. Update it as the project's actual shape changes.

## Code style
- Follow existing patterns and reuse existing components/helpers before introducing new ones
- No comments except a non-obvious **why** (a hidden constraint, a subtle invariant, a workaround). Don't narrate changes in comments (`// renamed from…`, `// added for #123`) — git history tells that story

## Claude reply style
- Concise. Skip the obvious
- End-of-turn summary: one or two sentences — what changed, what's next
- No long essays, no unnecessary disclaimers, no "sure, happy to help…"

## Overrides
- Per-repo override: add rules below the `@imports` in that repo's `CLAUDE.md`
- Machine-local preferences go in `CLAUDE.local.md` (gitignored)
