import { Text, View } from 'react-native';

import type { SupportAvailability } from '@/api/support-availability';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  effectiveStatus,
  MODE_DESCRIPTION,
  MODE_LABEL,
  reasonLabel,
  statusDetail,
} from '@/lib/availability';

import { MODE_APPEARANCE } from './mode-appearance';

type AvailabilityStatusCardProperties = {
  availability: SupportAvailability;
  /** Present while a manual override is active: hands control back to the schedule. */
  onClearOverride?: () => void;
  disabled?: boolean;
};

/** The big "what the chats do right now" block at the top of the screen. */
export function AvailabilityStatusCard({
  availability,
  onClearOverride,
  disabled = false,
}: AvailabilityStatusCardProperties) {
  const status = effectiveStatus(availability);
  const appearance = MODE_APPEARANCE[status.mode];
  const glyphColor = useThemeColor(appearance.tint);
  const Glyph = appearance.icon;
  const override = availability.rules.override;
  const detail = statusDetail(status, override !== null && override.until === null);

  return (
    <View
      className="gap-4 rounded-3xl bg-surface p-5"
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`Ahora: ${MODE_LABEL[status.mode]}. ${detail}. ${reasonLabel(availability, status.reason)}.`}
    >
      <View className="flex-row items-center gap-4">
        <View className={`size-16 items-center justify-center rounded-3xl ${appearance.badge}`}>
          <Glyph size={34} color={glyphColor} weight="fill" />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-xs font-medium uppercase tracking-wide text-muted">Ahora</Text>
          <Text className={`text-3xl font-semibold ${appearance.text}`}>
            {MODE_LABEL[status.mode]}
          </Text>
        </View>
      </View>

      <View className="gap-1">
        <Text className="text-base font-medium text-foreground">{detail}</Text>
        <Text className="text-sm text-muted">
          {reasonLabel(availability, status.reason)} · {MODE_DESCRIPTION[status.mode]}
        </Text>
      </View>

      {onClearOverride && status.reason === 'override' ? (
        <Button variant="secondary" size="sm" disabled={disabled} onPress={onClearOverride}>
          Volver a mi horario
        </Button>
      ) : null}
    </View>
  );
}
