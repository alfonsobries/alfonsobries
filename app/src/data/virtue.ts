import {
  Barbell,
  BookOpen,
  Brain,
  ForkKnife,
  HandsPraying,
  Target,
  type Icon,
} from 'phosphor-react-native';

import { type VirtueArea, type VirtueDay, type VirtueHabit } from '@/api/virtue';

export type AreaDefinition = {
  key: VirtueArea;
  label: string;
  Icon: Icon;
  /** The journey-art set that renders this area's progress (30 stages each). */
  set: 'lobo' | 'sabio' | 'arbol';
};

export const AREAS: AreaDefinition[] = [
  { key: 'body', label: 'Body', Icon: Barbell, set: 'lobo' },
  { key: 'mind', label: 'Mind', Icon: Brain, set: 'sabio' },
  { key: 'spirit', label: 'Spirit', Icon: HandsPraying, set: 'arbol' },
];

/** The panoramic banner backgrounds: one per journey phase of the overall stage (1-30). */
export const PAISAJE_STAGES = 5;

export function paisajeStage(overallStage: number): number {
  return Math.min(PAISAJE_STAGES, Math.max(1, Math.ceil(overallStage / 6)));
}

export type EntryHabitDefinition = {
  key: VirtueHabit;
  label: string;
  /** An anchor cue — tying the habit to a moment makes it far likelier to happen. */
  anchor: string;
  Icon: Icon;
};

export const ENTRY_HABITS: EntryHabitDefinition[] = [
  { key: 'exercise', label: 'Exercise', anchor: '20 minutes is enough', Icon: Barbell },
  { key: 'diet', label: 'Follow the diet', anchor: 'One meal at a time', Icon: ForkKnife },
  { key: 'reading', label: 'Read', anchor: 'A few pages count', Icon: BookOpen },
];

export type AreaHabitDefinition = {
  key: string;
  label: string;
  anchor: string;
  Icon: Icon;
  isDone: (day: VirtueDay) => boolean;
};

/** Every habit that feeds an area, uniform for display — including the two spirit modules with storage of their own. */
export const AREA_HABITS: Record<VirtueArea, AreaHabitDefinition[]> = {
  body: [
    { ...ENTRY_HABITS[0], isDone: (day) => day.habits.exercise },
    { ...ENTRY_HABITS[1], isDone: (day) => day.habits.diet },
  ],
  mind: [{ ...ENTRY_HABITS[2], isDone: (day) => day.habits.reading }],
  spirit: [
    {
      key: 'prayers',
      label: 'Daily prayers',
      anchor: 'The daily sequence',
      Icon: HandsPraying,
      isDone: (day) => day.prayers_completed,
    },
    {
      key: 'resolution',
      label: 'Daily resolution',
      anchor: 'One clear intention',
      Icon: Target,
      isDone: (day) => day.resolution === 'kept',
    },
  ],
};

/** Everything markable in a day — the denominator of the daily checklist. */
export const DAILY_GOAL_COUNT = 5;

export function completedToday(day: VirtueDay | undefined): number {
  if (!day) {
    return 0;
  }

  return [
    day.prayers_completed,
    day.habits.exercise,
    day.habits.diet,
    day.habits.reading,
    day.resolution === 'kept',
  ].filter(Boolean).length;
}
