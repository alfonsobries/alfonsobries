import type {
  AvailabilityException,
  AvailabilityMode,
  AvailabilityReason,
  AvailabilityStatus,
  SupportAvailability,
  SupportBrand,
  WeeklyWindow,
} from '@/api/support-availability';

export const MODE_LABEL: Record<AvailabilityMode, string> = {
  online: 'En línea',
  bot: 'Bot',
  offline: 'Desconectado',
};

/** What Alfonso taps to switch to a mode, in his own words. */
export const MODE_ACTION: Record<AvailabilityMode, string> = {
  online: 'Estoy disponible',
  bot: 'Que conteste el bot',
  offline: 'No disponible',
};

export const MODE_DESCRIPTION: Record<AvailabilityMode, string> = {
  online: 'Tú contestas; el bot te sugiere respuestas.',
  bot: 'El bot contesta solo.',
  offline: 'Nadie contesta; el chat pide dejar un mensaje.',
};

const REASON_LABEL: Record<AvailabilityReason, string> = {
  override: 'Cambio manual',
  exception: 'Excepción',
  window: 'Según tu horario',
  outside_hours: 'Fuera de horario',
};

export const WEEKDAYS: { day: number; short: string; long: string; initial: string }[] = [
  { day: 1, short: 'Lun', long: 'Lunes', initial: 'L' },
  { day: 2, short: 'Mar', long: 'Martes', initial: 'M' },
  { day: 3, short: 'Mié', long: 'Miércoles', initial: 'M' },
  { day: 4, short: 'Jue', long: 'Jueves', initial: 'J' },
  { day: 5, short: 'Vie', long: 'Viernes', initial: 'V' },
  { day: 6, short: 'Sáb', long: 'Sábado', initial: 'S' },
  { day: 7, short: 'Dom', long: 'Domingo', initial: 'D' },
];

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** JS `getUTCDay()` (0 = Sunday) to ISO weekday (7 = Sunday). */
function isoWeekday(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

type WallClock = {
  /** `YYYY-MM-DD` as written in the timestamp. */
  date: string;
  /** `HH:MM` as written in the timestamp. */
  time: string;
  /** The timestamp's UTC offset, in minutes. */
  offsetMinutes: number;
};

/**
 * Reads the wall-clock parts of an ISO timestamp exactly as written. The API
 * writes schedule times with the schedule's offset, so this is the time in
 * the schedule's timezone without needing timezone data on the device.
 */
export function wallClock(iso: string): WallClock {
  const match = iso.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$/,
  );

  if (!match) {
    return { date: iso.slice(0, 10), time: iso.slice(11, 16), offsetMinutes: 0 };
  }

  const offset = match[3];
  let offsetMinutes = 0;

  if (offset && offset !== 'Z') {
    const sign = offset.startsWith('-') ? -1 : 1;
    const [hours, minutes] = offset.slice(1).split(':').map(Number);
    offsetMinutes = sign * (hours * 60 + minutes);
  }

  return { date: match[1], time: match[2], offsetMinutes };
}

/** Today's `YYYY-MM-DD` at a given UTC offset. */
function dateAtOffset(now: Date, offsetMinutes: number): string {
  return new Date(now.getTime() + offsetMinutes * 60_000).toISOString().slice(0, 10);
}

export function addDaysToIsoDate(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);

  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** "mar 20 oct", from a `YYYY-MM-DD` date. */
export function formatDay(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const weekday = isoWeekday(new Date(Date.UTC(year, month - 1, day)).getUTCDay());

  return `${WEEKDAYS[weekday - 1].short.toLowerCase()} ${day} ${MONTHS[month - 1]}`;
}

/** "hoy", "mañana", or "el jue 22 oct". */
function relativeDay(date: string, today: string): string {
  if (date === today) {
    return 'hoy';
  }

  if (date === addDaysToIsoDate(today, 1)) {
    return 'mañana';
  }

  return `el ${formatDay(date)}`;
}

/** "las 20:00", "mañana a las 07:00", "el lun 26 oct a las 07:00". */
export function formatMoment(iso: string, now: Date = new Date()): string {
  const clock = wallClock(iso);
  const today = dateAtOffset(now, clock.offsetMinutes);
  const article = clock.time.startsWith('01:') ? 'la' : 'las';

  if (clock.date === today) {
    return `${article} ${clock.time}`;
  }

  return `${relativeDay(clock.date, today)} a ${article} ${clock.time}`;
}

/**
 * The status to show. Cached data can outlive its own next transition (the
 * phone was offline); one step ahead is still known, so it's applied rather
 * than showing a mode that already ended.
 */
export function effectiveStatus(
  availability: SupportAvailability,
  now: Date = new Date(),
): AvailabilityStatus & { stale: boolean } {
  const next = availability.status.next_transition;

  if (next && new Date(next.at).getTime() <= now.getTime()) {
    return {
      mode: next.mode,
      reason: availability.status.reason,
      next_transition: null,
      stale: true,
    };
  }

  return { ...availability.status, stale: false };
}

/** The line under the mode: "hasta las 20:00, luego Bot". */
export function statusDetail(
  status: AvailabilityStatus & { stale?: boolean },
  overrideUntilRemoved: boolean,
): string {
  if (status.stale) {
    return 'Actualizando…';
  }

  if (status.next_transition) {
    return `Hasta ${formatMoment(status.next_transition.at)}, luego ${MODE_LABEL[status.next_transition.mode].toLowerCase()}`;
  }

  if (overrideUntilRemoved) {
    return 'Hasta que lo quites';
  }

  return 'Sin cambios próximos';
}

export function reasonLabel(availability: SupportAvailability, reason: AvailabilityReason): string {
  if (reason === 'exception') {
    const now = Date.now();
    const active = availability.rules.exceptions
      .filter(
        (exception) =>
          new Date(exception.starts_at).getTime() <= now &&
          now < new Date(exception.ends_at).getTime(),
      )
      .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())[0];

    return active?.label ?? REASON_LABEL.exception;
  }

  return REASON_LABEL[reason];
}

/** "justo ahora", "hace 2 min", "hace 3 h", "hace 2 días". */
export function formatAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 1000));

  if (seconds < 45) {
    return 'justo ahora';
  }

  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return `hace ${minutes} min`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `hace ${hours} h`;
  }

  const days = Math.round(hours / 24);

  return days === 1 ? 'hace 1 día' : `hace ${days} días`;
}

export type BrandSyncState = 'synced' | 'pending' | 'error' | 'unconfigured';

export function brandSyncState(brand: SupportBrand, version: number): BrandSyncState {
  if (!brand.enabled || !brand.configured) {
    return 'unconfigured';
  }

  if (brand.last_push_status === 'error') {
    return 'error';
  }

  if (version > 0 && (brand.last_pushed_version ?? 0) < version) {
    return 'pending';
  }

  return 'synced';
}

export type TimeRange = { from: string; to: string };

/** The schedule as the editor sees it: one entry per weekday, Monday first. */
export type DaySchedule = { day: number; ranges: TimeRange[] };

export function minutesOf(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

export function toDaySchedules(weekly: WeeklyWindow[]): DaySchedule[] {
  return WEEKDAYS.map(({ day }) => ({
    day,
    ranges: weekly
      .filter((window) => window.days.includes(day))
      .map(({ from, to }) => ({ from, to }))
      .sort((a, b) => minutesOf(a.from) - minutesOf(b.from)),
  }));
}

export function toWeekly(days: DaySchedule[]): WeeklyWindow[] {
  return days.flatMap(({ day, ranges }) =>
    ranges.map(({ from, to }) => ({ days: [day], from, to })),
  );
}

export function rangeIsValid(range: TimeRange): boolean {
  return minutesOf(range.from) < minutesOf(range.to);
}

/** "L-V 9:00 a 18:00 · S 9:00 a 13:00", a one-line summary of the week. */
export function summarizeWeek(weekly: WeeklyWindow[]): string {
  if (weekly.length === 0) {
    return 'Sin horario';
  }

  const days = toDaySchedules(weekly);
  const groups: { days: number[]; label: string }[] = [];

  for (const { day, ranges } of days) {
    if (ranges.length === 0) {
      continue;
    }

    const label = ranges.map((range) => `${range.from} a ${range.to}`).join(', ');
    const last = groups.at(-1);

    if (last && last.label === label && last.days.at(-1) === day - 1) {
      last.days.push(day);
    } else {
      groups.push({ days: [day], label });
    }
  }

  return groups
    .map((group) => {
      const first = WEEKDAYS[group.days[0] - 1].initial;
      const end = WEEKDAYS[group.days.at(-1)! - 1].initial;

      return `${group.days.length > 1 ? `${first}-${end}` : first} ${group.label}`;
    })
    .join(' · ');
}

/** `HH:MM` to a Date carrying that wall-clock time, for a time picker. */
export function timeToDate(time: string): Date {
  const date = new Date();
  const minutes = minutesOf(time === '24:00' ? '00:00' : time);
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

  return date;
}

/** A picked Date back to `HH:MM`. An end at 00:00 means midnight (`24:00`). */
export function dateToTime(date: Date, isEnd: boolean): string {
  const time = `${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}`;

  return isEnd && time === '00:00' ? '24:00' : time;
}

/** A local `YYYY-MM-DD` for a Date, using the device's calendar. */
export function localIsoDate(date: Date): string {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
}

/** "20 dic - 3 ene", or with times when the span doesn't cover whole days. */
export function describeExceptionSpan(exception: AvailabilityException): string {
  const start = wallClock(exception.starts_at);
  const end = wallClock(exception.ends_at);
  const wholeDays = start.time === '00:00' && end.time === '00:00';

  if (wholeDays) {
    const lastDay = addDaysToIsoDate(end.date, -1);

    return lastDay === start.date
      ? formatDay(start.date)
      : `${formatDay(start.date)} - ${formatDay(lastDay)}`;
  }

  if (start.date === end.date) {
    return `${formatDay(start.date)}, ${start.time} a ${end.time}`;
  }

  return `${formatDay(start.date)} ${start.time} - ${formatDay(end.date)} ${end.time}`;
}

/**
 * The schedule's current UTC offset in minutes, read from a timestamp the API
 * wrote in the schedule's timezone. Falls back to the device's offset.
 */
export function scheduleOffsetMinutes(availability: SupportAvailability): number {
  const sample =
    availability.status.next_transition?.at ??
    availability.rules.override?.until ??
    availability.rules.exceptions[0]?.starts_at;

  return sample ? wallClock(sample).offsetMinutes : -new Date().getTimezoneOffset();
}

/** An instant written at a fixed offset: `2026-10-20T20:00:00-06:00`. */
export function toOffsetIso(instant: Date, offsetMinutes: number): string {
  const shifted = new Date(instant.getTime() + offsetMinutes * 60_000).toISOString().slice(0, 19);
  const sign = offsetMinutes < 0 ? '-' : '+';
  const absolute = Math.abs(offsetMinutes);
  const hours = `${Math.floor(absolute / 60)}`.padStart(2, '0');
  const minutes = `${absolute % 60}`.padStart(2, '0');

  return `${shifted}${sign}${hours}:${minutes}`;
}

/**
 * When "until tomorrow" ends: tomorrow's first window, or 09:00. Mirrors the
 * API only to paint the optimistic state; the API's answer replaces it.
 */
export function tomorrowMorning(availability: SupportAvailability, now: Date = new Date()): string {
  const offset = scheduleOffsetMinutes(availability);
  const tomorrow = addDaysToIsoDate(dateAtOffset(now, offset), 1);
  const [year, month, day] = tomorrow.split('-').map(Number);
  const weekday = isoWeekday(new Date(Date.UTC(year, month - 1, day)).getUTCDay());
  const first = availability.rules.weekly
    .filter((window) => window.days.includes(weekday))
    .map((window) => window.from)
    .sort()[0];
  const minutes = minutesOf(first ?? '09:00');
  const instant = new Date(Date.UTC(year, month - 1, day, 0, minutes) - offset * 60_000);

  return toOffsetIso(instant, offset);
}

/** The device's IANA timezone, when the runtime exposes it. */
export function deviceTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}
