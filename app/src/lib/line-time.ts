export function formatLineTime(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;

  if (minutes === 0) {
    return `${rest}s`;
  }

  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}

export function smsSegments(body: string): number {
  if (body.length === 0) {
    return 0;
  }

  const unicode = /[^\x00-\x7F]/.test(body);
  const limit = unicode ? 70 : 160;
  const concat = unicode ? 67 : 153;

  if (body.length <= limit) {
    return 1;
  }

  return Math.ceil(body.length / concat);
}
