# Virtue journey art (tierra / cielo / árbol)

Three layered PNGs compose the virtue scene in the app. Game stages are 1–30;
each set has one file per stage (`tierra-01.png` … `tierra-30.png`, same for
`cielo` and `arbol`). The compact dashboard icon is `arbol` alone.

| Set | Area | Role |
| --- | --- | --- |
| `tierra` | Body | Ground mound |
| `cielo` | Mind | Full-bleed sky |
| `arbol` | Spirit | Tree sticker |

Style: epic flat grain — flat shapes, stipple inside fills, hard cuttable
edges. Light follows virtue from abyss through path to summit. Palette and
locks live in `virtue-landscape-style.png`.

## Alignment

Generate each layer isolated on magenta chroma (no die-cut border; tree without
its own soil). Then normalize so every PNG shares world anchors:

```bash
python3 api/scripts/normalize-virtue-landscape.py \
  --src api/resources/illustrations/_series/raw \
  --out api/resources/illustrations \
  --stages 30
```

- Tree root bottoms sit on a fixed `TREE_ROOT_Y`
- Earth mound top overlaps that line so roots plant into the hill
- Sky is opaque full-bleed with the horizon color extended downward

The app stacks with `absoluteFill` + `contentFit="cover"` — no per-layer layout
offsets. Stage prompts: `virtue-landscape-series.php`. Generate raw layers with
`api/scripts/generate-virtue-landscape-series.sh`.
