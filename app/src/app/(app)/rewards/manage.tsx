import { Image } from 'expo-image';
import { Redirect, router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { CaretRight, Gift, LockKey, Plus } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { deleteReward, fetchRewards, type Reward } from '@/api/chores';
import { getPerson, isKid } from '@/api/family';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';

// The parents' list of a kid's rewards. The first pending one is what the
// kid's progress card points at. Face ID gated.
export default function ManageRewardsScreen() {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const route = useApiRouter();
  const accent = useThemeColor('primary-emphasis');
  const muted = useThemeColor('muted');

  const [unlocked, setUnlocked] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState(0);

  const person = member ? getPerson(member) : undefined;
  const kid = person && isKid(person.key) ? person.key : undefined;

  const load = useCallback(async () => {
    if (!kid) {
      return;
    }

    try {
      const summary = await fetchRewards(route, kid);
      setRewards(summary.rewards);
      setBalance(summary.balance);
    } catch {
      // Keep the previous list; the next focus retries.
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

  function handleDelete(reward: Reward): void {
    Alert.alert(`Remove “${reward.name}”?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
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
          <Text className="px-4 text-center text-sm text-muted">
            {person.name} has {balance} point{balance === 1 ? '' : 's'} saved up.
          </Text>

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
                  onLongPress={() => handleDelete(reward)}
                  className={`flex-row items-center gap-3 p-3 active:opacity-70 ${
                    index > 0 ? 'border-t border-border' : ''
                  } ${reward.achieved_at ? 'opacity-50' : ''}`}
                >
                  <View className="size-12 items-center justify-center overflow-hidden rounded-xl bg-surface-selected">
                    {reward.image_url ? (
                      <Image
                        source={{ uri: reward.image_url }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    ) : (
                      <Gift size={22} color={accent} weight="fill" />
                    )}
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-base font-medium text-foreground" numberOfLines={1}>
                      {reward.name}
                    </Text>
                    <Text className="text-sm text-muted">
                      {reward.achieved_at ? 'Claimed 🎉' : `${reward.cost} points`}
                    </Text>
                  </View>
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
            Tap to edit · long-press to remove
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
