const dayFormatter = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
});

const dayWithYearFormatter = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit' });

const monthFormatter = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' });

const shortMonthFormatter = new Intl.DateTimeFormat('es-MX', { month: 'short' });

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

/** "Hoy", "Ayer", "Lunes 21 sept", or with the year when it isn't this one. */
export function formatDayLabel(date: Date, now: Date = new Date()): string {
  if (isSameDay(date, now)) {
    return 'Hoy';
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, yesterday)) {
    return 'Ayer';
  }

  return capitalize(
    (date.getFullYear() === now.getFullYear() ? dayFormatter : dayWithYearFormatter).format(date),
  );
}

export function formatTime(date: Date): string {
  return timeFormatter.format(date);
}

/** A short "when" for a list row: the time today, otherwise the day. */
export function formatWhen(iso: string): string {
  const date = new Date(iso);

  return isSameDay(date, new Date()) ? formatTime(date) : formatDayLabel(date);
}

export function formatMonth(date: Date): string {
  return capitalize(monthFormatter.format(date));
}

export function formatShortMonth(date: Date): string {
  return capitalize(shortMonthFormatter.format(date).replace('.', ''));
}

/** A local calendar key (YYYY-MM-DD) for grouping by day. */
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

/** Parses a YYYY-MM-DD bucket from the API as a local date. */
export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);

  return new Date(year, (month ?? 1) - 1, day ?? 1);
}
