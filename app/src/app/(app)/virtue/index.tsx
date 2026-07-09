import { Redirect, router, Stack, useFocusEffect } from 'expo-router';
import { Check, Flame, HandsPraying, Question, Target, X } from 'phosphor-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/api/auth';
import { authImageHeaders } from '@/api/client';
import { useApiRouter } from '@/api/router';
import {
  fetchVirtueSummary,
  localDate,
  setResolution,
  type Resolution,
  type VirtueDay,
  type VirtueStats,
} from '@/api/virtue';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Illustration } from '@/components/ui/Illustration';
import { MonthCalendar, type CalendarDayMark } from '@/components/ui/MonthCalendar';
import { useThemeColor } from '@/hooks/use-theme-color';

function currentDates() {
  const now = new Date();

  return {
    today: localDate(now),
    yesterday: localDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)),
    todayLabel: now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
  };
}

// The daily practice at a glance: the resolution streak, today's two habits
// (the prayers and the resolution), and one calendar that carries both.
export default function VirtueScreen() {
  const { user } = useAuth();
  const route = useApiRouter();
  const tint = useThemeColor('primary-emphasis');
  const onPrimary = useThemeColor('primary-foreground');

  const [days, setDays] = useState<Record<string, VirtueDay>>({});
  const [stats, setStats] = useState<VirtueStats | null>(null);
  const [month, setMonth] = useState(() => new Date());
  const [saving, setSaving] = useState(false);
  const [mascotFailed, setMascotFailed] = useState(false);

  const [dates, setDates] = useState(currentDates);
  const { today, yesterday, todayLabel } = dates;

  const load = useCallback(async () => {
    try {
      const summary = await fetchVirtueSummary(route);
      setDays(Object.fromEntries(summary.days.map((day) => [day.date, day])));
      setStats(summary.stats);
    } catch {
      // The retry is one focus away.
    }
  }, [route]);

  useFocusEffect(
    useCallback(() => {
      // The screen can sit mounted across midnight, so "today" refreshes on focus.
      setDates(currentDates());
      void load();
    }, [load]),
  );

  const marks = useMemo(() => {
    const result: Record<string, CalendarDayMark> = {};

    for (const day of Object.values(days)) {
      result[day.date] = {
        tone:
          day.resolution === 'kept'
            ? 'primary'
            : day.resolution === 'missed'
              ? 'danger'
              : undefined,
        dot: day.prayers_completed,
      };
    }

    return result;
  }, [days]);

  const firstTracked = useMemo(() => {
    const dates = Object.keys(days);
    return dates.length > 0 ? dates.reduce((a, b) => (a < b ? a : b)) : undefined;
  }, [days]);

  const yesterdayPending =
    firstTracked !== undefined && yesterday >= firstTracked && !days[yesterday]?.resolution;

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  async function mark(date: string, resolution: Resolution | null): Promise<void> {
    setSaving(true);

    try {
      const result = await setResolution(route, date, resolution);
      setDays((current) => ({ ...current, [result.day.date]: result.day }));
      setStats(result.stats);
    } catch {
      Alert.alert('Could not save', 'Please try again in a moment.');
    } finally {
      setSaving(false);
    }
  }

  function handlePressDay(date: string): void {
    if (date > today) {
      return;
    }

    const day = days[date];
    const label = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    Alert.alert(label, 'Mark the resolution for this day.', [
      { text: 'Kept', onPress: () => void mark(date, 'kept') },
      { text: 'Missed', style: 'destructive', onPress: () => void mark(date, 'missed') },
      ...(day?.resolution ? [{ text: 'Clear', onPress: () => void mark(date, null) }] : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  }

  const todayEntry = days[today];
  const streakSubline =
    stats === null
      ? ' '
      : stats.days_tracked === 0
        ? 'Mark your first day to begin'
        : stats.missed_count === 0
          ? `No misses in ${stats.days_tracked} ${stats.days_tracked === 1 ? 'day' : 'days'}`
          : `${stats.missed_count} ${stats.missed_count === 1 ? 'miss' : 'misses'} in ${stats.days_tracked} days`;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Guide"
              hitSlop={12}
              onPress={() => router.push('/virtue/guide')}
            >
              <Question size={24} color={tint} weight="regular" />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 p-4 pb-16"
      >
        <Card className="items-center gap-1 py-7">
          {stats && !mascotFailed ? (
            <View className="mb-2 size-44 overflow-hidden rounded-3xl">
              <Illustration
                source={{
                  uri: route('api.virtue.mascot', { set: 'wolf', stage: stats.stage }),
                  headers: authImageHeaders(),
                }}
                transition={200}
                onError={() => setMascotFailed(true)}
              />
            </View>
          ) : (
            <Flame size={30} color={tint} weight="fill" />
          )}
          <Text className="mt-1 text-6xl font-bold text-foreground">{stats?.streak ?? '·'}</Text>
          <Text className="text-base font-medium text-foreground">day streak</Text>
          <Text className="text-sm text-muted">{streakSubline}</Text>
          {stats ? (
            <View className="mt-3 w-full gap-1.5 px-2">
              <View className="h-1.5 w-full overflow-hidden rounded-full bg-surface-selected">
                <View
                  className="h-full rounded-full bg-primary-emphasis"
                  style={{
                    width: `${Math.min(100, Math.round((stats.points / Math.max(1, stats.next_stage_at)) * 100))}%`,
                  }}
                />
              </View>
              <Text className="text-center text-xs text-muted">
                Stage {stats.stage} of {stats.stage_count}
              </Text>
            </View>
          ) : null}
        </Card>

        <Card className="gap-4">
          <View className="gap-0.5">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted">Today</Text>
            <Text className="text-lg font-semibold text-foreground">{todayLabel}</Text>
          </View>

          <View className="flex-row items-center gap-3">
            <View className="size-11 items-center justify-center rounded-2xl bg-surface-selected">
              <HandsPraying size={22} color={tint} weight="fill" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">Daily prayers</Text>
              <Text className="text-sm text-muted">
                {todayEntry?.prayers_completed ? 'Completed today' : 'Not prayed yet'}
              </Text>
            </View>
            {todayEntry?.prayers_completed ? (
              <View className="size-9 items-center justify-center rounded-full bg-primary">
                <Check size={18} color={onPrimary} weight="bold" />
              </View>
            ) : (
              <Button size="sm" onPress={() => router.push('/virtue/prayers')}>
                Pray
              </Button>
            )}
          </View>

          <View className="h-px bg-border" />

          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <View className="size-11 items-center justify-center rounded-2xl bg-surface-selected">
                <Target size={22} color={tint} weight="fill" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Daily resolution</Text>
                <Text className="text-sm text-muted">
                  {todayEntry?.resolution === 'kept'
                    ? 'Kept — well done'
                    : todayEntry?.resolution === 'missed'
                      ? 'Missed — tomorrow is a new day'
                      : 'How did it go today?'}
                </Text>
              </View>
            </View>
            <ResolutionPicker
              value={todayEntry?.resolution ?? null}
              disabled={saving}
              onChange={(next) => void mark(today, next)}
            />
          </View>
        </Card>

        {yesterdayPending ? (
          <Card className="gap-3">
            <Text className="text-base font-semibold text-foreground">
              Yesterday is still unmarked
            </Text>
            <ResolutionPicker
              value={null}
              disabled={saving}
              onChange={(next) => void mark(yesterday, next)}
            />
          </Card>
        ) : null}

        <Card className="gap-3">
          <MonthCalendar
            month={month}
            onMonthChange={setMonth}
            marks={marks}
            maxDate={today}
            onPressDay={handlePressDay}
          />
          <View className="flex-row items-center justify-center gap-5 pt-1">
            <Legend swatch="bg-primary" label="Kept" />
            <Legend swatch="bg-danger/15" label="Missed" />
            <Legend swatch="bg-primary-emphasis" label="Prayers" small />
          </View>
        </Card>
      </ScrollView>
    </>
  );
}

function Legend({
  swatch,
  label,
  small = false,
}: {
  swatch: string;
  label: string;
  small?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className={`${small ? 'size-1.5' : 'size-3'} rounded-full ${swatch}`} />
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

function ResolutionPicker({
  value,
  disabled,
  onChange,
}: {
  value: Resolution | null;
  disabled: boolean;
  onChange: (next: Resolution | null) => void;
}) {
  const success = useThemeColor('success');
  const danger = useThemeColor('danger');
  const muted = useThemeColor('muted');

  return (
    <View className="flex-row gap-2">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'kept', disabled }}
        disabled={disabled}
        onPress={() => onChange(value === 'kept' ? null : 'kept')}
        className={`h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-full ${
          value === 'kept' ? 'bg-primary' : 'bg-surface-selected'
        } ${disabled ? 'opacity-50' : 'active:opacity-80'}`}
      >
        <Check size={16} color={value === 'kept' ? success : muted} weight="bold" />
        <Text
          className={`text-sm font-semibold ${value === 'kept' ? 'text-primary-foreground' : 'text-foreground'}`}
        >
          Kept
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'missed', disabled }}
        disabled={disabled}
        onPress={() => onChange(value === 'missed' ? null : 'missed')}
        className={`h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-full ${
          value === 'missed' ? 'bg-danger/15' : 'bg-surface-selected'
        } ${disabled ? 'opacity-50' : 'active:opacity-80'}`}
      >
        <X size={16} color={value === 'missed' ? danger : muted} weight="bold" />
        <Text
          className={`text-sm font-semibold ${value === 'missed' ? 'text-danger' : 'text-foreground'}`}
        >
          Missed
        </Text>
      </Pressable>
    </View>
  );
}
