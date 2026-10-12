import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { type HomeLocation, type Presence, reportPresence } from '@/api/climate';

export const HOME_GEOFENCE_TASK = 'home-presence';

const HOME_REGION = 'home';

export type PresencePermission = 'always' | 'while-using' | 'denied' | 'undetermined';

type GeofenceEvent = {
  eventType: Location.GeofencingEventType;
};

// iOS relaunches the app in the background for a geofence crossing, before any
// React tree mounts, so the task has to be registered at module scope.
TaskManager.defineTask<GeofenceEvent>(HOME_GEOFENCE_TASK, async ({ data, error }) => {
  if (error || !data) {
    return;
  }

  const presence: Presence =
    data.eventType === Location.GeofencingEventType.Enter ? 'home' : 'away';

  await reportPresence(presence).catch(() => undefined);
});

export async function presencePermission(): Promise<PresencePermission> {
  const foreground = await Location.getForegroundPermissionsAsync();

  if (foreground.status === Location.PermissionStatus.UNDETERMINED) {
    return 'undetermined';
  }

  if (foreground.status !== Location.PermissionStatus.GRANTED) {
    return 'denied';
  }

  const background = await Location.getBackgroundPermissionsAsync();

  return background.status === Location.PermissionStatus.GRANTED ? 'always' : 'while-using';
}

/** Asks for "While Using" first and then "Always", the order iOS requires. */
export async function requestPresencePermission(): Promise<PresencePermission> {
  const foreground = await Location.requestForegroundPermissionsAsync();

  if (foreground.status !== Location.PermissionStatus.GRANTED) {
    return 'denied';
  }

  const background = await Location.requestBackgroundPermissionsAsync();

  return background.status === Location.PermissionStatus.GRANTED ? 'always' : 'while-using';
}

export async function currentCoordinates(): Promise<{ latitude: number; longitude: number }> {
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}

/**
 * Keeps this phone's geofence matching the shared home location, and reports
 * where the phone is right now so the API doesn't wait for the next crossing.
 */
export async function syncHomeGeofence(home: HomeLocation | null, enabled: boolean): Promise<void> {
  const running = await Location.hasStartedGeofencingAsync(HOME_GEOFENCE_TASK).catch(() => false);

  if (!home || !enabled) {
    if (running) {
      await Location.stopGeofencingAsync(HOME_GEOFENCE_TASK);
    }

    return;
  }

  if ((await presencePermission()) !== 'always') {
    return;
  }

  await Location.startGeofencingAsync(HOME_GEOFENCE_TASK, [
    {
      identifier: HOME_REGION,
      latitude: home.latitude,
      longitude: home.longitude,
      radius: home.radius,
      notifyOnEnter: true,
      notifyOnExit: true,
    },
  ]);

  const here = await currentCoordinates().catch(() => null);

  if (here) {
    await reportPresence(distanceInMeters(here, home) <= home.radius ? 'home' : 'away').catch(
      () => undefined,
    );
  }
}

export function distanceInMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const radians = (degrees: number): number => (degrees * Math.PI) / 180;
  const earthRadius = 6_371_000;
  const dLat = radians(b.latitude - a.latitude);
  const dLon = radians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(dLon / 2) ** 2;

  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}
