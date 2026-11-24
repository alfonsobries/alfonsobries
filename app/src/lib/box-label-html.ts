import type { BoxWithLabel } from '@/api/boxes';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * A printable label for a box: emoji, name and a large QR inside a dashed cut
 * line, sized to tape onto the side of a box (8 × 10.5 cm).
 */
export function boxLabelHtml(box: BoxWithLabel): string {
  const location = box.location ? `<p class="location">${escapeHtml(box.location)}</p>` : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { margin: 1.5cm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: ui-rounded, -apple-system, system-ui, sans-serif;
    color: #1f1a12;
    -webkit-print-color-adjust: exact;
  }
  .label {
    width: 8cm;
    height: 10.5cm;
    margin: 0 auto;
    padding: 0.55cm;
    border: 1.5px dashed #b9a682;
    border-radius: 0.5cm;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .heading { display: flex; align-items: center; gap: 0.25cm; max-width: 100%; }
  .emoji { font-size: 0.9cm; line-height: 1; }
  h1 {
    margin: 0;
    font-size: 0.62cm;
    line-height: 1.15;
    font-weight: 800;
    overflow-wrap: anywhere;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .location { margin: 0.12cm 0 0; font-size: 0.36cm; color: #6f6250; }
  .qr { margin-top: auto; width: 5.8cm; height: 5.8cm; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .hint { margin: 0.3cm 0 0; font-size: 0.3cm; color: #6f6250; }
</style>
</head>
<body>
  <div class="label">
    <div class="heading">
      <span class="emoji">${escapeHtml(box.emoji)}</span>
      <h1>${escapeHtml(box.name)}</h1>
    </div>
    ${location}
    <div class="qr">${box.qr_svg}</div>
    <p class="hint">Escanea para ver qué hay dentro</p>
  </div>
</body>
</html>`;
}
