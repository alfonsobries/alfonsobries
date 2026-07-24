import {
  queryStatisticsForQuantity,
  requestAuthorization,
} from '@kingstinct/react-native-healthkit';
import { useCallback } from 'react';
import { Platform } from 'react-native';

/**
 * Reads today's Apple exercise-ring minutes. Returns null when Health is
 * unavailable or the user hasn't granted access — the manual toggle always
 * remains.
 */
export function useHealthExercise(): () => Promise<number | null> {
  return useCallback(async () => {
    if (Platform.OS !== 'ios') {
      return null;
    }

    try {
      const granted = await requestAuthorization({
        toRead: ['HKQuantityTypeIdentifierAppleExerciseTime'],
      });

      if (!granted) {
        return null;
      }

      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const stats = await queryStatisticsForQuantity(
        'HKQuantityTypeIdentifierAppleExerciseTime',
        ['cumulativeSum'],
        { filter: { date: { startDate: start, endDate: new Date() } }, unit: 'min' },
      );

      const minutes = stats.sumQuantity?.quantity;

      return typeof minutes === 'number' ? Math.floor(minutes) : null;
    } catch {
      return null;
    }
  }, []);
}
