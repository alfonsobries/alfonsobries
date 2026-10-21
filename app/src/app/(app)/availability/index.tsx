import { type Href, Redirect, router, Stack, useFocusEffect } from 'expo-router';
import { CalendarPlus, CaretRight, CloudSlash, Clock } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/api/auth';
import { useApiRouter } from '@/api/router';
import { type AvailabilityMode, clearOverride, resyncBrands } from '@/api/support-availability';
import { AvailabilitySkeleton } from '@/components/availability/AvailabilitySkeleton';
import { AvailabilityStatusCard } from '@/components/availability/AvailabilityStatusCard';
import { BrandSyncRow } from '@/components/availability/BrandSyncRow';
import { ExceptionRow } from '@/components/availability/ExceptionRow';
import { QuickModeButton } from '@/components/availability/QuickModeButton';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { Button } from '@/components/ui/Button';
import { useSupportAvailability } from '@/hooks/use-support-availability';
import { useNow } from '@/hooks/use-now';
import { useThemeColor } from '@/hooks/use-theme-color';
import { effectiveStatus, MODE_LABEL, summarizeWeek } from '@/lib/availability';
import { useIsOnline } from '@/offline/connectivity';

const QUICK_MODES: AvailabilityMode[] = ['online', 'bot', 'offline'];

/** A resync is queued on the API; its answers land a few seconds later. */
const RESYNC_SETTLE_MS = 4000;

/**
 * Alfonso's availability for the support chats of every brand: what they do
 * right now, one-tap overrides, the weekly schedule, vacations, and whether
 * each brand has the latest rules.
 */
export default function AvailabilityScreen() {
  const { user } = useAuth();
  const route = useApiRouter();
  const availability = useSupportAvailability();
  const isOnline = useIsOnline();
  const muted = useThemeColor('muted');
  const tint = useThemeColor('primary-emphasis');
  const now = useNow(30_000);
  const [pulling, setPulling] = useState(false);
  const [retrying, setRetrying] = useState<string | null>(null);
  const { refresh, mutate, data } = availability;

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  const handlePull = async (): Promise<void> => {
    setPulling(true);
    await refresh();
    setPulling(false);
  };

  const handleClearOverride = (): void => {
    void mutate(
      () => clearOverride(route),
      'No se pudo volver al horario',
      (current) => ({
        ...current,
        rules: { ...current.rules, override: null },
      }),
    );
  };

  const handleRetry = async (brand?: string): Promise<void> => {
    setRetrying(brand ?? 'all');
    const sent = await mutate(() => resyncBrands(route, brand), 'No se pudo reenviar');
    setRetrying(null);

    if (sent) {
      setTimeout(() => void refresh(), RESYNC_SETTLE_MS);
    }
  };

  const openOverride = (mode: AvailabilityMode): void => {
    router.push({ pathname: '/availability/override', params: { mode } } as Href);
  };

  const status = data ? effectiveStatus(data, new Date(now)) : null;
  const activeOverride =
    status?.reason === 'override' ? (data?.rules.override?.mode ?? null) : null;
  const writable = isOnline;

  return (
    <>
      <Stack.Screen.Title>Disponibilidad</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-6 px-4 pb-16 pt-4"
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={pulling} onRefresh={() => void handlePull()} />}
      >
        {!data && availability.status === 'loading' ? <AvailabilitySkeleton /> : null}

        {!data && availability.status === 'error' ? (
          <View className="items-center gap-3 py-16">
            <Text className="text-center text-base text-muted">
              {isOnline
                ? 'No pude cargar tu disponibilidad.'
                : 'Estás sin conexión y no hay datos guardados todavía.'}
            </Text>
            <Button variant="secondary" size="sm" onPress={() => void refresh()}>
              Reintentar
            </Button>
          </View>
        ) : null}

        {data ? (
          <>
            {!isOnline ? (
              <View className="flex-row items-center gap-3 rounded-2xl bg-surface-selected px-4 py-3">
                <CloudSlash size={20} color={muted} weight="fill" />
                <Text className="flex-1 text-sm text-foreground">
                  Sin conexión: ves lo último guardado. Para cambiar tu disponibilidad necesitas
                  internet, así los chats se enteran.
                </Text>
              </View>
            ) : null}

            <AvailabilityStatusCard
              availability={data}
              disabled={!writable}
              onClearOverride={handleClearOverride}
            />

            <View className="gap-2">
              <Text className="px-4 text-xs font-medium uppercase tracking-wide text-muted">
                Cambiar ahora
              </Text>
              <View className="flex-row gap-3">
                {QUICK_MODES.map((mode) => (
                  <QuickModeButton
                    key={mode}
                    mode={mode}
                    active={activeOverride === mode}
                    disabled={!writable}
                    onPress={() => openOverride(mode)}
                  />
                ))}
              </View>
            </View>

            <SettingsSection
              title="Horario semanal"
              footer={
                data.shared
                  ? undefined
                  : 'Todavía no compartes un horario con los chats: guárdalo una vez para empezar.'
              }
            >
              <Pressable
                accessibilityRole="button"
                accessibilityHint="Editar el horario semanal"
                onPress={() => router.push('/availability/schedule' as Href)}
                className="min-h-14 flex-row items-center gap-3 px-4 py-3 active:bg-surface-selected"
              >
                <Clock size={22} color={tint} />
                <View className="flex-1 gap-0.5">
                  <Text className="text-base text-foreground">
                    {summarizeWeek(data.rules.weekly)}
                  </Text>
                  <Text className="text-sm text-muted">
                    Fuera de horario: {MODE_LABEL[data.rules.outside_hours_mode].toLowerCase()}
                  </Text>
                </View>
                <CaretRight size={14} color={muted} weight="bold" />
              </Pressable>
            </SettingsSection>

            <SettingsSection title="Vacaciones y excepciones">
              {data.rules.exceptions.length === 0 ? (
                <View className="px-4 py-3">
                  <Text className="text-sm text-muted">
                    Nada programado. Agrega vacaciones, días libres o eventos y los chats cambiarán
                    solos.
                  </Text>
                </View>
              ) : null}
              {data.rules.exceptions.map((exception) => (
                <ExceptionRow
                  key={exception.id}
                  exception={exception}
                  now={now}
                  onPress={() =>
                    router.push({
                      pathname: '/availability/exception',
                      params: { id: String(exception.id) },
                    } as Href)
                  }
                />
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !writable }}
                disabled={!writable}
                onPress={() => router.push('/availability/exception' as Href)}
                className={`min-h-12 flex-row items-center gap-3 px-4 py-3 ${writable ? 'active:bg-surface-selected' : 'opacity-50'}`}
              >
                <CalendarPlus size={22} color={tint} />
                <Text className="text-base font-medium text-primary-emphasis">Agregar</Text>
              </Pressable>
            </SettingsSection>

            <SettingsSection
              title="Chats"
              footer={data.shared ? `Versión ${data.rules.version} del horario` : undefined}
            >
              {data.brands.map((brand) => (
                <BrandSyncRow
                  key={brand.name}
                  brand={brand}
                  version={data.rules.version}
                  now={now}
                  retrying={retrying === brand.name || retrying === 'all'}
                  disabled={!writable}
                  onRetry={() => void handleRetry(brand.name)}
                />
              ))}
            </SettingsSection>

            {data.shared && data.brands.some((brand) => brand.enabled) ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={!writable}
                loading={retrying === 'all'}
                onPress={() => void handleRetry()}
              >
                Reenviar a todos
              </Button>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </>
  );
}
