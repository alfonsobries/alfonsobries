/** A short spoken-style length: "45s" under a minute, "2:05" from there. */
export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;

  if (minutes === 0) {
    return `${rest}s`;
  }

  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}
