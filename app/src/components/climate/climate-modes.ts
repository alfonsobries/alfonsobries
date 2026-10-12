import { ArrowsClockwise, Drop, Fan, type Icon, Snowflake, Sun } from 'phosphor-react-native';

import type { ClimateMode, FanSpeed, Swing } from '@/api/climate';

type ModeStyle = {
  label: string;
  activity: string;
  icon: Icon;
  /** A deliberate per-mode hue, the same in light and dark; the icon on it is white. */
  tint: string;
};

export const MODES: Record<ClimateMode, ModeStyle> = {
  cool: { label: 'Frío', activity: 'Enfriando', icon: Snowflake, tint: '#3B82F6' },
  heat: { label: 'Calor', activity: 'Calentando', icon: Sun, tint: '#F97316' },
  dry: { label: 'Seco', activity: 'Deshumidificando', icon: Drop, tint: '#14B8A6' },
  fan: { label: 'Ventilador', activity: 'Solo ventilador', icon: Fan, tint: '#22C55E' },
  auto: { label: 'Auto', activity: 'Automático', icon: ArrowsClockwise, tint: '#8B5CF6' },
};

export const MODE_ORDER: ClimateMode[] = ['cool', 'heat', 'auto', 'dry', 'fan'];

export const FAN_LABELS: Record<FanSpeed, string> = {
  silent: 'Silencioso',
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  max: 'Máximo',
  auto: 'Auto',
};

export const SWING_LABELS: Record<Swing, string> = {
  off: 'Fija',
  vertical: 'Vertical',
  horizontal: 'Horizontal',
  both: 'Ambas',
};

export function formatTemperature(value: number | null): string {
  if (value === null) {
    return '-';
  }

  return `${Number.isInteger(value) ? value : value.toFixed(1)}°`;
}
