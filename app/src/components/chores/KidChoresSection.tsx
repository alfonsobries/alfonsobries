import * as LocalAuthentication from 'expo-local-authentication';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import type { KidMember } from '@/api/behaviors';
import { fetchChores, fetchRewards, redeemReward, type Chore, type Reward } from '@/api/chores';
import { useApiRouter } from '@/api/router';
import { RewardCard } from '@/components/chores/RewardCard';
import { IllustratedButton } from '@/components/ui/IllustratedButton';

const choresArt = require('../../../assets/illustrations/chores-button.png');

type KidChoresSectionProperties = {
  member: KidMember;
};

// The kid's routine block on their profile: every reward they're saving for
// and the doorway into today's checklist. Redeeming asks for Face ID.
export function KidChoresSection({ member }: KidChoresSectionProperties) {
  const route = useApiRouter();

  const [chores, setChores] = useState<Chore[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState(0);

  const load = useCallback(async () => {
    try {
      const [nextChores, summary] = await Promise.all([
        fetchChores(route, member),
        fetchRewards(route, member),
      ]);
      setChores(nextChores);
      setRewards(summary.rewards.filter((entry) => entry.achieved_at === null));
      setBalance(summary.balance);
    } catch {
      // Keep whatever we had; the next focus retries.
    }
  }, [route, member]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

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
      Alert.alert('Not yet', 'Something is still missing to claim it.');
    }
  }

  const doneToday = chores.filter((chore) => chore.today !== null).length;

  return (
    <View className="gap-6">
      {rewards.length > 0 ? (
        <View className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
            Saving for
          </Text>
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              balance={balance}
              onRedeem={(r) => void handleRedeem(r)}
            />
          ))}
        </View>
      ) : null}

      {chores.length > 0 ? (
        <IllustratedButton
          image={choresArt}
          label="Today's chores"
          subtitle={`${doneToday} of ${chores.length} checked`}
          onPress={() => router.push({ pathname: '/chores-today', params: { member } })}
        />
      ) : null}
    </View>
  );
}
