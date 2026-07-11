import { router, useFocusEffect } from 'expo-router';
import { Flame, ScanSmiley } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { authImageHeaders } from '@/api/client';
import { useApiRouter } from '@/api/router';
import { fetchVirtueSummary, type VirtueStats } from '@/api/virtue';
import { Illustration } from '@/components/ui/Illustration';
import { isVirtueUnlocked, unlockVirtue } from '@/components/virtue/open-virtue';
import { AREAS } from '@/data/virtue';
import { useThemeColor } from '@/hooks/use-theme-color';

// The always-visible pulse of the daily practice. It starts locked — a plain
// Face ID button that reveals nothing — and one successful scan turns it into
// the summary card (tree, streak, one line per area) that opens the section.
export function GrowthCard() {
  const route = useApiRouter();
  const tint = useThemeColor('primary-emphasis');
  const onPrimary = useThemeColor('primary-foreground');
  const [unlocked, setUnlocked] = useState(isVirtueUnlocked);
  const [stats, setStats] = useState<VirtueStats | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!unlocked) {
        return;
      }

      void (async () => {
        try {
          const summary = await fetchVirtueSummary(route);
          setStats(summary.stats);
        } catch {
          // Offline — the card keeps its last summary until the next focus.
        }
      })();
    }, [route, unlocked]),
  );

  async function handleUnlock(): Promise<void> {
    if (await unlockVirtue()) {
      setUnlocked(true);
    }
  }

  if (!unlocked) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Unlock Virtud with Face ID"
        onPress={() => void handleUnlock()}
        className="h-14 flex-row items-center justify-center gap-2.5 rounded-full bg-primary active:opacity-80"
      >
        <ScanSmiley size={22} color={onPrimary} weight="bold" />
        <Text className="text-base font-semibold text-primary-foreground">Virtud</Text>
      </Pressable>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Virtud"
      onPress={() => router.push('/virtue')}
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
