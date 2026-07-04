# Family illustrations

Everything visual for the kids' tools is generated with AI in one shared
"family sketchbook" style: loose hand-drawn black ink, flat fills, paper-white
faces, each family member with their own garment color.

## The pieces

All under `api/resources/illustrations/`:

- **`style-base.md`** — the shared style prompt. Its intro paragraph documents
  the file; every following paragraph is collapsed into the generation prompt.
- **`character-<member>.md`** — a short character sheet per family member
  (`regina`, `andres`, `saida`, `alfonso`): looks, outfit, proportions, tone.
- **`<member>-style-reference.png`** — the member's visual style sheet
  (palette, stroke, turnaround, expressions, props), attached to every
  generation as the canonical reference.
- **`seed/`** — the pre-generated art shipped with the data migrations that
  create the starting behaviors, chores and rewards.

The app generates through this same system: creating a behavior, chore or
reward kicks off `BehaviorIllustrator`, which composes style + character +
reference sheet for the kid it belongs to and stores the result for the
media library.

## The `illustrate` command

One-off art from the terminal, using the same guides (needs `OPENAI_API_KEY`
in `api/.env`):

```bash
cd api

# A scene starring a family member
php artisan illustrate "saltando feliz en la cama" --member=andres

# Object-only art (no people), e.g. for buttons or empty states
php artisan illustrate "una alcancía con monedas y estrellas"

# Choose where the file lands
php artisan illustrate "leyendo un cuento" --member=regina --out=/tmp/cuento.png
```

Without `--out`, files land in `api/storage/app/illustrations/` (gitignored),
named with a timestamp and a slug of the description. Without `--member`, the
prompt forces an object-only scene while keeping the family line style and
palette (via Alfonso's reference sheet).

Model, provider and quality come from the `AI_ILLUSTRATIONS_*` env vars
(see `api/.env.example`).
