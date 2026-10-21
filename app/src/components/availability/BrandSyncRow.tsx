import { ArrowClockwise, CheckCircle, Clock, Plugs, WarningCircle } from 'phosphor-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import type { SupportBrand } from '@/api/support-availability';
import { useThemeColor } from '@/hooks/use-theme-color';
import { brandSyncState, formatAgo, MODE_LABEL } from '@/lib/availability';

type BrandSyncRowProperties = {
  brand: SupportBrand;
  version: number;
  /** Epoch milliseconds, from the screen's clock. */
  now: number;
  retrying: boolean;
  disabled?: boolean;
  onRetry: () => void;
};

/** One brand's chat: whether it has the latest rules and when it last heard from us. */
export function BrandSyncRow({
  brand,
  version,
  now,
  retrying,
  disabled = false,
  onRetry,
}: BrandSyncRowProperties) {
  const state = brandSyncState(brand, version);
  const success = useThemeColor('success');
  const danger = useThemeColor('danger');
  const warning = useThemeColor('warning');
  const muted = useThemeColor('muted');
  const tint = useThemeColor('primary-emphasis');

  const icon = {
    synced: <CheckCircle size={22} color={success} weight="fill" />,
    pending: <Clock size={22} color={warning} weight="fill" />,
    error: <WarningCircle size={22} color={danger} weight="fill" />,
    unconfigured: <Plugs size={22} color={muted} />,
  }[state];

  const pushedAgo = brand.last_pushed_at ? formatAgo(brand.last_pushed_at, new Date(now)) : null;
  const detail = {
    synced: pushedAgo
      ? `Al día ${pushedAgo}${brand.reported_mode ? ` · ${MODE_LABEL[brand.reported_mode]}` : ''}`
      : version === 0
        ? 'Guarda tu horario para compartirlo'
        : 'Al día',
    pending: 'Enviando la versión nueva…',
    error: brand.last_push_message ?? 'No se pudo enviar',
    unconfigured: 'Sin configurar en el servidor',
  }[state];
  const pulledAgo = brand.last_pulled_at
    ? `Consultó ${formatAgo(brand.last_pulled_at, new Date(now))}`
    : null;
  const canRetry = state === 'error' || state === 'pending';

  return (
    <View className="min-h-14 flex-row items-center gap-3 px-4 py-3">
      {icon}
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-medium text-foreground">{brand.label}</Text>
        <Text
          className={`text-sm ${state === 'error' ? 'text-danger' : 'text-muted'}`}
          numberOfLines={2}
        >
          {detail}
        </Text>
        {pulledAgo ? <Text className="text-xs text-muted">{pulledAgo}</Text> : null}
      </View>
      {canRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Reintentar ${brand.label}`}
          accessibilityState={{ disabled: disabled || retrying, busy: retrying }}
          disabled={disabled || retrying}
          hitSlop={8}
          onPress={onRetry}
          className={`size-11 items-center justify-center rounded-full ${disabled ? 'opacity-40' : 'active:bg-surface-selected'}`}
        >
          {retrying ? (
            <ActivityIndicator size="small" color={muted} />
          ) : (
            <ArrowClockwise size={20} color={tint} weight="bold" />
          )}
        </Pressable>
      ) : null}
    </View>
  );
}
