// Renders Phosphor icons to PNGs for the segmented control. The native
// `UISegmentedControl` renders image segments in their baked color
// (`AlwaysOriginal`) and can't tint them per state, so we emit a light- and a
// dark-scheme variant and pick at the call site. Run with `pnpm icons:segments`.
//
// To add or change one, edit ICONS (filename → Phosphor export name) and re-run.
// Emits, per scheme, the density set (`name.png` @1x + `name@2x.png` +
// `name@3x.png`); the dark variant is suffixed `-dark`. The base file's pixel
// size is its point size in React Native.

import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const ICONS = {
  list: 'ListBullets',
  grid: 'SquaresFour',
  chart: 'ChartLine',
};

const LOGICAL_SIZE = 22; // pt
const OUT_DIR = join(ROOT, 'assets/images/segmentIcons');
const DEFS_DIR = join(ROOT, 'node_modules/phosphor-react-native/src/defs');

// Foreground token per scheme (see tokens.json): reads on the track and the
// selected fill in each mode.
const SCHEMES = [
  { suffix: '', fill: '#262420' }, // light foreground
  { suffix: '-dark', fill: '#fdfaf5' }, // dark foreground
];

mkdirSync(OUT_DIR, { recursive: true });

function regularPath(iconName) {
  const src = readFileSync(join(DEFS_DIR, `${iconName}.tsx`), 'utf8');
  const block = src.slice(src.indexOf("'regular'"));
  const match = block.match(/d="([^"]+)"/);
  if (!match) {
    throw new Error(`No regular-weight path found for "${iconName}"`);
  }
  return match[1];
}

function render(d, px, fill) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 256 256"><path d="${d}" fill="${fill}"/></svg>`;
  return new Resvg(svg, { fitTo: { mode: 'width', value: px } }).render().asPng();
}

for (const [file, iconName] of Object.entries(ICONS)) {
  const d = regularPath(iconName);
  for (const scheme of SCHEMES) {
    for (const [density, scale] of [
      ['', 1],
      ['@2x', 2],
      ['@3x', 3],
    ]) {
      writeFileSync(
        join(OUT_DIR, `${file}${scheme.suffix}${density}.png`),
        render(d, LOGICAL_SIZE * scale, scheme.fill),
      );
    }
  }
  console.log(`✓ ${file} (${iconName})`);
}
