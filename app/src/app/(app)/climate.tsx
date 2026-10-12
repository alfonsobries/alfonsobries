import { Redirect, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { useAuth } from '@/api/auth';
import {
  type ClimateAutomation,
  type ClimateChange,
  type ClimateOverview,
  type ClimateUnit,
  fetchClimate,
  updateClimateAutomation,
  updateClimateUnit,
} from '@/api/climate';
import { useApiRouter } from '@/api/router';
import { ClimateAutomationSection } from '@/components/climate/ClimateAutomationSection';
import { ClimateUnitCard } from '@/components/climate/ClimateUnitCard';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  currentCoordinates,
  presencePermission,
  type PresencePermission,
  requestPresencePermission,
  syncHomeGeofence,
} from '@/lib/home-presence';
import { isOfflineError } from '@/offline/connectivity';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

const PARENTS = new Set(['alfonso', 'saida']);

function errorMessage(error: unknown): string {
  if (isOfflineError(error)) {
    return 'Estás sin conexión.';
  }

  const message = (error as { response?: { data?: { message?: unknown } } }).response?.data
    ?.message;

  return typeof message === 'string' ? message : 'Intenta de nuevo en un momento.';
}

export default function ClimateScreen() {
  const { user } = useAuth();
  const route = useApiRouter();
  const muted = useThemeColor('muted');
  const fetcher = useCallback(() => fetchClimate(route), [route]);
  const climate = useCachedResource<ClimateOverview>(cacheKeys.climate, fetcher);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [permission, setPermission] = useState<PresencePermission | null>(null);
  const [savingHome, setSavingHome] = useState(false);
  const [turningOff, setTurningOff] = useState(false);
  const [pulling, setPulling] = useState(false);
  const { refresh, update } = climate;

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void presencePermission().then(setPermission);
    }, [refresh]),
  );

  const replaceUnit = useCallback(
    (next: ClimateUnit) => {
      update((current) =>
        current
          ? { ...current, units: current.units.map((unit) => (unit.id === next.id ? next : unit)) }
          : current,
      );
    },
    [update],
  );

  const setAutomation = useCallback(
    (automation: ClimateAutomation) => {
      update((current) => (current ? { ...current, automation } : current));
    },
    [update],
  );

  const handleChange = useCallback(
    async (unit: ClimateUnit, change: ClimateChange) => {
      if (unit.state) {
        replaceUnit({ ...unit, state: { ...unit.state, ...change } });
      }

      try {
        replaceUnit(await updateClimateUnit(route, unit.id, change));
      } catch (error) {
        replaceUnit(unit);
        Alert.alert(`No se pudo cambiar ${unit.name}`, errorMessage(error));
      }
    },
    [replaceUnit, route],
  );

  if (user && !PARENTS.has(user.family_member ?? '')) {
    return <Redirect href="/" />;
  }

  const data = climate.data;
  const units = data?.units ?? [];
  const onCount = units.filter((unit) => unit.state?.power).length;

  const handleTurnAllOff = async (): Promise<void> => {
    setTurningOff(true);
    await Promise.all(
      units.filter((unit) => unit.state?.power).map((unit) => handleChange(unit, { power: false })),
    );
    setTurningOff(false);
  };

  const handleToggleAutomation = async (enabled: boolean): Promise<void> => {
    if (!data) {
      return;
    }

    setAutomation({ ...data.automation, enabled });

    try {
      const automation = await updateClimateAutomation(route, { enabled });
      setAutomation(automation);
      await syncHomeGeofence(automation.home, automation.enabled);
    } catch (error) {
      setAutomation(data.automation);
      Alert.alert('No se pudo guardar', errorMessage(error));
    }
  };

  const saveHomeHere = async (): Promise<void> => {
    setSavingHome(true);

    try {
      let granted = permission;

      if (granted !== 'always' && granted !== 'while-using') {
        granted = await requestPresencePermission();
        setPermission(granted);
      }

      if (granted === 'denied') {
        Alert.alert('Sin acceso a la ubicación', 'Actívala en Ajustes para guardar la casa.', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir Ajustes', onPress: () => void Linking.openSettings() },
        ]);
        return;
      }

      const automation = await updateClimateAutomation(route, { home: await currentCoordinates() });
      setAutomation(automation);
      await syncHomeGeofence(automation.home, automation.enabled);
    } catch (error) {
      Alert.alert('No se pudo guardar la casa', errorMessage(error));
    } finally {
      setSavingHome(false);
    }
  };

  const handleSetHome = (): void => {
    Alert.alert('¿Estás en casa?', 'Guardo tu ubicación actual como la casa, para los dos.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, guardar aquí', onPress: () => void saveHomeHere() },
    ]);
  };

  const handleRequestPermission = async (): Promise<void> => {
    const granted = await requestPresencePermission();
    setPermission(granted);

    if (granted !== 'always') {
      Alert.alert(
        'Falta "Siempre"',
        'En Ajustes > Ubicación, elige "Siempre" para que la casa sepa cuándo llegas aunque la app esté cerrada.',
        [
          { text: 'Ahora no', style: 'cancel' },
          { text: 'Abrir Ajustes', onPress: () => void Linking.openSettings() },
        ],
      );
      return;
    }

    if (data) {
      await syncHomeGeofence(data.automation.home, data.automation.enabled);
    }
  };

  const handlePull = async (): Promise<void> => {
    setPulling(true);
    await refresh();
    setPulling(false);
  };

  return (
    <>
      <Stack.Screen.Title>Aires</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-6 px-4 pb-16 pt-4"
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={pulling} onRefresh={() => void handlePull()} />}
      >
        {!data && climate.status === 'loading' ? (
          <View className="items-center py-16">
            <ActivityIndicator color={muted} />
          </View>
        ) : null}

        {!data && climate.status === 'error' ? (
          <View className="items-center gap-3 py-16">
            <Text className="text-center text-base text-muted">
              No pude conectar con los aires.
            </Text>
            <Button variant="secondary" size="sm" onPress={() => void refresh()}>
              Reintentar
            </Button>
          </View>
        ) : null}

        {data && !data.configured ? (
          <Text className="text-center text-base text-muted">
            Los aires todavía no están conectados.
          </Text>
        ) : null}

        {data && units.length > 0 ? (
          <View className="gap-3">
            <View className="flex-row items-center justify-between px-1">
              <Text className="text-sm text-muted">
                {onCount === 0
                  ? 'Todos apagados'
                  : onCount === 1
                    ? '1 encendido'
                    : `${onCount} encendidos`}
              </Text>
              {onCount > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  loading={turningOff}
                  onPress={() => void handleTurnAllOff()}
                >
                  Apagar todos
                </Button>
              ) : null}
            </View>
            {units.map((unit) => (
              <ClimateUnitCard
                key={unit.id}
                unit={unit}
                expanded={expanded === unit.id}
                onToggleExpanded={() =>
                  setExpanded((current) => (current === unit.id ? null : unit.id))
                }
                onChange={(change) => handleChange(unit, change)}
              />
            ))}
          </View>
        ) : null}

        {data ? (
          <ClimateAutomationSection
            automation={data.automation}
            permission={permission}
            savingHome={savingHome}
            onToggle={(enabled) => void handleToggleAutomation(enabled)}
            onSetHome={handleSetHome}
            onRequestPermission={() => void handleRequestPermission()}
          />
        ) : null}
      </ScrollView>
    </>
  );
}
