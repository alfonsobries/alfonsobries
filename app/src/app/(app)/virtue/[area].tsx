import { Redirect, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Flame } from 'phosphor-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { authImageHeaders } from '@/api/client';
import { useApiRouter } from '@/api/router';
import { fetchVirtueSummary, type VirtueDay, type VirtueStats } from '@/api/virtue';
import { Card } from '@/components/ui/Card';
import { Illustration } from '@/components/ui/Illustration';
import { WeekStrip, lastSevenDays } from '@/components/virtue/WeekStrip';
import { AREA_HABITS, AREAS } from '@/data/virtue';
import { useThemeColor } from '@/hooks/use-theme-color';

// One area in depth: its mascot, its score, and each of its habits with the
// week at a glance. The framing follows the habit research — days this week
// over unbroken chains, totals over perfection.
export default function VirtueAreaScreen() {
  const params = useLocalSearchParams<{ area?: string }>();
  const definition = AREAS.find((entry) => entry.key === params.area);
  const route = useApiRouter();
  const tint = useThemeColor('primary-emphasis');

  const [days, setDays] = useState<VirtueDay[]>([]);
  const [stats, setStats] = useState<VirtueStats | null>(null);

  const load = useCallback(async () => {
    try {
      const summary = await fetchVirtueSummary(route);
      setDays(summary.days);
      setStats(summary.stats);
    } catch {
      // The retry is one focus away.
    }
  }, [route]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const week = useMemo(() => new Set(lastSevenDays()), []);

  if (!definition) {
    return <Redirect href="/virtue" />;
  }

  const area = stats?.areas[definition.key];
  const stage = area
    ? definition.set === 'tree'
      ? Math.max(1, Math.ceil(area.stage / 2))
      : definition.set === 'knight'
        ? 1
        : area.stage
    : 1;

  return (
    <>
      <Stack.Screen options={{ title: definition.label }} />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 p-4 pb-16"
      >
        <Card className="items-center gap-1 py-7">
          {area ? (
            <>
              <View className="mb-2 size-40 overflow-hidden rounded-3xl">
                <Illustration
                  source={{
                    uri: route('api.virtue.mascot', { set: definition.set, stage }),
                    headers: authImageHeaders(),
                  }}
                  transition={200}
                />
              </View>
              {area.streak > 0 ? (
                <View className="flex-row items-center gap-1.5">
                  <Flame size={18} color={tint} weight="fill" />
                  <Text className="text-2xl font-bold text-foreground">{area.streak}</Text>
                  <Text className="text-base text-muted">
                    {area.streak === 1 ? 'day' : 'days'} going
                  </Text>
                </View>
              ) : (
                <Text className="text-base text-muted">Today is a good day to start</Text>
              )}
              <View className="mt-3 w-full gap-1.5 px-2">
                <View className="h-1.5 w-full overflow-hidden rounded-full bg-surface-selected">
                  <View
                    className="h-full rounded-full bg-primary-emphasis"
                    style={{
                      width: `${Math.min(100, Math.round((area.points / Math.max(1, area.next_stage_at)) * 100))}%`,
                    }}
                  />
                </View>
                <Text className="text-center text-xs text-muted">
                  Stage {area.stage} of {area.stage_count} · {area.points}{' '}
                  {area.points === 1 ? 'point' : 'points'}
                </Text>
              </View>
            </>
          ) : (
            <Text className="text-base text-muted"> </Text>
          )}
        </Card>

        {AREA_HABITS[definition.key].map(({ key, label, anchor, Icon, isDone }) => {
          const completed = new Set(days.filter(isDone).map((day) => day.date));
          const weekCount = [...week].filter((date) => completed.has(date)).length;

          return (
            <Card key={key} className="gap-4">
              <View className="flex-row items-center gap-3">
                <View className="size-11 items-center justify-center rounded-2xl bg-surface-selected">
                  <Icon size={22} color={tint} weight="fill" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">{label}</Text>
                  <Text className="text-sm text-muted">{anchor}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-lg font-bold text-foreground">{weekCount}/7</Text>
                  <Text className="text-xs text-muted">this week</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <WeekStrip completed={completed} />
                <Text className="text-xs text-muted">
                  {completed.size} {completed.size === 1 ? 'day' : 'days'} total
                </Text>
              </View>
            </Card>
          );
        })}

        <Text className="px-4 text-center text-xs leading-5 text-muted">
          Habits are built by showing up most days over weeks — not by perfect streaks. One missed
          day never undoes what you have built.
        </Text>
      </ScrollView>
    </>
  );
}
