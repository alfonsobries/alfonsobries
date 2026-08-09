import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/api/auth';

// watchOS forwards this notification to the paired watch, where the watch app
// reads the category to open the prayers on the wrist.
const PRAYERS_CATEGORY = 'auxilium-prayers';

type Reminder = {
  id: string;
  hour: number;
  minute: number;
  title: string;
  body: string;
  url: string;
  category?: string;
};

/**
 * The personal daily reminders, each anchored to the hour it is meant to be
 * acted on. They fire whether or not the day is already marked: a reminder
 * that has to check state first is a reminder that arrives late.
 */
const REMINDERS: Reminder[] = [
  {
    id: 'virtue-noon',
    hour: 12,
    minute: 0,
    title: 'Auxilium',
    body: 'Las oraciones del día te esperan.',
    url: '/virtue/prayers',
    category: PRAYERS_CATEGORY,
  },
  {
    id: 'exercises-evening',
    hour: 19,
    minute: 0,
    title: 'Ejercicios diarios',
    body: '30 dominadas, 90 lagartijas, 60 sentadillas y 5 min de sentadilla profunda.',
    url: '/exercises',
  },
];

/**
 * Schedules the daily reminders and routes the taps. Only Alfonso's device
 * schedules them; they are re-asserted on every launch so edits to the copy or
 * the time ship without any cleanup step.
 */
export function useDailyReminders(): void {
  const { status, user } = useAuth();
  const isOwner = status === 'authenticated' && user?.family_member === 'alfonso';

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    void (async () => {
      try {
        for (const reminder of REMINDERS) {
          await Notifications.cancelScheduledNotificationAsync(reminder.id);
        }

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

        for (const reminder of REMINDERS) {
          await Notifications.scheduleNotificationAsync({
            identifier: reminder.id,
            content: {
              title: reminder.title,
              body: reminder.body,
              categoryIdentifier: reminder.category,
              data: { url: reminder.url },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour: reminder.hour,
              minute: reminder.minute,
            },
          });
        }
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
