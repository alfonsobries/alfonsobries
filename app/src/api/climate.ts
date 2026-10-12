import * as SecureStore from 'expo-secure-store';
import { route as ziggyRoute, type Config } from 'ziggy-js';

import { API_ORIGIN } from '@/constants/env';

import { AUTH_TOKEN_KEY, AUTH_TOKEN_OPTIONS } from './auth';
import { apiClient } from './client';
import { type useApiRouter } from './router';
import { Ziggy } from './ziggy.gen';

type ApiRoute = ReturnType<typeof useApiRouter>;

export type ClimateMode = 'auto' | 'cool' | 'dry' | 'heat' | 'fan';
export type FanSpeed = 'silent' | 'low' | 'medium' | 'high' | 'max' | 'auto';
export type Swing = 'off' | 'vertical' | 'horizontal' | 'both';
export type Presence = 'home' | 'away';

export type ClimateState = {
  power: boolean;
  target_temperature: number;
  mode: ClimateMode;
  fan_speed: FanSpeed;
  swing: Swing;
  eco: boolean;
  turbo: boolean;
  sleep: boolean;
  indoor_temperature: number | null;
  outdoor_temperature: number | null;
};

export type ClimateCapabilities = {
  modes: ClimateMode[];
  fan_speeds: FanSpeed[];
  swings: Swing[];
  min_temperature: number;
  max_temperature: number;
  half_degrees: boolean;
  eco: boolean;
  turbo: boolean;
};

export type ClimateUnit = {
  id: string;
  name: string;
  online: boolean;
  state: ClimateState | null;
  capabilities: ClimateCapabilities;
};

export type HomeLocation = {
  latitude: number;
  longitude: number;
  radius: number;
};

export type ClimatePerson = {
  member: string;
  name: string;
  presence: Presence | null;
  changed_at: string | null;
};

export type ClimateAutomation = {
  enabled: boolean;
  home: HomeLocation | null;
  switched_off: string[];
  people: ClimatePerson[];
};

export type ClimateOverview = {
  configured: boolean;
  units: ClimateUnit[];
  automation: ClimateAutomation;
};

export type ClimateChange = Partial<
  Pick<
    ClimateState,
    'power' | 'target_temperature' | 'mode' | 'fan_speed' | 'swing' | 'eco' | 'turbo' | 'sleep'
  >
>;

export async function fetchClimate(route: ApiRoute): Promise<ClimateOverview> {
  const { data } = await apiClient.get<{ data: ClimateOverview }>(route('api.climate.index'));

  return data.data;
}

export async function fetchClimateAutomation(route: ApiRoute): Promise<ClimateAutomation> {
  const { data } = await apiClient.get<{ data: ClimateAutomation }>(
    route('api.climate.automation.show'),
  );

  return data.data;
}

export async function updateClimateUnit(
  route: ApiRoute,
  unitId: string,
  change: ClimateChange,
): Promise<ClimateUnit> {
  const { data } = await apiClient.patch<{ data: ClimateUnit }>(
    route('api.climate.units.update', { unit: unitId }),
    change,
  );

  return data.data;
}

export async function updateClimateAutomation(
  route: ApiRoute,
  change: { enabled?: boolean; home?: { latitude: number; longitude: number; radius?: number } },
): Promise<ClimateAutomation> {
  const { data } = await apiClient.patch<{ data: ClimateAutomation }>(
    route('api.climate.automation.update'),
    change,
  );

  return data.data;
}

/**
 * Reports whether this phone is home. Runs from the geofence task too, where
 * the app may have been woken in the background with no React tree, so it
 * resolves the route and reads the token on its own.
 */
export async function reportPresence(presence: Presence): Promise<ClimateAutomation | null> {
  const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY, AUTH_TOKEN_OPTIONS).catch(
    () => null,
  );

  if (!token) {
    return null;
  }

  const url = ziggyRoute('api.presence.store', undefined, true, {
    ...Ziggy,
    url: API_ORIGIN,
  } as Config);
  const { data } = await apiClient.post<{ data: ClimateAutomation }>(
    url,
    { state: presence },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return data.data;
}

/** Steps a target temperature the way the unit accepts it. */
export function stepTemperature(
  value: number,
  direction: 1 | -1,
  capabilities: ClimateCapabilities,
): number {
  const step = capabilities.half_degrees ? 0.5 : 1;
  const next = Math.round((value + direction * step) / step) * step;

  return Math.min(capabilities.max_temperature, Math.max(capabilities.min_temperature, next));
}
