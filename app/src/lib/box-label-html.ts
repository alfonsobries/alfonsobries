import type { BoxLabel } from '@/api/boxes';

export type LabelSize = 'large' | 'small';

type SheetOptions = {
  size: LabelSize;
  /** Dashed outline to cut along; off for die-cut or full-sheet stickers. */
  cutLines: boolean;
};

/** Scale of each size against the large label (8 × 10.5 cm). */
const SCALE: Record<LabelSize, number> = {
  large: 1,
  small: 0.68,
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function labelHtml(box: BoxLabel): string {
  const location = box.location ? `<p class="location">${escapeHtml(box.location)}</p>` : '';

  return `<div class="label">
    <h1><span class="emoji">${escapeHtml(box.emoji)}</span> ${escapeHtml(box.name)}</h1>
    ${location}
    <div class="qr">${box.qr_svg}</div>
    <p class="hint">Escanea para ver qué hay dentro</p>
  </div>`;
}

/**
 * A letter sheet of box labels (emoji, name and a large QR each) laid out in
 * a grid that never splits a label across pages, to print on sticker paper.
 * The labels carry no background, so they also work on transparent sheets.
 */
export function boxLabelsHtml(boxes: BoxLabel[], { size, cutLines }: SheetOptions): string {
  const s = SCALE[size];

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: letter; margin: 1cm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: ui-rounded, -apple-system, system-ui, sans-serif;
    color: #1f1a12;
    -webkit-print-color-adjust: exact;
  }
  .sheet {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4cm;
  }
  .label {
    width: ${8 * s}cm;
    height: ${10.5 * s}cm;
    padding: ${0.55 * s}cm;
    border: ${cutLines ? '1.5px dashed #b9a682' : '1.5px solid transparent'};
    border-radius: ${0.5 * s}cm;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .emoji { font-size: 1.35em; line-height: 1; vertical-align: -0.12em; }
  h1 {
    margin: 0;
    font-size: ${0.62 * s}cm;
    line-height: 1.15;
    font-weight: 800;
    overflow-wrap: anywhere;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .location { margin: ${0.12 * s}cm 0 0; font-size: ${0.36 * s}cm; color: #6f6250; }
  .qr { margin-top: auto; width: ${5.8 * s}cm; height: ${5.8 * s}cm; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .hint { margin: ${0.3 * s}cm 0 0; font-size: ${Math.max(0.3 * s, 0.24)}cm; color: #6f6250; }
</style>
</head>
<body>
  <div class="sheet">
    ${boxes.map(labelHtml).join('\n')}
  </div>
</body>
</html>`;
}
