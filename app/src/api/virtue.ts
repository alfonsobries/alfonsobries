import { defineOfflineMutation } from '@/offline/queue';
import { cacheKeys, readCache, writeCache } from '@/offline/store';

import { apiClient } from './client';
import { useApiRouter } from './router';

type ApiRoute = ReturnType<typeof useApiRouter>;

export type Resolution = 'kept' | 'missed';

export type VirtueArea = 'body' | 'mind' | 'spirit';

/** The entry-tracked habits; the prayers and the resolution have flows of their own. */
export type VirtueHabit = 'exercise' | 'diet' | 'sun' | 'reading';

export type VirtueDay = {
  date: string;
  prayers_completed: boolean;
  rosary_completed: boolean;
  resolution: Resolution | null;
  habits: Record<VirtueHabit, boolean>;
  /** Measured exercise for the day (Apple Health); a full hour earns a second point. */
  exercise_minutes: number | null;
  /** A big session — measured hour or marked by hand — worth a second point. */
  exercise_big: boolean;
};

export type RosaryStats = {
  total: number;
  month: number;
  streak: number;
};

export type VirtueAreaStats = {
  points: number;
  stage: number;
  stage_count: number;
  next_stage_at: number;
  streak: number;
};

export type VirtueStats = {
  /** Journey art build; rides along every art URL so a replaced stage beats the year-long cache. */
  art_version: string;
  streak: number;
  days_tracked: number;
  kept_count: number;
  missed_count: number;
  /** Headline progression — mirrors the spirit area score. */
  points: number;
  stage: number;
  stage_count: number;
  next_stage_at: number;
  /** Compact UI icon: the arbol layer at the overall progress stage. */
  tree_stage: number;
  tree_stage_count: number;
  rosary: RosaryStats;
  areas: Record<VirtueArea, VirtueAreaStats>;
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

export async function setHabit(
  route: ApiRoute,
  date: string,
  habit: VirtueHabit,
  completed: boolean,
  extras: { minutes?: number; big?: boolean } = {},
): Promise<{ day: VirtueDay; stats: VirtueStats }> {
  const { data } = await apiClient.put<{ data: VirtueDay; stats: VirtueStats }>(
    route('api.virtue.days.habit', { date, habit }),
    { completed, ...extras },
  );

  return { day: data.data, stats: data.stats };
}

export async function completeRosary(
  route: ApiRoute,
  date: string,
  completed = true,
): Promise<{ day: VirtueDay; stats: VirtueStats }> {
  const { data } = await apiClient.post<{ data: VirtueDay; stats: VirtueStats }>(
    route('api.virtue.rosary.store'),
    { date, completed },
  );

  return { day: data.data, stats: data.stats };
}

export async function completePrayers(
  route: ApiRoute,
  date: string,
  completed = true,
): Promise<{ day: VirtueDay; stats: VirtueStats }> {
  const { data } = await apiClient.post<{ data: VirtueDay; stats: VirtueStats }>(
    route('api.virtue.prayers.store'),
    { date, completed },
  );

  return { day: data.data, stats: data.stats };
}

// Marking a day is the tap that must never fail — being on a plane is exactly
// the moment a tracking habit dies. So every mark lands locally first and
// replays later, keyed per day and per thing so re-tapping replaces the pending
// mark instead of stacking a second one.

export const queueResolution = defineOfflineMutation<{
  date: string;
  resolution: Resolution | null;
}>('virtue.resolution', async ({ date, resolution }, route) => {
  await setResolution(route, date, resolution);
});

export const queuePrayers = defineOfflineMutation<{ date: string; completed: boolean }>(
  'virtue.prayers',
  async ({ date, completed }, route) => {
    await completePrayers(route, date, completed);
  },
);

export const queueRosary = defineOfflineMutation<{ date: string; completed: boolean }>(
  'virtue.rosary',
  async ({ date, completed }, route) => {
    await completeRosary(route, date, completed);
  },
);

export const queueHabit = defineOfflineMutation<{
  date: string;
  habit: VirtueHabit;
  completed: boolean;
  minutes?: number;
  big?: boolean;
}>('virtue.habit', async ({ date, habit, completed, minutes, big }, route) => {
  await setHabit(route, date, habit, completed, { minutes, big });
});

export const virtueDedupeKey = {
  resolution: (date: string) => `virtue.resolution:${date}`,
  prayers: (date: string) => `virtue.prayers:${date}`,
  rosary: (date: string) => `virtue.rosary:${date}`,
  habit: (date: string, habit: VirtueHabit) => `virtue.habit:${date}:${habit}`,
};

const EMPTY_HABITS: Record<VirtueHabit, boolean> = {
  exercise: false,
  diet: false,
  sun: false,
  reading: false,
};

/**
 * A summary with one day's marks patched in.
 *
 * The stats ride along untouched on purpose: points, stages and floors are a
 * calibrated engine covered by tests on the API (`docs/virtue-philosophy.md`),
 * and a second copy of that curve here would be a copy that drifts. The marks
 * flip instantly, which is what the day's taps are about; the score catches up
 * when the API recomputes it — and nothing built is ever lost in the meantime.
 */
export function withVirtueDay(
  summary: VirtueSummary | null,
  date: string,
  patch: Partial<Omit<VirtueDay, 'date'>>,
): VirtueSummary | null {
  if (!summary) {
    return null;
  }

  const existing = summary.days.find((day) => day.date === date);
  const next: VirtueDay = {
    date,
    prayers_completed: existing?.prayers_completed ?? false,
    rosary_completed: existing?.rosary_completed ?? false,
    resolution: existing?.resolution ?? null,
    habits: existing?.habits ?? EMPTY_HABITS,
    exercise_minutes: existing?.exercise_minutes ?? null,
    exercise_big: existing?.exercise_big ?? false,
    ...patch,
  };

  const days = existing
    ? summary.days.map((day) => (day.date === date ? next : day))
    : [...summary.days, next].sort((a, b) => (a.date < b.date ? -1 : 1));

  return { days, stats: summary.stats };
}

/**
 * Patches a day straight into the cache, so a change made on one screen is
 * already there when another reads it — with or without a network.
 */
export function cacheVirtueDay(
  date: string,
  patch: Partial<Omit<VirtueDay, 'date'>>,
): VirtueSummary | null {
  const next = withVirtueDay(readCache<VirtueSummary>(cacheKeys.virtueSummary), date, patch);

  if (next) {
    writeCache(cacheKeys.virtueSummary, next);
  }

  return next;
}
