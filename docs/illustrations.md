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

## The children's emotion catalog

Regina and Andrés each have the same non-progressive catalog of 24 emotions.
The definitions and expression directions live in
`api/resources/illustrations/mood-catalog.php`. Each portrait starts from two
canonical references: the child's style sheet and their existing app avatar.
It never starts from the previous emotion, which keeps the face, proportions,
outfit and framing stable across the whole set.

Generate the complete 48-image catalog from `api/`:

```bash
php artisan illustrate:moods
```

Final transparent PNGs are written to
`app/assets/{regina,andres}/emotions/<emotion>.png`. Existing portraits are
skipped, so an interrupted run resumes naturally. Useful focused runs:

```bash
# One child
php artisan illustrate:moods regina

# One or more expressions
php artisan illustrate:moods andres --emotion=happy --emotion=worried

# Regenerate an existing expression
php artisan illustrate:moods regina --emotion=happy --force
```

The image model paints a solid magenta chroma background. The command removes
it with `IllustrationProcessor`, producing a transparent square optimized for
the app's emotion-picker tiles. A lightweight vision review checks identity,
framing, expression and background before accepting each portrait.

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
