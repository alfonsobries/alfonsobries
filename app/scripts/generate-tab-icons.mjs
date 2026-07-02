// Renders Phosphor icons to PNGs for the native tab bar.
//
// NativeTabs (`expo-router/unstable-native-tabs`) renders OS-level tab icons
// and can't take a Phosphor React component, so we rasterize the icon here and
// point `NativeTabs.Trigger.Icon` at the PNG with `renderingMode="template"`.
//
// Usage:  pnpm icons:tabs
//
// To add or change a tab icon, edit ICONS below (output filename → Phosphor
// export name, e.g. 'House', 'Compass', 'MagnifyingGlass') and re-run.
//
// We emit the full density set: `name.png` (@1x, the logical point size),
// `name@2x.png`, and `name@3x.png`. The base file's pixel size IS its point
// size in React Native, so it must stay at LOGICAL_SIZE — otherwise the icon
// renders huge. Source viewBox is square (256×256), so output never stretches.

import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const ICONS = {
  home: 'House',
  explore: 'Compass',
};

const LOGICAL_SIZE = 24; // pt — the tab icon's on-screen size
const OUT_DIR = join(ROOT, 'assets/images/tabIcons');
const DEFS_DIR = join(ROOT, 'node_modules/phosphor-react-native/src/defs');

function regularPath(iconName) {
  const src = readFileSync(join(DEFS_DIR, `${iconName}.tsx`), 'utf8');
  const block = src.slice(src.indexOf("'regular'"));
  const match = block.match(/d="([^"]+)"/);
  if (!match) {
    throw new Error(`No regular-weight path found for "${iconName}"`);
  }
  return match[1];
}

function render(d, px) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 256 256"><path d="${d}" fill="#000000"/></svg>`;
  return new Resvg(svg, { fitTo: { mode: 'width', value: px } }).render().asPng();
}

for (const [file, iconName] of Object.entries(ICONS)) {
  const d = regularPath(iconName);
  for (const [suffix, scale] of [['', 1], ['@2x', 2], ['@3x', 3]]) {
    writeFileSync(join(OUT_DIR, `${file}${suffix}.png`), render(d, LOGICAL_SIZE * scale));
  }
  console.log(`✓ ${file} (${iconName})`);
}
