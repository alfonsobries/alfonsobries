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
