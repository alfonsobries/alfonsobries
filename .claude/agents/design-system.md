# Design system

Guidance for building UI as a living, reusable system rather than one-off screens.

## Principles
- **Reuse over rebuild** — check for an existing component before writing a new one; build shared primitives once, not per-screen variants.
- **Native-first hybrid** (mobile) — reach for native controls and surfaces first; fall back to custom only when there's no native equivalent.
- **Light + dark from the start** — prefer tokens so components flip with the scheme; a raw value is fine for a deliberate one-off.
- **Cross-surface parity** — a component built for one surface (web, mobile) should hold up on the others where more than one exists.

## Workflow
- Build the primitive, demo it with its variants and states in a catalog or style guide, then reuse it everywhere.
- A new category is rare; when it happens, give it its own place in the catalog rather than folding it into an existing one.
