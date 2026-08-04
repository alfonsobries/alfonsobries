import { Illustration } from '@/components/ui/Illustration';
import { Redirect, router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { CaretRight, Coins, Gift, LockKey, Plus } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import {
  activateReward,
  deleteReward,
  fetchRewards,
  type Reward,
  type RewardsSummary,
} from '@/api/chores';
import { getPerson, isKid } from '@/api/family';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { isOfflineError } from '@/offline/connectivity';
import { cacheKeys, readCache, writeCache } from '@/offline/store';

// The parents' list of a kid's rewards. Each one saves on its own; the active
// one is where new points land. Face ID gated.
export default function ManageRewardsScreen() {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const route = useApiRouter();
  const accent = useThemeColor('primary-emphasis');
  const muted = useThemeColor('muted');

  const [unlocked, setUnlocked] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState(0);
  const [free, setFree] = useState(0);

  const person = member ? getPerson(member) : undefined;
  const kid = person && isKid(person.key) ? person.key : undefined;

  const load = useCallback(async () => {
    if (!kid) {
      return;
    }

    function apply(summary: RewardsSummary): void {
      setRewards(summary.rewards);
      setBalance(summary.balance);
      setFree(summary.free);
    }

    try {
      const summary = await fetchRewards(route, kid);
      writeCache(cacheKeys.rewards(kid), summary);
      apply(summary);
    } catch (error) {
      // The list stays readable offline; editing it still needs the API.
      const cached = isOfflineError(error)
        ? readCache<RewardsSummary>(cacheKeys.rewards(kid))
        : null;

      if (cached) {
        apply(cached);
      }
    }
  }, [route, kid]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (!person || !kid) {
    return <Redirect href="/" />;
  }

  async function handleUnlock(): Promise<void> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm it's you to manage rewards",
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      setUnlocked(true);
    }
  }

  function handleOptions(reward: Reward): void {
    const canActivate = reward.achieved_at === null && !reward.is_active;

    Alert.alert(reward.name, undefined, [
      { text: 'Cancel', style: 'cancel' },
      ...(canActivate
        ? [
            {
              text: 'Save into this one',
              onPress: () => {
                void (async () => {
                  try {
                    await activateReward(route, reward.id);
                    await load();
                  } catch {
                    Alert.alert('Could not switch', 'Please try again in a moment.');
                  }
                })();
              },
            },
          ]
        : []),
      {
        text: 'Remove',
        style: 'destructive' as const,
        onPress: () => {
          void (async () => {
            try {
              await deleteReward(route, reward.id);
              await load();
            } catch {
              Alert.alert('Could not remove', 'Please try again in a moment.');
            }
          })();
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ title: `${person.name}'s rewards` }} />

      {unlocked ? (
        <ScrollView
          className="flex-1 bg-background"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-4 p-4"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Adjust ${person.name}'s points`}
            onPress={() => router.push(`/rewards/points?member=${kid}`)}
            className="flex-row items-center gap-3 rounded-3xl bg-surface p-4 active:opacity-70"
          >
            <View className="size-12 items-center justify-center rounded-xl bg-surface-selected">
              <Coins size={22} color={accent} weight="fill" />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-base font-medium text-foreground">
                {balance} point{balance === 1 ? '' : 's'} saved up
              </Text>
              <Text className="text-sm text-muted">
                {free > 0
                  ? `${free} waiting for a goal · tap to adjust`
                  : 'Tap to give or take back'}
              </Text>
            </View>
            <CaretRight size={18} color={muted} />
          </Pressable>

          {rewards.length > 0 ? (
            <View className="overflow-hidden rounded-3xl bg-surface">
              {rewards.map((reward, index) => (
                <Pressable
                  key={reward.id}
                  accessibilityRole="button"
                  accessibilityLabel={reward.name}
                  onPress={() =>
                    router.push({
                      pathname: '/rewards/edit',
                      params: {
                        member: kid,
                        id: String(reward.id),
                        cost: String(reward.cost),
                        name: reward.name,
                        requires_content_parents: reward.requires_content_parents ? '1' : '0',
                        ...(reward.available_on ? { available_on: reward.available_on } : {}),
                        ...(reward.image_url ? { image: reward.image_url } : {}),
                      },
                    })
                  }
                  onLongPress={() => handleOptions(reward)}
                  className={`flex-row items-center gap-3 p-3 active:opacity-70 ${
                    index > 0 ? 'border-t border-border' : ''
                  } ${reward.achieved_at ? 'opacity-50' : ''}`}
                >
                  <View className="size-12 items-center justify-center overflow-hidden rounded-xl bg-surface-selected">
                    {reward.image_url ? (
                      <Illustration source={{ uri: reward.image_url }} />
                    ) : (
                      <Gift size={22} color={accent} weight="fill" />
                    )}
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-base font-medium text-foreground" numberOfLines={1}>
                      {reward.name}
                    </Text>
                    <Text className="text-sm text-muted">
                      {reward.achieved_at
                        ? 'Claimed 🎉'
                        : `${reward.saved} of ${reward.cost} points`}
                    </Text>
                  </View>
                  {reward.is_active ? (
                    <View className="rounded-full bg-surface-selected px-2.5 py-1">
                      <Text className="text-xs font-medium text-muted">Saving</Text>
                    </View>
                  ) : null}
                  <CaretRight size={18} color={muted} />
                </Pressable>
              ))}
            </View>
          ) : (
            <Text className="py-6 text-center text-sm text-muted">
              Nothing yet — add something to save up for.
            </Text>
          )}

          <Text className="px-4 text-center text-xs text-muted">
            Tap to edit · long-press for options
          </Text>

          <Button icon={Plus} onPress={() => router.push(`/rewards/edit?member=${kid}`)}>
            Add reward
          </Button>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center gap-6 bg-background px-6">
          <Text className="text-center text-base text-muted">
            Managing {person.name}&apos;s rewards is for parents.
          </Text>
          <Button fullWidth icon={LockKey} onPress={() => void handleUnlock()}>
            Unlock with Face ID
          </Button>
        </View>
      )}
    </>
  );
}
