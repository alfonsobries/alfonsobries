import { apiClient } from './client';
import { type useApiRouter } from './router';

type ApiRoute = ReturnType<typeof useApiRouter>;

export type AvailabilityMode = 'online' | 'bot' | 'offline';
export type OutsideHoursMode = Exclude<AvailabilityMode, 'online'>;
export type AvailabilityReason = 'override' | 'exception' | 'window' | 'outside_hours';
export type PushStatus = 'applied' | 'stale' | 'error';

export type WeeklyWindow = {
  /** ISO weekdays: 1 = Monday ... 7 = Sunday. */
  days: number[];
  /** `HH:MM` in the schedule's timezone. */
  from: string;
  /** `HH:MM`, exclusive; may be `24:00`. */
  to: string;
};

export type AvailabilityException = {
  id: number;
  /** ISO 8601 with the schedule's offset, so its wall-clock part reads as local time. */
  starts_at: string;
  ends_at: string;
  mode: AvailabilityMode;
  label: string | null;
};

export type AvailabilityOverride = {
  mode: AvailabilityMode;
  until: string | null;
};

export type AvailabilityRules = {
  version: number;
  updated_at: string | null;
  timezone: string;
  weekly: WeeklyWindow[];
  outside_hours_mode: OutsideHoursMode;
  exceptions: AvailabilityException[];
  override: AvailabilityOverride | null;
};

export type AvailabilityStatus = {
  mode: AvailabilityMode;
  reason: AvailabilityReason;
  next_transition: { at: string; mode: AvailabilityMode } | null;
};

export type SupportBrand = {
  name: string;
  label: string;
  enabled: boolean;
  configured: boolean;
  last_pushed_at: string | null;
  last_pushed_version: number | null;
  last_push_status: PushStatus | null;
  last_push_message: string | null;
  reported_mode: AvailabilityMode | null;
  last_pulled_at: string | null;
};

export type SupportAvailability = {
  rules: AvailabilityRules;
  status: AvailabilityStatus;
  /** False until the schedule is saved once: brands have nothing yet. */
  shared: boolean;
  brands: SupportBrand[];
};

export type ScheduleChange = Pick<AvailabilityRules, 'timezone' | 'weekly' | 'outside_hours_mode'>;

export type OverrideChange =
  | { mode: AvailabilityMode; hours: number }
  | { mode: AvailabilityMode; until: string }
  | { mode: AvailabilityMode; tomorrow: true }
  | { mode: AvailabilityMode };

export type ExceptionChange = {
  /** Wall-clock `YYYY-MM-DDTHH:mm` in the schedule's timezone. */
  starts_at: string;
  ends_at: string;
  mode: AvailabilityMode;
  label: string | null;
};

type Envelope = { data: SupportAvailability };

export async function fetchSupportAvailability(route: ApiRoute): Promise<SupportAvailability> {
  const { data } = await apiClient.get<Envelope>(route('api.availability.show'));

  return data.data;
}

export async function updateSchedule(
  route: ApiRoute,
  change: ScheduleChange,
): Promise<SupportAvailability> {
  const { data } = await apiClient.put<Envelope>(route('api.availability.update'), change);

  return data.data;
}

export async function setOverride(
  route: ApiRoute,
  change: OverrideChange,
): Promise<SupportAvailability> {
  const { data } = await apiClient.post<Envelope>(route('api.availability.override.store'), change);

  return data.data;
}

export async function clearOverride(route: ApiRoute): Promise<SupportAvailability> {
  const { data } = await apiClient.delete<Envelope>(route('api.availability.override.destroy'));

  return data.data;
}

export async function saveException(
  route: ApiRoute,
  change: ExceptionChange,
  id?: number,
): Promise<SupportAvailability> {
  const { data } = id
    ? await apiClient.patch<Envelope>(
        route('api.availability.exceptions.update', { exception: id }),
        change,
      )
    : await apiClient.post<Envelope>(route('api.availability.exceptions.store'), change);

  return data.data;
}

export async function deleteException(route: ApiRoute, id: number): Promise<SupportAvailability> {
  const { data } = await apiClient.delete<Envelope>(
    route('api.availability.exceptions.destroy', { exception: id }),
  );

  return data.data;
}

export async function resyncBrands(route: ApiRoute, brand?: string): Promise<SupportAvailability> {
  const { data } = await apiClient.post<Envelope>(
    route('api.availability.resync'),
    brand ? { brand } : {},
  );

  return data.data;
}
