// Builds the watch target's bundled resources from the app's single source of
// truth: prayers.json (the Auxilium sequence for every weekday).
// Output is gitignored; `eas-build-pre-install` regenerates it in
// the build workspace. Run with: node --experimental-strip-types scripts/generate-watch-resources.mjs
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'targets', 'watch', 'Resources');

const { getPrayerSteps } = await import('../src/data/auxilium.ts');

function flattenBlocks(blocks) {
  return blocks
    .map((block) => {
      switch (block.kind) {
        case 'paragraph':
          return block.text;
        case 'lines':
          return block.lines.join('\n');
        case 'versicle':
          return `V. ${block.call}\nR. ${block.response}`;
        case 'litany':
          return block.items.map((item) => `${item.call}, ${item.response}`).join('\n');
        case 'note':
          return block.text;
        default:
          return '';
      }
    })
    .join('\n\n');
}

// Six of the seven steps repeat every day, so the days index into a shared step
// table instead of carrying their own copy of the litany.
const prayerSteps = {};
const prayerDays = Array.from({ length: 7 }, (_, day) =>
  getPrayerSteps(day).map((step) => {
    const key = step.key === 'day-prayer' ? `day-${day}` : step.key;

    prayerSteps[key] = {
      title: step.title,
      subtitle: step.subtitle ?? null,
      text: flattenBlocks(step.blocks),
    };

    return key;
  }),
);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'prayers.json'), JSON.stringify({ days: prayerDays, steps: prayerSteps }));

console.log(`watch resources ready: ${Object.keys(prayerSteps).length} prayer steps`);
