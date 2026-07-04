import { Image } from 'expo-image';
import { Gift } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import type { Reward } from '@/api/chores';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';

type RewardCardProperties = {
  reward: Reward;
  balance: number;
  onRedeem?: (reward: Reward) => void;
};

// The reward a kid is saving for: illustration, a friendly progress bar, and
// the redeem action once the points are there (a parent confirms on device).
export function RewardCard({ reward, balance, onRedeem }: RewardCardProperties) {
  const accent = useThemeColor('primary-emphasis');

  const progress = Math.min(1, balance / Math.max(1, reward.cost));
  const reached = balance >= reward.cost;

  return (
    <View className="gap-3 rounded-3xl bg-surface p-4">
      <View className="flex-row items-center gap-3">
        <View className="size-16 items-center justify-center overflow-hidden rounded-2xl bg-surface-selected">
          {reward.image_url ? (
            <Image
              source={{ uri: reward.image_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <Gift size={28} color={accent} weight="fill" />
          )}
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
            {reward.name}
          </Text>
          <Text className="text-sm text-muted">
            {Math.min(balance, reward.cost)} of {reward.cost} points
          </Text>
        </View>
      </View>

      <View className="h-3 overflow-hidden rounded-full bg-surface-selected">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </View>

      {reached && onRedeem ? (
        <Button size="sm" onPress={() => onRedeem(reward)}>
          Claim the reward! 🎉
        </Button>
      ) : null}
    </View>
  );
}
