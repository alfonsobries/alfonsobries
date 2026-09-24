import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { formatMoney } from '@/lib/money';

type ShareBarRowProperties = {
  /** An emoji, or any small leading visual (an avatar). */
  leading: ReactNode;
  label: string;
  total: number;
  count: number;
  /** 0…1 of the largest row, for the bar length. */
  relative: number;
  /** 0…1 of the period total, read out as a percentage. */
  share: number;
  onPress?: () => void;
};

/**
 * One ranked line of a breakdown: what it is, how much, and a bar scaled to
 * the biggest line so the ranking reads at a glance.
 */
export function ShareBarRow({
  leading,
  label,
  total,
  count,
  relative,
  share,
  onPress,
}: ShareBarRowProperties) {
  const percent = Math.round(share * 100);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${label}: ${formatMoney(total)}, ${percent} por ciento, ${count} gastos`}
      disabled={!onPress}
      onPress={onPress}
      className="gap-2 px-4 py-3 active:bg-surface-selected"
    >
      <View className="flex-row items-center gap-3">
        {typeof leading === 'string' ? (
          <Text className="w-7 text-center text-xl" allowFontScaling={false}>
            {leading}
          </Text>
        ) : (
          <View className="w-7 items-center">{leading}</View>
        )}
        <Text numberOfLines={1} className="flex-1 text-base text-foreground">
          {label}
        </Text>
        <Text className="text-sm tabular-nums text-muted">{percent}%</Text>
        <Text className="w-24 text-right text-base font-semibold tabular-nums text-foreground">
          {formatMoney(total, 'MXN', { compact: true })}
        </Text>
      </View>
      <View className="ml-9 h-1.5 overflow-hidden rounded-full bg-surface-selected">
        <View
          className="h-full rounded-full bg-primary-emphasis"
          style={{ width: `${Math.max(2, relative * 100)}%` }}
        />
      </View>
    </Pressable>
  );
}
