import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/api/auth';

const REMINDER_ID = 'virtue-noon';

/**
 * A local daily reminder at noon for the virtue practice, plus the routing
 * when its notification is tapped. Only Alfonso's device schedules it; the
 * reminder is re-asserted on every launch so edits to the copy or time ship
 * without any cleanup step.
 */
export function useVirtueReminder(): void {
  const { status, user } = useAuth();
  const isOwner = status === 'authenticated' && user?.family_member === 'alfonso';

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    void (async () => {
      try {
        await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);

        if (!isOwner) {
          return;
        }

        const { status: existing } = await Notifications.getPermissionsAsync();
        let permission = existing;

        if (existing !== 'granted') {
          const requested = await Notifications.requestPermissionsAsync();
          permission = requested.status;
        }

        if (permission !== 'granted') {
          return;
        }

        await Notifications.scheduleNotificationAsync({
          identifier: REMINDER_ID,
          content: {
            title: 'Auxilium',
            body: 'Las oraciones del día te esperan.',
            data: { url: '/virtue/prayers' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 12,
            minute: 0,
          },
        });
      } catch {
        // Scheduling can retry on the next launch.
      }
    })();
  }, [status, isOwner]);

  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!isOwner || !response) {
      return;
    }

    const url = response.notification.request.content.data?.url;

    if (typeof url === 'string' && url.startsWith('/')) {
      router.push(url as Href);
    }
  }, [response, isOwner]);
}
