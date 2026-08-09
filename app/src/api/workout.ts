import { defineOfflineMutation } from '@/offline/queue';
import { cacheKeys, readCache, writeCache } from '@/offline/store';

import { apiClient } from './client';
import { useApiRouter } from './router';

type ApiRoute = ReturnType<typeof useApiRouter>;

export type WorkoutExercise = 'pull_ups' | 'push_ups' | 'air_squats' | 'deep_squat';

/** One exercise of the fixed routine. The numbers come from the API so they never drift. */
export type WorkoutPlanEntry = {
  key: WorkoutExercise;
  sets: number;
  target: number;
  unit: 'reps' | 'seconds';
};

export type WorkoutDay = {
  date: string;
  exercises: Record<WorkoutExercise, number>;
  sets_done: number;
  /** What the day emits into the body area: the whole routine is three, anything less is one. */
  points: number;
};

export type WorkoutStats = {
  streak: number;
  full_days: number;
  total_days: number;
};

export type WorkoutSummary = {
  plan: WorkoutPlanEntry[];
  setsTotal: number;
  days: WorkoutDay[];
  stats: WorkoutStats;
};

type SummaryResponse = {
  plan: WorkoutPlanEntry[];
  sets_total: number;
  data: WorkoutDay[];
  stats: WorkoutStats;
};

export const EMPTY_EXERCISES: Record<WorkoutExercise, number> = {
  pull_ups: 0,
  push_ups: 0,
  air_squats: 0,
  deep_squat: 0,
};

export function emptyWorkoutDay(date: string): WorkoutDay {
  return { date, exercises: { ...EMPTY_EXERCISES }, sets_done: 0, points: 0 };
}

export async function fetchWorkoutSummary(route: ApiRoute): Promise<WorkoutSummary> {
  const { data } = await apiClient.get<SummaryResponse>(route('api.workout.index'));

  return { plan: data.plan, setsTotal: data.sets_total, days: data.data, stats: data.stats };
}

export async function setWorkoutSets(
  route: ApiRoute,
  date: string,
  exercise: WorkoutExercise,
  sets: number,
): Promise<{ day: WorkoutDay; stats: WorkoutStats }> {
  const { data } = await apiClient.put<{ data: WorkoutDay; stats: WorkoutStats }>(
    route('api.workout.update', { date, exercise }),
    { sets },
  );

  return { day: data.data, stats: data.stats };
}

// Marking a set is the tap the routine lives on, so it lands locally first and
// replays later. The count travels absolute, which means a replayed tap settles
// on the same number instead of stacking a second one.
export const queueWorkoutSets = defineOfflineMutation<{
  date: string;
  exercise: WorkoutExercise;
  sets: number;
}>('workout.sets', async ({ date, exercise, sets }, route) => {
  await setWorkoutSets(route, date, exercise, sets);
});

export const workoutDedupeKey = (date: string, exercise: WorkoutExercise): string =>
  `workout.sets:${date}:${exercise}`;

/**
 * The routine's two-step reward, mirrored from the API's DailyRoutine so a tap
 * shows what it earned without waiting for the round trip.
 */
export function pointsForSets(setsDone: number, setsTotal: number): number {
  if (setsDone <= 0) {
    return 0;
  }

  return setsDone >= setsTotal ? 3 : 1;
}

export function workoutDay(summary: WorkoutSummary | null, date: string): WorkoutDay {
  return summary?.days.find((day) => day.date === date) ?? emptyWorkoutDay(date);
}

/**
 * A summary with one day's sets patched in. The streak counters ride along
 * untouched: they are the API's to compute, and a second copy here would be a
 * copy that drifts.
 */
export function withWorkoutDay(
  summary: WorkoutSummary | null,
  date: string,
  exercises: Record<WorkoutExercise, number>,
): WorkoutSummary | null {
  if (!summary) {
    return null;
  }

  const setsDone = Object.values(exercises).reduce((total, sets) => total + sets, 0);
  const next: WorkoutDay = {
    date,
    exercises,
    sets_done: setsDone,
    points: pointsForSets(setsDone, summary.setsTotal),
  };

  const days = summary.days.some((day) => day.date === date)
    ? summary.days.map((day) => (day.date === date ? next : day))
    : [...summary.days, next].sort((a, b) => (a.date < b.date ? -1 : 1));

  return { ...summary, days };
}

/**
 * Patches a day straight into the cache, so the home card and the screen agree
 * with or without a network.
 */
export function cacheWorkoutDay(
  date: string,
  exercises: Record<WorkoutExercise, number>,
): WorkoutSummary | null {
  const next = withWorkoutDay(readCache<WorkoutSummary>(cacheKeys.workout), date, exercises);

  if (next) {
    writeCache(cacheKeys.workout, next);
  }

  return next;
}
