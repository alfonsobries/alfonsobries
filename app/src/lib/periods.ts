export type PeriodKind = 'week' | 'month' | 'year';

export type Period = {
  kind: PeriodKind;
  from: Date;
  /** Exclusive. */
  to: Date;
};

/** The period of a kind that contains `anchor`, in local time (weeks start Monday). */
export function periodContaining(kind: PeriodKind, anchor: Date): Period {
  const from = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());

  if (kind === 'week') {
    const offset = (from.getDay() + 6) % 7;
    from.setDate(from.getDate() - offset);
    const to = new Date(from);
    to.setDate(from.getDate() + 7);

    return { kind, from, to };
  }

  if (kind === 'month') {
    from.setDate(1);

    return { kind, from, to: new Date(from.getFullYear(), from.getMonth() + 1, 1) };
  }

  from.setMonth(0, 1);

  return { kind, from, to: new Date(from.getFullYear() + 1, 0, 1) };
}

export function shiftPeriod(period: Period, steps: number): Period {
  const anchor = new Date(period.from);

  if (period.kind === 'week') {
    anchor.setDate(anchor.getDate() + steps * 7);
  } else if (period.kind === 'month') {
    anchor.setMonth(anchor.getMonth() + steps);
  } else {
    anchor.setFullYear(anchor.getFullYear() + steps);
  }

  return periodContaining(period.kind, anchor);
}

export function isCurrentPeriod(period: Period, now: Date = new Date()): boolean {
  return now >= period.from && now < period.to;
}

const PREVIOUS_LABELS: Record<PeriodKind, string> = {
  week: 'la semana anterior',
  month: 'el mes anterior',
  year: 'el año anterior',
};

export function previousLabel(kind: PeriodKind): string {
  return PREVIOUS_LABELS[kind];
}
