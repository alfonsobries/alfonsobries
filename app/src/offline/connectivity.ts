import { isAxiosError, type AxiosError } from 'axios';
import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { apiClient } from '@/api/client';
import { API_ORIGIN } from '@/constants/env';

// Connectivity is inferred from how requests actually resolve rather than from
// the radio state: a device can be on wi-fi (a plane's, a captive portal) and
// still not reach the API, and the only signal that matters is whether the API
// answers. Nothing here is a native module, so it ships over OTA.

const PROBE_URL = `${API_ORIGIN}/api/status`;
const PROBE_TIMEOUT = 5000;
const PROBE_BACKOFF = [3000, 6000, 12000, 30000];

let online = true;
let probeTimer: ReturnType<typeof setTimeout> | null = null;
let probeAttempt = 0;
let probing = false;

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function setOnline(next: boolean): void {
  if (online === next) {
    return;
  }

  online = next;

  if (online) {
    stopProbing();
  } else {
    scheduleProbe();
  }

  emit();
}

/**
 * True when a request failed because it never reached the API — no response, a
 * timeout, or a DNS/socket error. A 4xx/5xx means the API answered, so the
 * network is fine and the error belongs to the caller.
 */
export function isOfflineError(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return false;
  }

  const axiosError = error as AxiosError;

  if (axiosError.response || axiosError.code === 'ERR_CANCELED') {
    return false;
  }

  return axiosError.request !== undefined || axiosError.code === 'ERR_NETWORK';
}

export function getIsOnline(): boolean {
  return online;
}

export function subscribeToConnectivity(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/** Reactively reads whether the API is currently reachable. */
export function useIsOnline(): boolean {
  return useSyncExternalStore(subscribeToConnectivity, getIsOnline, getIsOnline);
}

async function probe(): Promise<boolean> {
  if (probing) {
    return online;
  }

  probing = true;

  try {
    await apiClient.get(PROBE_URL, { timeout: PROBE_TIMEOUT });
    setOnline(true);
    return true;
  } catch (error) {
    if (isOfflineError(error)) {
      setOnline(false);
      return false;
    }

    // The API answered with an error status, so it is reachable.
    setOnline(true);
    return true;
  } finally {
    probing = false;
  }
}

function stopProbing(): void {
  probeAttempt = 0;

  if (probeTimer) {
    clearTimeout(probeTimer);
    probeTimer = null;
  }
}

function scheduleProbe(): void {
  if (probeTimer) {
    return;
  }

  const delay = PROBE_BACKOFF[Math.min(probeAttempt, PROBE_BACKOFF.length - 1)];
  probeAttempt += 1;

  probeTimer = setTimeout(() => {
    probeTimer = null;

    void probe().then((reachable) => {
      if (!reachable) {
        scheduleProbe();
      }
    });
  }, delay);
}

/** Forces an immediate reachability check — used when the user asks to retry. */
export async function checkConnectivity(): Promise<boolean> {
  return probe();
}

let installed = false;

/**
 * Wires connectivity tracking into the shared axios instance. Safe to call more
 * than once; only the first call takes effect.
 */
export function installConnectivityTracking(): void {
  if (installed) {
    return;
  }

  installed = true;

  apiClient.interceptors.response.use(
    (response) => {
      setOnline(true);
      return response;
    },
    (error: unknown) => {
      if (isOfflineError(error)) {
        setOnline(false);
      } else {
        setOnline(true);
      }

      return Promise.reject(error);
    },
  );

  // Coming back to the foreground is the most likely moment for connectivity to
  // have changed (airplane mode off, back in range), so re-check right away.
  AppState.addEventListener('change', (state) => {
    if (state === 'active' && !online) {
      void probe();
    }
  });
}
