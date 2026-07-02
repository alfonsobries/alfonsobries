# JavaScript / TypeScript

- Prefer **pnpm** over `npm`/`yarn`, and prefer `package.json` scripts over invoking tools directly
- `typecheck` and `lint` must pass clean. Don't silence errors with `@ts-ignore`, `eslint-disable`, or by loosening config — fix the cause. Suppress only with a strong, documented justification
- Avoid `any` (use `unknown` and narrow, or a precise type) unless there's a strong justification. Add explicit return types to exported functions
- Named exports over default exports, except where a framework requires a default (e.g. a page component)
- Use curly braces for every control structure; don't mutate arguments — return new values
