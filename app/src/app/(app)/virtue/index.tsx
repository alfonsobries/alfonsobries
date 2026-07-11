import { Redirect, router, Stack, useFocusEffect } from 'expo-router';
import { CaretRight, Check, Flame, HandsPraying, Question, Sparkle } from 'phosphor-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/api/auth';
import { authImageHeaders } from '@/api/client';
import { useApiRouter } from '@/api/router';
import {
  fetchVirtueSummary,
  localDate,
  setHabit,
  setResolution,
  type Resolution,
  type VirtueDay,
  type VirtueHabit,
  type VirtueStats,
} from '@/api/virtue';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Illustration } from '@/components/ui/Illustration';
import { MonthCalendar, type CalendarDayMark } from '@/components/ui/MonthCalendar';
import { HabitToggleRow } from '@/components/virtue/HabitToggleRow';
import { ResolutionPicker } from '@/components/virtue/ResolutionPicker';
import { lastSevenDays } from '@/components/virtue/WeekStrip';
import { AREA_HABITS, AREAS, completedToday, DAILY_GOAL_COUNT, ENTRY_HABITS } from '@/data/virtue';
import { useThemeColor } from '@/hooks/use-theme-color';

function currentDates() {
  const now = new Date();

  return {
    today: localDate(now),
    yesterday: localDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)),
    todayLabel: now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
  };
}

// The daily practice at a glance: the layered scene (one element per area),
// the per-area progress, today's habit checklist, and one calendar that
// carries the whole month. Every day — today or past — edits through the
// same day sheet.
export default function VirtueScreen() {
  const { user } = useAuth();
  const route = useApiRouter();
  const tint = useThemeColor('primary-emphasis');
  const onPrimary = useThemeColor('primary-foreground');
  const muted = useThemeColor('muted');

  const [days, setDays] = useState<Record<string, VirtueDay>>({});
  const [stats, setStats] = useState<VirtueStats | null>(null);
  const [month, setMonth] = useState(() => new Date());
  const [saving, setSaving] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);

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
        dots: [
          day.prayers_completed,
          day.habits.exercise,
          day.habits.diet,
          day.habits.reading,
        ].filter(Boolean).length,
      };
    }

    return result;
  }, [days]);

  const week = useMemo(() => lastSevenDays(), []);

  const weekCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const { key } of AREAS) {
      counts[key] = week.filter((date) => {
        const day = days[date];
        return day !== undefined && AREA_HABITS[key].some((habit) => habit.isDone(day));
      }).length;
    }

    return counts;
  }, [days, week]);

  const firstTracked = useMemo(() => {
    const dates = Object.keys(days);
    return dates.length > 0 ? dates.reduce((a, b) => (a < b ? a : b)) : undefined;
  }, [days]);

  const yesterdayEntry = days[yesterday];
  const yesterdayPending =
    firstTracked !== undefined && yesterday >= firstTracked && !yesterdayEntry?.resolution;
  const yesterdayMissed = yesterdayEntry?.resolution === 'missed';

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  function apply(result: { day: VirtueDay; stats: VirtueStats }): void {
    setDays((current) => ({ ...current, [result.day.date]: result.day }));
    setStats(result.stats);
  }

  async function mark(date: string, resolution: Resolution | null): Promise<void> {
    setSaving(true);

    try {
      apply(await setResolution(route, date, resolution));
    } catch {
      Alert.alert('Could not save', 'Please try again in a moment.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleHabit(habit: VirtueHabit): Promise<void> {
    const completed = !days[today]?.habits[habit];
    setSaving(true);

    try {
      apply(await setHabit(route, today, habit, completed));
    } catch {
      Alert.alert('Could not save', 'Please try again in a moment.');
    } finally {
      setSaving(false);
    }
  }

  function openDay(date: string): void {
    if (date > today) {
      return;
    }

    router.push({ pathname: '/virtue/day', params: { date } });
  }

  const todayEntry = days[today];
  const doneCount = completedToday(todayEntry);
  const allDone = doneCount === DAILY_GOAL_COUNT;
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
        <Card className="items-center gap-1 py-6">
          {stats && !sceneFailed ? (
            <Scene stats={stats} onError={() => setSceneFailed(true)} />
          ) : (
            <Flame size={30} color={tint} weight="fill" />
          )}
          <Text className="mt-2 text-6xl font-bold text-foreground">{stats?.streak ?? '·'}</Text>
          <Text className="text-base font-medium text-foreground">day streak</Text>
          <Text className="text-sm text-muted">{streakSubline}</Text>
        </Card>

        {stats ? (
          <Card className="gap-4">
            {AREAS.map(({ key, label, Icon }) => {
              const area = stats.areas[key];

              return (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  onPress={() => router.push({ pathname: '/virtue/[area]', params: { area: key } })}
                  className="gap-2 active:opacity-70"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="size-9 items-center justify-center rounded-xl bg-surface-selected">
                      <Icon size={18} color={tint} weight="fill" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">{label}</Text>
                      <Text className="text-xs text-muted">
                        {weekCounts[key]} of 7 days this week
                      </Text>
                    </View>
                    {area.streak > 0 ? (
                      <View className="flex-row items-center gap-1">
                        <Flame size={14} color={tint} weight="fill" />
                        <Text className="text-sm font-semibold text-foreground">{area.streak}</Text>
                      </View>
                    ) : null}
                    <Text className="text-xs text-muted">
                      Stage {area.stage}/{area.stage_count}
                    </Text>
                    <CaretRight size={14} color={muted} weight="bold" />
                  </View>
                  <View className="h-1.5 w-full overflow-hidden rounded-full bg-surface-selected">
                    <View
                      className="h-full rounded-full bg-primary-emphasis"
                      style={{
                        width: `${Math.min(100, Math.round((area.points / Math.max(1, area.next_stage_at)) * 100))}%`,
                      }}
                    />
                  </View>
                </Pressable>
              );
            })}
          </Card>
        ) : null}

        <Card className="gap-4">
          <View className="flex-row items-end justify-between">
            <View className="gap-0.5">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
                Today
              </Text>
              <Text className="text-lg font-semibold text-foreground">{todayLabel}</Text>
            </View>
            <Text className="text-sm font-semibold text-muted">
              {doneCount} of {DAILY_GOAL_COUNT}
            </Text>
          </View>

          {allDone ? (
            <View className="flex-row items-center gap-2 rounded-2xl bg-primary px-4 py-3">
              <Sparkle size={18} color={onPrimary} weight="fill" />
              <Text className="flex-1 text-sm font-semibold text-primary-foreground">
                All done — enjoy the rest of your day.
              </Text>
            </View>
          ) : null}

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

          {ENTRY_HABITS.map(({ key, label, anchor, Icon }) => (
            <HabitToggleRow
              key={key}
              Icon={Icon}
              label={label}
              subtitle={anchor}
              done={todayEntry?.habits[key] ?? false}
              disabled={saving}
              onToggle={() => void toggleHabit(key)}
            />
          ))}

          <View className="h-px bg-border" />

          <View className="gap-3">
            <View className="gap-0.5">
              <Text className="text-base font-semibold text-foreground">Daily resolution</Text>
              <Text className="text-sm text-muted">
                {todayEntry?.resolution === 'kept'
                  ? 'Kept — well done'
                  : todayEntry?.resolution === 'missed'
                    ? 'Missed — tomorrow is a new day'
                    : yesterdayMissed
                      ? 'Yesterday slipped; one miss never undoes progress. Today counts.'
                      : 'How did it go today?'}
              </Text>
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
            <View className="gap-0.5">
              <Text className="text-base font-semibold text-foreground">
                Yesterday is still unmarked
              </Text>
              <Text className="text-sm text-muted">
                Fill in the whole day, or just settle the resolution here.
              </Text>
            </View>
            <ResolutionPicker
              value={null}
              disabled={saving}
              onChange={(next) => void mark(yesterday, next)}
            />
            <Button variant="secondary" onPress={() => openDay(yesterday)}>
              Edit the whole day
            </Button>
          </Card>
        ) : null}

        <Card className="gap-3">
          <MonthCalendar
            month={month}
            onMonthChange={setMonth}
            marks={marks}
            maxDate={today}
            onPressDay={openDay}
          />
          <View className="flex-row items-center justify-center gap-5 pt-1">
            <Legend swatch="bg-primary" label="Kept" />
            <Legend swatch="bg-danger/15" label="Missed" />
            <Legend swatch="bg-primary-emphasis" label="Habits" small />
          </View>
          <Text className="text-center text-xs text-muted">Tap any day to fill it in.</Text>
        </Card>
      </ScrollView>
    </>
  );
}

// The hero scene stacks one layer per area over the shared plate: the wolf
// grows with the body, the tree with the spirit, and the knight stands in
// for the mind while its art is still a single stage. Every layer ships
// full-canvas from the API, so stacking needs no repositioning math — the
// offsets below only compose the temporary art pleasantly.
function Scene({ stats, onError }: { stats: VirtueStats; onError: () => void }) {
  const route = useApiRouter();
  const headers = authImageHeaders();
  const treeStage = Math.min(
    stats.tree_stage_count,
    Math.max(1, Math.ceil(stats.areas.spirit.stage / 2)),
  );

  const layers = [
    { uri: route('api.virtue.mascot', { set: 'tree', stage: treeStage }), place: styles.tree },
    { uri: route('api.virtue.mascot', { set: 'knight', stage: 1 }), place: styles.knight },
    {
      uri: route('api.virtue.mascot', { set: 'wolf', stage: stats.areas.body.stage }),
      place: styles.wolf,
    },
  ];

  return (
    <View className="w-full overflow-hidden rounded-3xl" style={{ aspectRatio: 4 / 3 }}>
      <Illustration
        source={{ uri: route('api.virtue.mascot', { set: 'plate', stage: 1 }), headers }}
        transition={200}
        onError={onError}
      />
      {layers.map((layer) => (
        <Illustration
          key={layer.uri}
          source={{ uri: layer.uri, headers }}
          contentFit="contain"
          transition={200}
          style={[{ position: 'absolute', backgroundColor: 'transparent' }, layer.place]}
        />
      ))}
    </View>
  );
}

const styles = {
  tree: { right: '-4%', bottom: '14%', width: '46%', height: '46%' },
  knight: { left: '42%', bottom: '12%', width: '24%', height: '24%' },
  wolf: { left: '-2%', bottom: '-4%', width: '54%', height: '54%' },
} as const;

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
