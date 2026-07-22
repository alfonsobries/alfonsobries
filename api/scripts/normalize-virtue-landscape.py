#!/usr/bin/env python3
"""Normalize virtue journey layers onto shared world anchors.

Each layer is generated isolated on magenta; this script chroma-keys and
re-places content onto a fixed canvas so every combo stacks cleanly:

  sky   — opaque full-bleed (horizon color extended downward)
  earth — mound centered; top overlaps the tree-root line so roots plant in
  tree  — no personal soil; horizontally centered; root bottoms on TREE_ROOT_Y

Raw files: earth-NN.png, sky-NN.png, tree-NN.png under --src.
Outputs:   tierra/tierra-NN.png, cielo/cielo-NN.png, arbol/arbol-NN.png

Usage:
  python3 api/scripts/normalize-virtue-landscape.py \\
    --src api/resources/illustrations/_series/raw \\
    --out api/resources/illustrations \\
    --stages 30
"""

from __future__ import annotations

import argparse
import colorsys
from pathlib import Path

from PIL import Image

W, H = 1536, 1024
TREE_ROOT_Y = int(H * 0.60)
TREE_HEIGHT_FRAC = 0.50
EARTH_WIDTH_FRAC = 0.88
EARTH_SINK_FRAC = 0.18  # roots land this far down the mound


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
    for y in range(H):
        for x in range(W):
            r, g, b, _a = px[x, y]
            if is_chroma(r, g, b):
                px[x, y] = (0, 0, 0, 0)
    return im


def content_bbox(im: Image.Image) -> tuple[int, int, int, int]:
    box = im.split()[-1].getbbox()
    if box is None:
        raise SystemExit(f"empty layer after chroma: {im}")
    return box


def place_tree(src: Path, out: Path) -> None:
    im = load_cut(src)
    l, t, r, b = content_bbox(im)
    crop = im.crop((l, t, r, b))
    cw, ch = crop.size
    scale = (H * TREE_HEIGHT_FRAC) / ch
    nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
    crop = crop.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.paste(crop, ((W - nw) // 2, TREE_ROOT_Y - nh), crop)
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out)
    print(f"tree  {out.name}: roots@{TREE_ROOT_Y} {nw}x{nh}")


def place_earth(src: Path, out: Path) -> None:
    im = load_cut(src)
    l, t, r, b = content_bbox(im)
    crop = im.crop((l, t, r, b))
    cw, ch = crop.size
    scale = (W * EARTH_WIDTH_FRAC) / cw
    nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
    crop = crop.resize((nw, nh), Image.Resampling.LANCZOS)
    y = TREE_ROOT_Y - int(nh * EARTH_SINK_FRAC)
    y = max(int(H * 0.35), min(y, H - nh))
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.paste(crop, ((W - nw) // 2, y), crop)
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out)
    print(f"earth {out.name}: top={y} overlap_below_root={y + nh - TREE_ROOT_Y}")


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
    hr = sorted(rs)[len(rs) // 2]
    hg = sorted(gs)[len(gs) // 2]
    hb = sorted(bs)[len(bs) // 2]
    for y in range(cut_y + 1):
        last = (hr, hg, hb, 255)
        for x in range(W):
            if px[x, y][3] > 200:
                last = px[x, y]
            else:
                px[x, y] = last
    for y in range(cut_y + 1, H):
        for x in range(W):
            px[x, y] = (hr, hg, hb, 255)
    out.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(out)
    print(f"sky   {out.name}: horizon_row={cut_y}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--src", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--stages", type=int, default=30)
    parser.add_argument(
        "--only",
        type=int,
        nargs="*",
        help="Normalize only these stage numbers (default: all present)",
    )
    args = parser.parse_args()

    for name in ("tierra", "cielo", "arbol"):
        (args.out / name).mkdir(parents=True, exist_ok=True)

    stages = args.only if args.only else list(range(1, args.stages + 1))
    for n in stages:
        earth = args.src / f"earth-{n:02d}.png"
        sky = args.src / f"sky-{n:02d}.png"
        tree = args.src / f"tree-{n:02d}.png"
        if not earth.is_file() or not sky.is_file() or not tree.is_file():
            print(f"skip {n:02d}: missing raw layer(s)")
            continue
        place_earth(earth, args.out / "tierra" / f"tierra-{n:02d}.png")
        place_sky(sky, args.out / "cielo" / f"cielo-{n:02d}.png")
        place_tree(tree, args.out / "arbol" / f"arbol-{n:02d}.png")


if __name__ == "__main__":
    main()
