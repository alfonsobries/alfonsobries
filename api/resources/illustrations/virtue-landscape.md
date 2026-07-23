# Virtue journey art (tierra / cielo / árbol)

Three layered PNGs compose the virtue scene in the app. Game stages are 1–30;
each set has one file per stage (`tierra-01.png` … `tierra-30.png`, same for
`cielo`, `arbol` and `arbol-icon`).

| Set          | Area   | Role                                       |
| ------------ | ------ | ------------------------------------------ |
| `tierra`     | Body   | Ground mound, bled past every edge         |
| `cielo`      | Mind   | Full-bleed sky                             |
| `arbol`      | Spirit | Tree, planted on the mound at world scale  |
| `arbol-icon` | Spirit | The same tree tight-cropped for compact UI |

Style: epic flat grain — flat shapes, stipple inside fills, hard cuttable
edges. Light follows virtue from abyss through path to summit. Palette and
locks live in `virtue-landscape-style.png`.

## Generating

Stage prompts live in `virtue-landscape-series.php`. Each layer chains off its
own previous stage, so the three run as parallel jobs:

```bash
cd api
for layer in earth sky tree; do
  LAYERS=$layer ONLY=1,2,3,4,5,6 ./scripts/generate-virtue-landscape-series.sh &
done
wait
```

Work in small batches and look at the composed result before continuing — a
stage that drifts in style poisons every stage generated after it.

## Alignment

Each layer is generated isolated on magenta chroma (no die-cut border; the tree
without its own soil). Normalizing chroma-keys it and pins it to world anchors
so any stage combination stacks into one landscape:

```bash
python3 api/scripts/normalize-virtue-landscape.py \
  --src api/resources/illustrations/_series/raw \
  --out api/resources/illustrations \
  --stages 30
```

- The mound summit lands on a fixed `CREST_Y`, scaled past the side edges and
  extended down to the bottom, so the ground never reads as a floating slab
- The tree is scaled along a growth curve from `TREE_MIN_FRAC` to
  `TREE_MAX_FRAC` and planted just under `CREST_Y`
- Sky is opaque full-bleed with the horizon color extended downward
- Every PNG is quantized with `pngquant` and `oxipng`

The app stacks with `absoluteFill` + `contentFit="cover"` — no per-layer layout
offsets.

## Shipping replaced art

Responses are cached for a year and immutable, so a stage that already sits in a
device's cache never gets refetched for the same URL. `App\Virtue\JourneyArt`
hashes the file names and sizes into an `art_version` that rides along in the
stats payload, and the app appends it to every art URL — replacing a PNG changes
the hash, which changes the URL, which fetches the new art. Nothing to bump by
hand.
