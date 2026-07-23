#!/usr/bin/env bash
# Generate raw virtue-landscape layers (earth/sky/tree × 01–30).
# Writes to api/resources/illustrations/_series/raw/ (gitignored).
# Then run normalize-virtue-landscape.py to install into tierra/cielo/arbol.
#
# Each layer chains off its own previous stage, so the three can run as
# parallel jobs: LAYERS=earth ./generate-virtue-landscape-series.sh
#
# Env: ONLY=1,2,3  STAGES=30  LAYERS="earth sky tree"  QUALITY=medium  FORCE=1
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERIES="$ROOT/resources/illustrations/virtue-landscape-series.php"
STYLE="$ROOT/resources/illustrations/virtue-landscape-style.png"
RAW="$ROOT/resources/illustrations/_series/raw"
GEN="${IMAGE_GEN:-$HOME/.claude/skills/image-gen/scripts/generate.sh}"
QUALITY="${QUALITY:-medium}"
STAGES="${STAGES:-30}"
ONLY="${ONLY:-}"

mkdir -p "$RAW"

if [[ ! -f "$GEN" ]]; then
  echo "image-gen script not found: $GEN" >&2
  exit 1
fi

if [[ ! -f "$STYLE" ]]; then
  echo "style sheet not found: $STYLE" >&2
  exit 1
fi

field() {
  php -r '
    $s = require $argv[1];
    $key = $argv[2];
    echo trim(preg_replace("/\s+/", " ", $s[$key]));
  ' "$SERIES" "$1"
}

prompt_for() {
  local kind="$1" stage="$2"
  php -r '
    $s = require $argv[1];
    $kind = $argv[2];
    $n = (int) $argv[3];
    $role = trim(preg_replace("/\s+/", " ", $s[$kind]["role"]));
    $subj = $s[$kind]["stages"][$n] ?? null;
    if ($subj === null) { fwrite(STDERR, "missing $kind $n\n"); exit(1); }
    echo "$role STAGE $n/30: $subj";
  ' "$SERIES" "$kind" "$stage"
}

STYLE_LINE="$(field style)"
CHROMA_LINE="$(field chroma)"

gen_one() {
  local kind="$1" stage="$2" out_prefix="$3"
  local n padded prev out prompt
  n=$((10#$stage))
  padded=$(printf '%02d' "$n")
  out="$RAW/${out_prefix}-${padded}.png"
  if [[ -f "$out" && "${FORCE:-}" != "1" ]]; then
    echo "exists $out"
    return 0
  fi

  prompt="$(prompt_for "$kind" "$n"). ${STYLE_LINE} ${CHROMA_LINE}"
  local -a refs=(--ref="$STYLE")
  if (( n > 1 )); then
    prev="$RAW/${out_prefix}-$(printf '%02d' $((n - 1))).png"
    if [[ -f "$prev" ]]; then
      refs+=(--ref="$prev")
      prompt+=" Continuity CRITICAL: the LAST attached image is the previous stage of THIS same layer. Keep the exact same art style, line weight, palette treatment, and silhouette language — only advance growth/light one small step. Never switch to a different illustration style. Never regress."
    fi
  fi
  echo "→ ${out_prefix}-${padded}"
  "$GEN" "$prompt" "${refs[@]}" --size=1536x1024 --quality="$QUALITY" --out="$out"
}

stages_list() {
  if [[ -n "$ONLY" ]]; then
    echo "$ONLY" | tr ',' ' '
  else
    seq 1 "$STAGES"
  fi
}

for n in $(stages_list); do
  for layer in ${LAYERS:-earth sky tree}; do
    gen_one "$layer" "$n" "$layer"
  done
done

echo "Raw layers ready under $RAW"
echo "Normalize with:"
echo "  python3 api/scripts/normalize-virtue-landscape.py --src $RAW --out $ROOT/resources/illustrations --stages $STAGES"
