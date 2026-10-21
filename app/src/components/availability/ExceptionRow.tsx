import { CalendarBlank, CaretRight } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import type { AvailabilityException } from '@/api/support-availability';
import { useThemeColor } from '@/hooks/use-theme-color';
import { describeExceptionSpan, MODE_LABEL } from '@/lib/availability';

import { MODE_APPEARANCE } from './mode-appearance';

type ExceptionRowProperties = {
  exception: AvailabilityException;
  /** Epoch milliseconds, from the screen's clock. */
  now: number;
  onPress: () => void;
};

export function ExceptionRow({ exception, now, onPress }: ExceptionRowProperties) {
  const appearance = MODE_APPEARANCE[exception.mode];
  const glyphColor = useThemeColor(appearance.tint);
  const muted = useThemeColor('muted');
  const active =
    new Date(exception.starts_at).getTime() <= now && now < new Date(exception.ends_at).getTime();
  const span = describeExceptionSpan(exception);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${exception.label ?? 'Excepción'}, ${span}, ${MODE_LABEL[exception.mode]}${active ? ', activa ahora' : ''}`}
      accessibilityHint="Editar"
      onPress={onPress}
      className="min-h-14 flex-row items-center gap-3 px-4 py-3 active:bg-surface-selected"
    >
      <View className={`size-9 items-center justify-center rounded-xl ${appearance.badge}`}>
        <CalendarBlank size={18} color={glyphColor} weight="fill" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-medium text-foreground" numberOfLines={1}>
          {exception.label ?? 'Excepción'}
        </Text>
        <Text className="text-sm text-muted">
          {span} · {MODE_LABEL[exception.mode]}
          {active ? ' · ahora' : ''}
        </Text>
      </View>
      <CaretRight size={14} color={muted} weight="bold" />
    </Pressable>
  );
}
