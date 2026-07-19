# Virtue landscape experiment (epic flat grain)

POC for replacing the virtue journey art (lobo / sabio / árbol / paisaje) with a
composable **earth + tree + sky** scene.

## Direction

| Layer | Maps to | Role |
| --- | --- | --- |
| Earth / ground | Body | Cracked → rocky → lush mound |
| Tree | Spirit | Dead sprout → sapling → tree of life |
| Sky | Mind | Dead night → dawn → radiant day |

- **Hero UI:** composite the three layers (independent stages per area).
- **Simple UI:** reuse the tree sticker alone (no separate “farol” series).
- **No general paisaje** plate — sky + earth replace it.
- Light follows virtue: abyss = night, path = dawn, summit = daylight/sun.
- No foreground rivers (distant water band behind the horizon is OK).

## Style

`virtue-landscape-style-epic-flat-grain-v2.png` — locked style sheet
(flat shapes, stipple grain inside fills, hard cuttable edges).

## POC contents (`scramble/`)

Three milestones only: **A** low / abyss, **B** ~3/5 path, **C** final / summit.

- `combined/` — full scenes painted as one (reference look)
- `layers/` — earth / tree / sky on magenta chroma (for stacking)
- `boards/BOARD-scramble-overview.png` — matched + cross-layer scrambles
- `boards/simple-tree-*.png` — tree-only compact variants

Layer prompts must forbid white/cream die-cut borders; sky must be full-bleed
across the upper frame (not a floating rectangle).
