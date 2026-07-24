import { defineOfflineMutation } from '@/offline/queue';
import { cacheKeys, readCache, writeCache } from '@/offline/store';

import { apiClient } from './client';
import { useApiRouter } from './router';

type ApiRoute = ReturnType<typeof useApiRouter>;

export type Resolution = 'kept' | 'missed';

export type VirtueDay = {
  date: string;
  prayers_completed: boolean;
  resolution: Resolution | null;
};

export type VirtueStats = {
  streak: number;
  days_tracked: number;
  kept_count: number;
  missed_count: number;
};

export type VirtueSummary = {
  days: VirtueDay[];
  stats: VirtueStats;
};

/** The device's local calendar date, which is what the API keys days by. */
export function localDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export async function fetchVirtueSummary(route: ApiRoute): Promise<VirtueSummary> {
  const { data } = await apiClient.get<{ data: VirtueDay[]; stats: VirtueStats }>(
    route('api.virtue.days.index'),
  );

  return { days: data.data, stats: data.stats };
}

export async function setResolution(
  route: ApiRoute,
  date: string,
  resolution: Resolution | null,
): Promise<{ day: VirtueDay; stats: VirtueStats }> {
  const { data } = await apiClient.put<{ data: VirtueDay; stats: VirtueStats }>(
    route('api.virtue.days.resolution', { date }),
    { resolution },
  );

  return { day: data.data, stats: data.stats };
}

export async function completePrayers(
  route: ApiRoute,
  date: string,
): Promise<{ day: VirtueDay; stats: VirtueStats }> {
  const { data } = await apiClient.post<{ data: VirtueDay; stats: VirtueStats }>(
    route('api.virtue.prayers.store'),
    { date },
  );

  return { day: data.data, stats: data.stats };
}

/** Replays a resolution recorded while offline; the latest mark for a day wins. */
export const queueResolution = defineOfflineMutation<{ date: string; resolution: Resolution | null }>(
  'virtue.resolution',
  async ({ date, resolution }, route) => {
    await setResolution(route, date, resolution);
  },
);

export const queuePrayers = defineOfflineMutation<{ date: string }>(
  'virtue.prayers',
  async ({ date }, route) => {
    await completePrayers(route, date);
  },
);

/** The day index the calendar and the stats are both derived from. */
function dayNumber(date: string): number {
  const [year, month, day] = date.split('-').map(Number);

  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

/**
 * Mirrors the API's stats so a change made offline updates the streak straight
 * away instead of waiting for the next sync. The server stays authoritative —
 * this is only what the screen shows until it answers again.
 */
export function computeVirtueStats(days: VirtueDay[], today: string = localDate()): VirtueStats {
  if (days.length === 0) {
    return { streak: 0, days_tracked: 0, kept_count: 0, missed_count: 0 };
  }

  const dates = days.map((day) => day.date);
  const first = dates.reduce((a, b) => (a < b ? a : b));
  const missed = days.filter((day) => day.resolution === 'missed').map((day) => day.date);
  const lastMissed = missed.length > 0 ? missed.reduce((a, b) => (a > b ? a : b)) : null;

  const todayNumber = dayNumber(today);
  const start = lastMissed === null ? dayNumber(first) : dayNumber(lastMissed) + 1;

  return {
    streak: Math.max(0, todayNumber - start + 1),
    days_tracked: Math.max(0, todayNumber - dayNumber(first) + 1),
    kept_count: days.filter((day) => day.resolution === 'kept').length,
    missed_count: missed.length,
  };
}

/** A summary with one day patched in and the stats recomputed around it. */
export function withVirtueDay(
  summary: VirtueSummary | null,
  date: string,
  patch: Partial<Omit<VirtueDay, 'date'>>,
): VirtueSummary {
  const days = summary?.days ?? [];
  const existing = days.find((day) => day.date === date);
  const next: VirtueDay = {
    date,
    prayers_completed: existing?.prayers_completed ?? false,
    resolution: existing?.resolution ?? null,
    ...patch,
  };

  const merged = existing
    ? days.map((day) => (day.date === date ? next : day))
    : [...days, next].sort((a, b) => (a.date < b.date ? -1 : 1));

  return { days: merged, stats: computeVirtueStats(merged) };
}

/**
 * Patches a day straight into the cache, so a change made on one screen is
 * already there when another reads it — with or without a network.
 */
export function cacheVirtueDay(
  date: string,
  patch: Partial<Omit<VirtueDay, 'date'>>,
): VirtueSummary {
  const next = withVirtueDay(readCache<VirtueSummary>(cacheKeys.virtueSummary), date, patch);
  writeCache(cacheKeys.virtueSummary, next);

  return next;
}
