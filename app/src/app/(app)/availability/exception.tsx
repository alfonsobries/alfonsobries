import { DatePicker, Host } from '@expo/ui/swift-ui';
import { environment } from '@expo/ui/swift-ui/modifiers';
import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { Trash } from 'phosphor-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/api/auth';
import { useApiRouter } from '@/api/router';
import { type AvailabilityMode, deleteException, saveException } from '@/api/support-availability';
import { Card } from '@/components/ui/Card';
import { type DateRange, DateRangeCalendar } from '@/components/ui/DateRangeCalendar';
import { Input } from '@/components/ui/Input';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Switch';
import { useSupportAvailability } from '@/hooks/use-support-availability';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  addDaysToIsoDate,
  dateToTime,
  formatDay,
  localIsoDate,
  minutesOf,
  MODE_DESCRIPTION,
  timeToDate,
  wallClock,
} from '@/lib/availability';
import { useIsOnline } from '@/offline/connectivity';

const SPANISH_WEEKDAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

type Draft = {
  label: string;
  mode: AvailabilityMode;
  range: DateRange;
  allDay: boolean;
  startTime: string;
  endTime: string;
};

const EMPTY_DRAFT: Draft = {
  label: '',
  mode: 'offline',
  range: { start: null, end: null },
  allDay: true,
  startTime: '09:00',
  endTime: '18:00',
};

/** Rebuilds the editor's fields from a saved exception's wall-clock times. */
function draftFrom(
  startsAt: string,
  endsAt: string,
  label: string | null,
  mode: AvailabilityMode,
): Draft {
  const start = wallClock(startsAt);
  const end = wallClock(endsAt);
  const allDay = start.time === '00:00' && end.time === '00:00';

  return {
    label: label ?? '',
    mode,
    range: { start: start.date, end: allDay ? addDaysToIsoDate(end.date, -1) : end.date },
    allDay,
    startTime: allDay ? '09:00' : start.time,
    endTime: allDay ? '18:00' : end.time,
  };
}

/** A vacation, day off or event: a span of days (or hours) with its own mode. */
export default function AvailabilityExceptionScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id?: string }>();
  const route = useApiRouter();
  const { data, mutate } = useSupportAvailability();
  const isOnline = useIsOnline();
  const muted = useThemeColor('muted');
  const danger = useThemeColor('danger');

  const id = params.id ? Number(params.id) : undefined;
  const existing = id ? data?.rules.exceptions.find((exception) => exception.id === id) : undefined;

  const [draft, setDraft] = useState<Draft>(() =>
    existing
      ? draftFrom(existing.starts_at, existing.ends_at, existing.label, existing.mode)
      : EMPTY_DRAFT,
  );
  const [saving, setSaving] = useState(false);

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  const firstDay = draft.range.start;
  const lastDay = draft.range.end ?? draft.range.start;
  const sameDay = firstDay !== null && firstDay === lastDay;
  const timesValid =
    draft.allDay || !sameDay || minutesOf(draft.startTime) < minutesOf(draft.endTime);
  const canSave = firstDay !== null && timesValid && isOnline && !saving;

  const update = (change: Partial<Draft>): void =>
    setDraft((current) => ({ ...current, ...change }));

  const handleSave = async (): Promise<void> => {
    if (!firstDay || !lastDay) {
      return;
    }

    const startsAt = draft.allDay ? `${firstDay}T00:00` : `${firstDay}T${draft.startTime}`;
    const endsAt = draft.allDay
      ? `${addDaysToIsoDate(lastDay, 1)}T00:00`
      : draft.endTime === '24:00'
        ? `${addDaysToIsoDate(lastDay, 1)}T00:00`
        : `${lastDay}T${draft.endTime}`;

    setSaving(true);
    const saved = await mutate(
      () =>
        saveException(
          route,
          {
            starts_at: startsAt,
            ends_at: endsAt,
            mode: draft.mode,
            label: draft.label.trim() || null,
          },
          id,
        ),
      'No se pudo guardar',
    );
    setSaving(false);

    if (saved) {
      router.back();
    }
  };

  const handleDelete = (): void => {
    if (!id) {
      return;
    }

    Alert.alert('¿Quitar esta excepción?', 'Los chats vuelven a seguir tu horario semanal.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: () => {
          router.back();
          void mutate(
            () => deleteException(route, id),
            'No se pudo quitar',
            (current) => ({
              ...current,
              rules: {
                ...current.rules,
                exceptions: current.rules.exceptions.filter((exception) => exception.id !== id),
              },
            }),
          );
        },
      },
    ]);
  };

  const summary = firstDay
    ? sameDay
      ? `El ${formatDay(firstDay)}`
      : `Del ${formatDay(firstDay)} al ${formatDay(lastDay ?? firstDay)}`
    : 'Toca el primer día y luego el último.';

  return (
    <>
      <Stack.Screen
        options={{
          title: existing ? 'Excepción' : 'Nueva excepción',
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
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        {!isOnline ? (
          <Text className="text-center text-sm text-danger">
            Estás sin conexión. Conéctate para guardar.
          </Text>
        ) : null}

        <Input
          label="Nombre"
          placeholder="Vacaciones"
          value={draft.label}
          onChangeText={(label) => update({ label })}
          maxLength={60}
          returnKeyType="done"
        />

        <View className="gap-1.5">
          <Text className="px-4 text-sm font-medium text-foreground">Los chats estarán</Text>
          <SegmentedControl<AvailabilityMode>
            value={draft.mode}
            onChange={(mode) => update({ mode })}
            options={[
              { value: 'online', label: 'En línea' },
              { value: 'bot', label: 'Bot' },
              { value: 'offline', label: 'Desconectado' },
            ]}
          />
          <Text className="px-4 text-xs text-muted">{MODE_DESCRIPTION[draft.mode]}</Text>
        </View>

        <View className="gap-1.5">
          <Text className="px-4 text-sm font-medium text-foreground">Fechas</Text>
          <Card>
            <DateRangeCalendar
              value={draft.range}
              onChange={(range) => update({ range })}
              minDate={localIsoDate(new Date())}
              locale="es-MX"
              weekdayLabels={SPANISH_WEEKDAYS}
            />
          </Card>
          <Text className="px-4 text-sm text-muted" accessibilityLiveRegion="polite">
            {summary}
          </Text>
        </View>

        <View className="gap-3 rounded-2xl bg-surface px-4 py-3">
          <View className="min-h-11 flex-row items-center justify-between">
            <Text className="text-base text-foreground">Todo el día</Text>
            <Switch
              value={draft.allDay}
              onValueChange={(allDay) => update({ allDay })}
              accessibilityLabel="Todo el día"
            />
          </View>
          {draft.allDay ? null : (
            <>
              <View className="h-px bg-border" />
              <TimeRow
                label={sameDay ? 'Desde' : 'Empieza el primer día a las'}
                value={draft.startTime}
                onChange={(startTime) => update({ startTime })}
                isEnd={false}
              />
              <TimeRow
                label={sameDay ? 'Hasta' : 'Termina el último día a las'}
                value={draft.endTime}
                onChange={(endTime) => update({ endTime })}
                isEnd
              />
              {!timesValid ? (
                <Text className="text-xs text-danger">
                  La hora final debe ser después de la inicial.
                </Text>
              ) : null}
            </>
          )}
        </View>

        {existing ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !isOnline }}
            disabled={!isOnline}
            onPress={handleDelete}
            className={`h-12 flex-row items-center justify-center gap-2 rounded-full border border-border ${isOnline ? 'active:bg-surface-selected' : 'opacity-50'}`}
          >
            <Trash size={18} color={danger} />
            <Text className="text-base font-medium text-danger">Quitar excepción</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </>
  );
}

function TimeRow({
  label,
  value,
  onChange,
  isEnd,
}: {
  label: string;
  value: string;
  onChange: (time: string) => void;
  isEnd: boolean;
}) {
  return (
    <View
      className="min-h-11 flex-row items-center justify-between gap-3"
      accessibilityLabel={label}
    >
      <Text className="flex-1 text-base text-foreground">{label}</Text>
      <Host matchContents>
        <DatePicker
          selection={timeToDate(value)}
          displayedComponents={['hourAndMinute']}
          onDateChange={(date) => onChange(dateToTime(date, isEnd))}
          modifiers={[environment('locale', 'es_ES')]}
        />
      </Host>
    </View>
  );
}
