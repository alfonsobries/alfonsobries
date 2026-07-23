#!/usr/bin/env python3
"""Normalize virtue journey layers onto shared world anchors.

Each layer is generated in isolation over magenta; this script chroma-keys it
and re-places the content on a fixed canvas so that any stage combination
stacks into one believable landscape:

  sky   — opaque full-bleed (horizon color extended downward)
  earth — mound summit pinned to CREST_Y, bled past both sides and down to the
          bottom edge, so the ground never reads as a floating slab
  tree  — scaled along the growth curve and planted a little under CREST_Y

A tight-cropped `arbol-icon` set comes out of the same tree art for compact UI.

Raw files: earth-NN.png, sky-NN.png, tree-NN.png under --src.
Outputs:   tierra/, cielo/, arbol/, arbol-icon/ under --out.

Usage:
  python3 api/scripts/normalize-virtue-landscape.py \\
    --src api/resources/illustrations/_series/raw \\
    --out api/resources/illustrations \\
    --stages 30
"""

from __future__ import annotations

import argparse
import colorsys
import shutil
import subprocess
from pathlib import Path

from PIL import Image

W, H = 1536, 1024
STAGE_COUNT = 30

CREST_Y = int(H * 0.62)
EARTH_WIDTH_FRAC = 1.14
CREST_BAND_FRAC = 0.14

TREE_MIN_FRAC = 0.13
TREE_MAX_FRAC = 0.56
TREE_SINK = int(H * 0.022)

ICON_SIZE = 512
ICON_PADDING = 0.06


def is_chroma(r: int, g: int, b: int) -> bool:
    if r >= 140 and b >= 140 and g <= 160 and abs(r - b) <= 130 and g < min(r, b) + 15:
        return True
    if r >= 180 and b >= 100 and g <= 120 and r > g + 50:
        return True
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    if s > 0.35 and v > 0.25 and (0.72 <= h <= 0.98 or h <= 0.04):
        return True
    if s > 0.45 and v > 0.4 and 0.62 <= h <= 0.78 and g < 100 and b > 140:
        return True
    return False


def load_cut(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    if im.size != (W, H):
        im = im.resize((W, H), Image.Resampling.LANCZOS)
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, _a = px[x, y]
            if is_chroma(r, g, b):
                px[x, y] = (0, 0, 0, 0)
    return im


def cut_subject(path: Path) -> Image.Image:
    im = load_cut(path)
    box = im.split()[-1].getbbox()
    if box is None:
        raise SystemExit(f"empty layer after chroma key: {path}")
    return im.crop(box)


def tree_height(stage: int) -> int:
    t = (stage - 1) / (STAGE_COUNT - 1)
    return max(1, int(H * (TREE_MIN_FRAC + (TREE_MAX_FRAC - TREE_MIN_FRAC) * t)))


def crest_row(im: Image.Image) -> int:
    """Topmost opaque row within the central band — the summit of the mound."""
    alpha = im.split()[-1].load()
    band = int(im.width * CREST_BAND_FRAC)
    left, right = (im.width - band) // 2, (im.width + band) // 2
    for y in range(im.height):
        for x in range(left, right):
            if alpha[x, y] > 128:
                return y
    return 0


def extend_to_bottom(canvas: Image.Image) -> None:
    """Repeat each column's lowest opaque pixel down to the canvas edge."""
    px = canvas.load()
    for x in range(canvas.width):
        bottom = next(
            (y for y in range(canvas.height - 1, -1, -1) if px[x, y][3] > 128), None
        )
        if bottom is None:
            continue
        fill = px[x, bottom]
        for y in range(bottom + 1, canvas.height):
            px[x, y] = fill


def place_earth(src: Path, out: Path) -> None:
    crop = cut_subject(src)
    scale = (W * EARTH_WIDTH_FRAC) / crop.width
    crop = crop.resize(
        (max(1, int(crop.width * scale)), max(1, int(crop.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.paste(crop, ((W - crop.width) // 2, CREST_Y - crest_row(crop)), crop)
    extend_to_bottom(canvas)
    save(canvas, out)
    print(f"earth {out.name}: crest@{CREST_Y} {crop.width}x{crop.height}")


def place_tree(src: Path, out: Path, icon_out: Path, stage: int) -> None:
    crop = cut_subject(src)
    scale = tree_height(stage) / crop.height
    crop = crop.resize(
        (max(1, int(crop.width * scale)), max(1, int(crop.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.paste(crop, ((W - crop.width) // 2, CREST_Y + TREE_SINK - crop.height), crop)
    save(canvas, out)
    save(icon(cut_subject(src)), icon_out)
    print(f"tree  {out.name}: base@{CREST_Y + TREE_SINK} {crop.width}x{crop.height}")


def icon(crop: Image.Image) -> Image.Image:
    inner = int(ICON_SIZE * (1 - ICON_PADDING * 2))
    scale = inner / max(crop.width, crop.height)
    crop = crop.resize(
        (max(1, int(crop.width * scale)), max(1, int(crop.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    canvas.paste(crop, ((ICON_SIZE - crop.width) // 2, ICON_SIZE - crop.height), crop)
    return canvas


def place_sky(src: Path, out: Path) -> None:
    im = load_cut(src)
    px = im.load()
    cut_y = 0
    for y in range(H):
        if sum(1 for x in range(0, W, 4) if px[x, y][3] > 200) > W / 16:
            cut_y = y
    samples = [px[x, cut_y][:3] for x in range(0, W, 8) if px[x, cut_y][3] > 200]
    if not samples:
        samples = [(20, 40, 80)]
    rs, gs, bs = zip(*samples)
    horizon = (
        sorted(rs)[len(rs) // 2],
        sorted(gs)[len(gs) // 2],
        sorted(bs)[len(bs) // 2],
        255,
    )
    for y in range(cut_y + 1):
        last = horizon
        for x in range(W):
            if px[x, y][3] > 200:
                last = px[x, y]
            else:
                px[x, y] = last
    for y in range(cut_y + 1, H):
        for x in range(W):
            px[x, y] = horizon
    save(im.convert("RGB"), out)
    print(f"sky   {out.name}: horizon_row={cut_y}")


def save(im: Image.Image, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out)
    compress(out)


def compress(out: Path) -> None:
    """Shrink the PNG in place; the art ships in the repo, so bytes matter."""
    if shutil.which("pngquant"):
        subprocess.run(
            ["pngquant", "--force", "--skip-if-larger", "--quality=70-95",
             "--speed", "1", "--strip", "--output", str(out), str(out)],
            check=False, capture_output=True,
        )
    if shutil.which("oxipng"):
        subprocess.run(
            ["oxipng", "-o", "4", "-q", "--strip", "safe", str(out)],
            check=False, capture_output=True,
        )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--src", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--stages", type=int, default=STAGE_COUNT)
    parser.add_argument(
        "--only",
        type=int,
        nargs="*",
        help="Normalize only these stage numbers (default: all)",
    )
    args = parser.parse_args()

    for n in args.only or range(1, args.stages + 1):
        earth = args.src / f"earth-{n:02d}.png"
        sky = args.src / f"sky-{n:02d}.png"
        tree = args.src / f"tree-{n:02d}.png"
        if not (earth.is_file() and sky.is_file() and tree.is_file()):
            print(f"skip {n:02d}: missing raw layer(s)")
            continue
        place_earth(earth, args.out / "tierra" / f"tierra-{n:02d}.png")
        place_sky(sky, args.out / "cielo" / f"cielo-{n:02d}.png")
        place_tree(
            tree,
            args.out / "arbol" / f"arbol-{n:02d}.png",
            args.out / "arbol-icon" / f"arbol-icon-{n:02d}.png",
            n,
        )


if __name__ == "__main__":
    main()
