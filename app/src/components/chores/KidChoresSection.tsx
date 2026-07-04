import * as LocalAuthentication from 'expo-local-authentication';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import type { KidMember } from '@/api/behaviors';
import {
  checkChore,
  fetchChores,
  fetchRewards,
  redeemReward,
  uncheckChore,
  type Chore,
  type Reward,
} from '@/api/chores';
import { useApiRouter } from '@/api/router';
import { ChoreChecklist } from '@/components/chores/ChoreChecklist';
import { RewardCard } from '@/components/chores/RewardCard';

type KidChoresSectionProperties = {
  member: KidMember;
};

// The kid's daily routine block: the reward they're saving for and today's
// checklist. Checking is the kid's own action; approving and redeeming are
// the parents' (Face ID).
export function KidChoresSection({ member }: KidChoresSectionProperties) {
  const route = useApiRouter();

  const [chores, setChores] = useState<Chore[]>([]);
  const [reward, setReward] = useState<Reward | null>(null);
  const [balance, setBalance] = useState(0);

  const load = useCallback(async () => {
    try {
      const [nextChores, rewards] = await Promise.all([
        fetchChores(route, member),
        fetchRewards(route, member),
      ]);
      setChores(nextChores);
      // The first pending reward is the one in play.
      setReward(rewards.rewards.find((entry) => entry.achieved_at === null) ?? null);
      setBalance(rewards.balance);
    } catch {
      // Keep whatever we had; the next focus retries.
    }
  }, [route, member]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function handleCheck(chore: Chore): Promise<void> {
    // Optimistically flip the row so the kid sees the check instantly.
    setChores((current) =>
      current.map((entry) =>
        entry.id === chore.id ? { ...entry, today: { log_id: 0, status: 'done' } } : entry,
      ),
    );

    try {
      await checkChore(route, chore.id);
      await load();
    } catch {
      await load();
    }
  }

  async function handleUncheck(chore: Chore): Promise<void> {
    if (!chore.today) {
      return;
    }

    try {
      await uncheckChore(route, chore.today.log_id);
      await load();
    } catch {
      Alert.alert('Could not uncheck', 'Maybe it was already reviewed.');
    }
  }

  async function handleRedeem(target: Reward): Promise<void> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm it's you to claim the reward",
      cancelLabel: 'Cancel',
    });

    if (!result.success) {
      return;
    }

    try {
      await redeemReward(route, target.id);
      Alert.alert('Reward claimed! 🎉', `Enjoy: ${target.name}`);
      await load();
    } catch {
      Alert.alert('Could not claim', 'Please try again in a moment.');
    }
  }

  if (chores.length === 0 && !reward) {
    return null;
  }

  return (
    <View className="gap-6">
      {reward ? (
        <View className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
            Saving for
          </Text>
          <RewardCard reward={reward} balance={balance} onRedeem={(r) => void handleRedeem(r)} />
        </View>
      ) : null}

      {chores.length > 0 ? (
        <View className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">Today</Text>
          <ChoreChecklist
            chores={chores}
            onCheck={(chore) => void handleCheck(chore)}
            onUncheck={(chore) => void handleUncheck(chore)}
          />
        </View>
      ) : null}
    </View>
  );
}
