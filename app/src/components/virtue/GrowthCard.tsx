import { useFocusEffect } from 'expo-router';
import { CaretRight, Flame } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { authImageHeaders } from '@/api/client';
import { useApiRouter } from '@/api/router';
import { fetchVirtueSummary, type VirtueStats } from '@/api/virtue';
import { Illustration } from '@/components/ui/Illustration';
import { openVirtue } from '@/components/virtue/open-virtue';
import { AREAS } from '@/data/virtue';
import { useThemeColor } from '@/hooks/use-theme-color';

// The always-visible pulse of the daily practice: the tree that grows with
// the streak plus one line per area. Tapping asks for Face ID and opens the
// full section. Renders nothing when the stats aren't available (offline or
// another user).
export function GrowthCard() {
  const route = useApiRouter();
  const muted = useThemeColor('muted');
  const tint = useThemeColor('primary-emphasis');
  const [stats, setStats] = useState<VirtueStats | null>(null);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        try {
          const summary = await fetchVirtueSummary(route);
          setStats(summary.stats);
        } catch {
          // Not available for this user or offline — the card stays hidden.
        }
      })();
    }, [route]),
  );

  if (!stats) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Growth"
      onPress={() => void openVirtue()}
      className="gap-4 rounded-3xl bg-surface p-4 active:opacity-80"
    >
      <View className="flex-row items-center gap-4">
        <View className="size-16 overflow-hidden rounded-2xl">
          <Illustration
            source={{
              uri: route('api.virtue.mascot', { set: 'tree', stage: stats.tree_stage }),
              headers: authImageHeaders(),
            }}
            transition={150}
          />
        </View>

        <View className="flex-1 gap-0.5">
          <Text className="text-2xl font-bold text-foreground">
            {stats.streak} {stats.streak === 1 ? 'day' : 'days'}
          </Text>
          <Text className="text-sm text-muted">Growing steady</Text>
        </View>

        <CaretRight size={16} color={muted} weight="bold" />
      </View>

      <View className="flex-row gap-2">
        {AREAS.map(({ key, label, Icon }) => {
          const area = stats.areas[key];

          return (
            <View key={key} className="flex-1 gap-1.5 rounded-2xl bg-surface-selected p-2.5">
              <View className="flex-row items-center gap-1.5">
                <Icon size={14} color={tint} weight="fill" />
                <Text className="flex-1 text-xs font-semibold text-foreground" numberOfLines={1}>
                  {label}
                </Text>
                {area.streak > 0 ? (
                  <View className="flex-row items-center gap-0.5">
                    <Flame size={10} color={tint} weight="fill" />
                    <Text className="text-[10px] font-semibold text-foreground">{area.streak}</Text>
                  </View>
                ) : null}
              </View>
              <View className="h-1 w-full overflow-hidden rounded-full bg-background">
                <View
                  className="h-full rounded-full bg-primary-emphasis"
                  style={{
                    width: `${Math.min(100, Math.round((area.points / Math.max(1, area.next_stage_at)) * 100))}%`,
                  }}
                />
              </View>
              <Text className="text-[10px] text-muted">Stage {area.stage}</Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}
