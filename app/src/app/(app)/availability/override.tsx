import { DatePicker, Host } from '@expo/ui/swift-ui';
import { environment } from '@expo/ui/swift-ui/modifiers';
import { router, useLocalSearchParams } from 'expo-router';
import { CaretRight } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useApiRouter } from '@/api/router';
import {
  type AvailabilityMode,
  type OverrideChange,
  setOverride,
  type SupportAvailability,
} from '@/api/support-availability';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { useSupportAvailability } from '@/hooks/use-support-availability';
import { useNow } from '@/hooks/use-now';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  effectiveStatus,
  formatMoment,
  MODE_ACTION,
  MODE_DESCRIPTION,
  scheduleOffsetMinutes,
  toOffsetIso,
  tomorrowMorning,
} from '@/lib/availability';
import { useIsOnline } from '@/offline/connectivity';

const MODES: AvailabilityMode[] = ['online', 'bot', 'offline'];

type Duration = { key: string; label: string; detail?: string; change: OverrideChange };

function optimisticOverride(
  current: SupportAvailability,
  mode: AvailabilityMode,
  until: string | null,
): SupportAvailability {
  const previous = effectiveStatus(current).mode;

  return {
    ...current,
    rules: { ...current.rules, override: { mode, until } },
    status: {
      mode,
      reason: 'override',
      next_transition: until && previous !== mode ? { at: until, mode: previous } : null,
    },
  };
}

/** The `until` the API will set for a preset, to paint the change before it answers. */
function presetUntil(
  data: SupportAvailability | null,
  change: OverrideChange,
  tomorrow: string | null,
): string | null {
  if (!data) {
    return null;
  }

  if ('hours' in change) {
    return toOffsetIso(
      new Date(Date.now() + change.hours * 3_600_000),
      scheduleOffsetMinutes(data),
    );
  }

  return 'tomorrow' in change ? tomorrow : null;
}

/** How long a quick mode lasts: a few presets, or an exact time. */
export default function AvailabilityOverrideSheet() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode: AvailabilityMode = MODES.includes(params.mode as AvailabilityMode)
    ? (params.mode as AvailabilityMode)
    : 'online';
  const route = useApiRouter();
  const { data, mutate } = useSupportAvailability();
  const isOnline = useIsOnline();
  const muted = useThemeColor('muted');
  const now = useNow(15_000);
  const [pickingTime, setPickingTime] = useState(false);
  const [until, setUntil] = useState(() => new Date(Date.now() + 2 * 60 * 60 * 1000));

  const tomorrow = data ? tomorrowMorning(data) : null;
  const durations: Duration[] = [
    { key: '1h', label: '1 hora', change: { mode, hours: 1 } },
    { key: '3h', label: '3 horas', change: { mode, hours: 3 } },
    {
      key: 'tomorrow',
      label: 'Hasta mañana',
      detail: tomorrow ? `Vuelve a tu horario ${formatMoment(tomorrow)}` : undefined,
      change: { mode, tomorrow: true },
    },
    { key: 'forever', label: 'Hasta que lo quite', change: { mode } },
  ];

  const apply = (change: OverrideChange, optimisticUntil: string | null): void => {
    router.back();
    void mutate(
      () => setOverride(route, change),
      'No se pudo cambiar tu disponibilidad',
      (current) => optimisticOverride(current, mode, optimisticUntil),
    );
  };

  const handleExactTime = (): void => {
    if (!data) {
      return;
    }

    apply({ mode, until: until.toISOString() }, toOffsetIso(until, scheduleOffsetMinutes(data)));
  };

  return (
    <Sheet title={MODE_ACTION[mode]} subtitle={MODE_DESCRIPTION[mode]} scrollable>
      {!isOnline ? (
        <Text className="mb-4 text-center text-sm text-danger">
          Estás sin conexión. Conéctate para que los chats se enteren del cambio.
        </Text>
      ) : null}

      <View className="overflow-hidden rounded-2xl bg-surface">
        {durations.map((duration, index) => (
          <View key={duration.key}>
            {index > 0 ? <View className="ml-4 h-px bg-border" /> : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${MODE_ACTION[mode]}: ${duration.label}`}
              accessibilityState={{ disabled: !isOnline }}
              disabled={!isOnline}
              onPress={() => apply(duration.change, presetUntil(data, duration.change, tomorrow))}
              className={`min-h-14 flex-row items-center gap-3 px-4 py-3 ${isOnline ? 'active:bg-surface-selected' : 'opacity-50'}`}
            >
              <View className="flex-1 gap-0.5">
                <Text className="text-base font-medium text-foreground">{duration.label}</Text>
                {duration.detail ? (
                  <Text className="text-sm text-muted">{duration.detail}</Text>
                ) : null}
              </View>
              <CaretRight size={14} color={muted} weight="bold" />
            </Pressable>
          </View>
        ))}
        <View className="ml-4 h-px bg-border" />
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: pickingTime, disabled: !isOnline }}
          disabled={!isOnline}
          onPress={() => setPickingTime((open) => !open)}
          className={`min-h-14 flex-row items-center gap-3 px-4 py-3 ${isOnline ? 'active:bg-surface-selected' : 'opacity-50'}`}
        >
          <Text className="flex-1 text-base font-medium text-foreground">
            Hasta una hora exacta
          </Text>
          <CaretRight size={14} color={muted} weight="bold" />
        </Pressable>
      </View>

      {pickingTime ? (
        <View className="mt-4 gap-4 rounded-2xl bg-surface p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-foreground">Hasta</Text>
            <Host matchContents>
              <DatePicker
                selection={until}
                displayedComponents={['date', 'hourAndMinute']}
                range={{ start: new Date() }}
                onDateChange={setUntil}
                modifiers={[
                  environment('locale', 'es_ES'),
                  ...(data ? [environment('timeZone', data.rules.timezone)] : []),
                ]}
              />
            </Host>
          </View>
          <Button disabled={!isOnline || until.getTime() <= now} onPress={handleExactTime}>
            Listo
          </Button>
        </View>
      ) : null}
    </Sheet>
  );
}
