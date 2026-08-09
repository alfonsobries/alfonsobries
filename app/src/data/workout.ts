import {
  ArrowFatLinesUp,
  Barbell,
  PersonSimpleTaiChi,
  Timer,
  type Icon,
} from 'phosphor-react-native';

import { type WorkoutExercise } from '@/api/workout';

/** How each exercise of the routine is named and drawn; the numbers come from the API. */
export const EXERCISE_LABELS: Record<WorkoutExercise, { label: string; Icon: Icon }> = {
  pull_ups: { label: 'Pull-ups', Icon: ArrowFatLinesUp },
  push_ups: { label: 'Push-ups', Icon: Barbell },
  air_squats: { label: 'Air squats', Icon: PersonSimpleTaiChi },
  deep_squat: { label: 'Deep squat', Icon: Timer },
};

/** One set, said the way it is done: "10 reps" or "1 min". */
export function setLabel(target: number, unit: 'reps' | 'seconds'): string {
  if (unit === 'reps') {
    return `${target} reps`;
  }

  return target >= 60 ? `${Math.round(target / 60)} min` : `${target} s`;
}
