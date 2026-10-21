import { Headset, type Icon, MoonStars, Robot } from 'phosphor-react-native';

import type { AvailabilityMode } from '@/api/support-availability';
import type { ThemeColorName } from '@/constants/colors.gen';

type ModeAppearance = {
  icon: Icon;
  /** Token for the glyph (a native prop, so it resolves through `useThemeColor`). */
  tint: ThemeColorName;
  /** Fill behind the glyph. */
  badge: string;
  /** Text color for the mode's name. */
  text: string;
};

export const MODE_APPEARANCE: Record<AvailabilityMode, ModeAppearance> = {
  online: { icon: Headset, tint: 'success', badge: 'bg-success/15', text: 'text-success' },
  bot: {
    icon: Robot,
    tint: 'primary-emphasis',
    badge: 'bg-primary/40',
    text: 'text-primary-emphasis',
  },
  offline: { icon: MoonStars, tint: 'muted', badge: 'bg-surface-selected', text: 'text-muted' },
};
