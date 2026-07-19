# Virtue journey art (tierra / cielo / árbol)

Replaces the old lobo / sabio / árbol / paisaje / farol stack.

## Layers

| Set | Area | Role |
| --- | --- | --- |
| `tierra` | Body | Ground mound |
| `cielo` | Mind | Full-bleed sky |
| `arbol` | Spirit | Tree sticker (also the compact UI icon) |

Game stages (1–30) map onto **3 art frames** via `VirtueDay::journeyArtStage()`:

- 1–10 → art 01 (abyss / dead night)
- 11–20 → art 02 (path / dawn)
- 21–30 → art 03 (summit / daylight)

## Alignment strategy (AI is imperfect)

Do **not** trust the model to place subjects in a shared scene.

1. Generate each layer **isolated** on magenta chroma (no die-cut white borders).
2. Run `api/scripts/normalize-virtue-landscape.py` so every PNG shares world anchors:
   - tree root bottoms → fixed `TREE_ROOT_Y`
   - earth mound top overlaps that line (roots plant into the hill)
   - sky is opaque full-bleed with horizon color extended downward
3. App stacks with `absoluteFill` + `contentFit="cover"` — no per-layer CSS offsets.

Raw sources for the current three frames live under
`_experiments/scramble/layers/` (earth-*/tree-*/sky-*). Re-normalize after
regenerating any of them.
