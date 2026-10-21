import { Redirect, router, Stack } from 'expo-router';
import { Copy, Globe, Lightning } from 'phosphor-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/api/auth';
import { useApiRouter } from '@/api/router';
import { type OutsideHoursMode, updateSchedule } from '@/api/support-availability';
import { DayScheduleRow } from '@/components/availability/DayScheduleRow';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useSupportAvailability } from '@/hooks/use-support-availability';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  type DaySchedule,
  deviceTimezone,
  MODE_DESCRIPTION,
  rangeIsValid,
  toDaySchedules,
  toWeekly,
} from '@/lib/availability';
import { useIsOnline } from '@/offline/connectivity';

const WEEKDAY_NUMBERS = [1, 2, 3, 4, 5];

function presetWeekdays(from: string, to: string): DaySchedule[] {
  return toDaySchedules([]).map((day) => ({
    ...day,
    ranges: WEEKDAY_NUMBERS.includes(day.day) ? [{ from, to }] : [],
  }));
}

/**
 * The weekly schedule editor. Changes stay local until "Guardar", which
 * sends the whole week at once: a half-edited week never reaches the chats.
 */
export default function AvailabilityScheduleScreen() {
  const { user } = useAuth();
  const route = useApiRouter();
  const { data, mutate } = useSupportAvailability();
  const isOnline = useIsOnline();
  const tint = useThemeColor('primary-emphasis');
  const muted = useThemeColor('muted');

  const [days, setDays] = useState<DaySchedule[]>(() => toDaySchedules(data?.rules.weekly ?? []));
  const [outsideMode, setOutsideMode] = useState<OutsideHoursMode>(
    data?.rules.outside_hours_mode ?? 'bot',
  );
  const [timezone, setTimezone] = useState(data?.rules.timezone ?? 'America/Mexico_City');
  const [saving, setSaving] = useState(false);

  const phoneTimezone = useMemo(() => deviceTimezone(), []);
  const weekly = toWeekly(days);
  const valid = days.every((day) => day.ranges.every(rangeIsValid));
  const changed =
    !data ||
    !data.shared ||
    JSON.stringify(toDaySchedules(data.rules.weekly)) !== JSON.stringify(toDaySchedules(weekly)) ||
    outsideMode !== data.rules.outside_hours_mode ||
    timezone !== data.rules.timezone;
  const canSave = valid && changed && isOnline && !saving;

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    const saved = await mutate(
      () => updateSchedule(route, { timezone, weekly, outside_hours_mode: outsideMode }),
      'No se pudo guardar el horario',
    );
    setSaving(false);

    if (saved) {
      router.back();
    }
  };

  const copyMondayToWeekdays = (): void => {
    const monday = days[0].ranges;
    setDays((current) =>
      current.map((day) =>
        WEEKDAY_NUMBERS.includes(day.day) ? { ...day, ranges: [...monday] } : day,
      ),
    );
  };

  const presets: { label: string; icon: typeof Copy; onPress: () => void; disabled?: boolean }[] = [
    {
      label: 'L-V 9 a 18',
      icon: Lightning,
      onPress: () => setDays(presetWeekdays('09:00', '18:00')),
    },
    {
      label: 'Copiar lunes a L-V',
      icon: Copy,
      onPress: copyMondayToWeekdays,
      disabled: days[0].ranges.length === 0,
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Horario',
          headerLeft: () => (
            <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.back()}>
              <Text className="text-[17px] text-foreground">Cancelar</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSave }}
              disabled={!canSave}
              hitSlop={8}
              onPress={() => void handleSave()}
            >
              {saving ? (
                <ActivityIndicator color={muted} />
              ) : (
                <Text
                  className={`text-[17px] font-semibold ${canSave ? 'text-primary-emphasis' : 'text-muted'}`}
                >
                  Guardar
                </Text>
              )}
            </Pressable>
          ),
        }}
      />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-6 px-4 pb-16 pt-4"
        contentInsetAdjustmentBehavior="automatic"
      >
        {!isOnline ? (
          <Text className="text-center text-sm text-danger">
            Estás sin conexión. Puedes preparar el horario y guardarlo al reconectar.
          </Text>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          {presets.map((preset) => (
            <Pressable
              key={preset.label}
              accessibilityRole="button"
              accessibilityState={{ disabled: preset.disabled }}
              disabled={preset.disabled}
              onPress={preset.onPress}
              className={`h-11 flex-row items-center gap-2 rounded-full bg-surface px-4 ${preset.disabled ? 'opacity-50' : 'active:opacity-70'}`}
            >
              <preset.icon size={16} color={tint} weight="bold" />
              <Text className="text-sm font-medium text-foreground">{preset.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <SettingsSection title="Cuándo estás en línea">
          {days.map((day) => (
            <DayScheduleRow
              key={day.day}
              schedule={day}
              onChange={(next) =>
                setDays((current) =>
                  current.map((entry) => (entry.day === next.day ? next : entry)),
                )
              }
            />
          ))}
        </SettingsSection>

        <View className="gap-2">
          <Text className="px-4 text-xs font-medium uppercase tracking-wide text-muted">
            Fuera de horario
          </Text>
          <SegmentedControl<OutsideHoursMode>
            value={outsideMode}
            onChange={setOutsideMode}
            options={[
              { value: 'bot', label: 'Bot' },
              { value: 'offline', label: 'Desconectado' },
            ]}
          />
          <Text className="px-4 text-xs text-muted">{MODE_DESCRIPTION[outsideMode]}</Text>
        </View>

        <SettingsSection
          title="Zona horaria"
          footer="Los horarios se leen en esta zona, aunque viajes."
        >
          <View className="min-h-12 flex-row items-center gap-3 px-4 py-3">
            <Globe size={22} color={tint} />
            <Text className="flex-1 text-base text-foreground">{timezone.replace(/_/g, ' ')}</Text>
          </View>
          {phoneTimezone && phoneTimezone !== timezone ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setTimezone(phoneTimezone)}
              className="min-h-12 justify-center px-4 py-3 active:bg-surface-selected"
            >
              <Text className="text-base font-medium text-primary-emphasis">
                Usar la de este teléfono ({phoneTimezone.replace(/_/g, ' ')})
              </Text>
            </Pressable>
          ) : null}
        </SettingsSection>
      </ScrollView>
    </>
  );
}
