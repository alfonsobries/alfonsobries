import { router, useFocusEffect } from 'expo-router';
import { CaretRight } from 'phosphor-react-native';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useSupportAvailability } from '@/hooks/use-support-availability';
import { useThemeColor } from '@/hooks/use-theme-color';
import { effectiveStatus, MODE_LABEL, statusDetail } from '@/lib/availability';

import { MODE_APPEARANCE } from './mode-appearance';

/**
 * The support chats' mode at a glance on Alfonso's home, opening the
 * availability screen.
 */
export function AvailabilityCard() {
  const availability = useSupportAvailability();
  const muted = useThemeColor('muted');
  const { refresh } = availability;
  const data = availability.data;
  const status = data ? effectiveStatus(data) : null;
  const appearance = status ? MODE_APPEARANCE[status.mode] : null;
  const glyphColor = useThemeColor(appearance?.tint ?? 'muted');

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const Glyph = appearance?.icon;
  const title = status ? MODE_LABEL[status.mode] : 'Disponibilidad';
  const detail =
    data && status
      ? statusDetail(status, data.rules.override !== null && data.rules.override.until === null)
      : availability.status === 'error'
        ? 'Toca para reintentar'
        : 'Cargando…';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Soporte: ${title}. ${detail}`}
      accessibilityHint="Abre tu disponibilidad para los chats de soporte"
      onPress={() => router.push('/availability')}
      className="min-h-11 flex-row items-center gap-3 rounded-3xl bg-surface p-4 active:opacity-80"
    >
      <View
        className={`size-11 items-center justify-center rounded-2xl ${appearance?.badge ?? 'bg-surface-selected'}`}
      >
        {Glyph ? <Glyph size={22} color={glyphColor} weight="fill" /> : null}
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-xs font-medium uppercase tracking-wide text-muted">Soporte</Text>
        <Text className={`text-base font-semibold ${appearance?.text ?? 'text-foreground'}`}>
          {title}
        </Text>
        <Text className="text-sm text-muted" numberOfLines={1}>
          {detail}
        </Text>
      </View>
      <CaretRight size={14} color={muted} weight="bold" />
    </Pressable>
  );
}
