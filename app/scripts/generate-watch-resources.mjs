// Builds the watch target's bundled resources from the app's single source of
// truth: rosary.json (all four mystery sets with their guided steps) plus the
// voice clips. Output is gitignored; `eas-build-pre-install` regenerates it in
// the build workspace. Run with: node --experimental-strip-types scripts/generate-watch-resources.mjs
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'targets', 'watch', 'Resources');

const { getRosarySteps, MYSTERY_SETS, mysterySetForWeekday } =
  await import('../src/data/rosary.ts');

/** One representative weekday per set, to expand its guided steps. */
const SAMPLE_WEEKDAYS = { gozosos: 1, dolorosos: 2, luminosos: 4, gloriosos: 0 };

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

const sets = Object.fromEntries(
  Object.entries(SAMPLE_WEEKDAYS).map(([key, weekday]) => {
    const { set, steps } = getRosarySteps(weekday);

    return [
      key,
      {
        name: set.name,
        daysLabel: set.daysLabel,
        steps: steps.map((step) => ({
          key: step.key,
          section: step.sectionKey,
          title: step.title,
          subtitle: step.subtitle ?? null,
          audio: step.audio,
          bead: step.bead ?? null,
          // The pocket rosary shows the mystery card, not the full readings.
          text: step.mystery
            ? `${step.mystery.ordinal}.\nFruto: ${step.mystery.fruit}.\n${step.mystery.citation}`
            : flattenBlocks(step.blocks),
        })),
      },
    ];
  }),
);

const weekdays = Array.from({ length: 7 }, (_, day) => mysterySetForWeekday(day));

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'Audio'), { recursive: true });
writeFileSync(join(out, 'rosary.json'), JSON.stringify({ weekdays, sets }));
cpSync(join(root, 'assets', 'rosary', 'audio'), join(out, 'Audio'), { recursive: true });

console.log(`watch resources ready: ${Object.keys(sets).length} sets`);

// Sanity: every referenced clip must exist in the copied audio.
const { readdirSync } = await import('node:fs');
const clips = new Set(readdirSync(join(out, 'Audio')).map((file) => file.replace(/\.mp3$/, '')));
const missing = Object.values(sets)
  .flatMap((set) => set.steps.map((step) => step.audio))
  .filter((clip) => !clips.has(clip));

if (missing.length > 0) {
  throw new Error(`missing audio clips: ${[...new Set(missing)].join(', ')}`);
}
