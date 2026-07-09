import { Illustration } from '@/components/ui/Illustration';
import { CheckCircle, CircleDashed, Gift } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import type { Reward } from '@/api/chores';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';

type RewardCardProperties = {
  reward: Reward;
  balance: number;
  onRedeem?: (reward: Reward) => void;
};

// A reward the kid is saving for: illustration, progress bar, and each
// condition as a kid-readable row with a check or a pending mark. The claim
// button appears only when everything is met (a parent confirms on device).
export function RewardCard({ reward, balance, onRedeem }: RewardCardProperties) {
  const accent = useThemeColor('primary-emphasis');

  const progress = Math.min(1, balance / Math.max(1, reward.cost));

  const pointsMet = balance >= reward.cost;
  const dateMet = reward.available_on === null || new Date(reward.available_on) <= new Date();
  const parentsMet = !reward.requires_content_parents || reward.parents_are_content;
  const allMet = pointsMet && dateMet && parentsMet;

  return (
    <View className="gap-3 rounded-3xl bg-surface p-4">
      <View className="flex-row items-center gap-3">
        <View className="size-16 items-center justify-center overflow-hidden rounded-2xl bg-surface-selected">
          {reward.image_url ? (
            <Illustration source={{ uri: reward.image_url }} />
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

      <View className="gap-1.5">
        <ConditionRow met={pointsMet} label={`⭐ ${reward.cost} points`} />
        {reward.available_on !== null ? (
          <ConditionRow met={dateMet} label={`📅 ${formatDay(reward.available_on)}`} />
        ) : null}
        {reward.requires_content_parents ? (
          <ConditionRow met={parentsMet} label="😊 Mom and dad feeling good" />
        ) : null}
      </View>

      {allMet && onRedeem ? (
        <Button size="sm" onPress={() => onRedeem(reward)}>
          Claim the reward! 🎉
        </Button>
      ) : null}
    </View>
  );
}

function ConditionRow({ met, label }: { met: boolean; label: string }) {
  const success = useThemeColor('success');
  const muted = useThemeColor('muted');

  return (
    <View className="flex-row items-center gap-2">
      {met ? (
        <CheckCircle size={20} color={success} weight="fill" />
      ) : (
        <CircleDashed size={20} color={muted} />
      )}
      <Text className={`text-sm ${met ? 'text-foreground' : 'text-muted'}`}>{label}</Text>
    </View>
  );
}

function formatDay(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}
