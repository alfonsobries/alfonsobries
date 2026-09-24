import { Stack, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Linking, ScrollView, Text, View } from 'react-native';

import {
  createTelegramLink,
  fetchTelegramLink,
  type TelegramLink,
  unlinkTelegram,
} from '@/api/home';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { isOfflineError } from '@/offline/connectivity';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

const STEPS = [
  'Toca "Conectar" y se abre Telegram.',
  'Toca "Iniciar" en el chat del bot.',
  'Listo: mándale gastos por texto, foto o nota de voz.',
];

/**
 * Link this person's Telegram to the home assistant, so an expense can be
 * sent from there too. It lands in the same chat as the app.
 */
export default function TelegramScreen() {
  const route = useApiRouter();
  const muted = useThemeColor('muted');
  const fetcher = useCallback(() => fetchTelegramLink(route), [route]);
  const link = useCachedResource<TelegramLink>(cacheKeys.telegramLink, fetcher);
  const { refresh, update } = link;
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  // Coming back from Telegram after tapping "Start" is when the link lands.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refresh();
      }
    });

    return () => subscription.remove();
  }, [refresh]);

  const handleConnect = async () => {
    setBusy(true);
    try {
      const fresh = await createTelegramLink(route);
      if (fresh.url) {
        await Linking.openURL(fresh.url);
      }
    } catch (error) {
      Alert.alert(
        'No se pudo conectar',
        isOfflineError(error)
          ? 'Estás sin conexión.'
          : 'El bot de Telegram no está disponible ahorita. Intenta más tarde.',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleUnlink = () => {
    Alert.alert('¿Desconectar Telegram?', 'El bot dejará de recibir tus gastos.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desconectar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              const fresh = await unlinkTelegram(route);
              update(() => fresh);
            } catch (error) {
              await refresh();
              Alert.alert(
                'No se pudo desconectar',
                isOfflineError(error) ? 'Estás sin conexión.' : 'Intenta de nuevo.',
              );
            }
          })();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Telegram' }} />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 px-4 pb-16 pt-6"
      >
        <View className="items-center gap-2">
          <Text className="text-5xl">✈️</Text>
          <Text className="text-center text-xl font-semibold text-foreground">
            Gastos desde Telegram
          </Text>
          <Text className="text-center text-base leading-6 text-muted">
            Lo que le mandes al bot llega a tu chat de Casa, y la respuesta vuelve a Telegram.
          </Text>
        </View>

        {link.data === null ? (
          <View className="items-center py-8">
            {link.status === 'error' ? (
              <Text className="text-base text-muted">No se pudo revisar. Revisa tu conexión.</Text>
            ) : (
              <ActivityIndicator color={muted} />
            )}
          </View>
        ) : link.data.linked ? (
          <View className="gap-4">
            <View className="flex-row items-center gap-3 rounded-2xl bg-surface p-4">
              <Text className="text-2xl">✅</Text>
              <View className="flex-1">
                <Text className="text-base font-medium text-foreground">Conectado</Text>
                {link.data.username ? (
                  <Text className="text-sm text-muted">@{link.data.username}</Text>
                ) : null}
              </View>
            </View>
            <Button variant="outline" fullWidth onPress={handleUnlink}>
              Desconectar
            </Button>
          </View>
        ) : (
          <View className="gap-5">
            <View className="gap-3 rounded-2xl bg-surface p-4">
              {STEPS.map((step, index) => (
                <View key={step} className="flex-row gap-3">
                  <Text className="w-5 text-base font-semibold text-primary-emphasis">
                    {index + 1}
                  </Text>
                  <Text className="flex-1 text-base leading-6 text-foreground">{step}</Text>
                </View>
              ))}
            </View>
            <Button fullWidth loading={busy} onPress={() => void handleConnect()}>
              Conectar Telegram
            </Button>
          </View>
        )}
      </ScrollView>
    </>
  );
}
