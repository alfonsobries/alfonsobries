import { Redirect, router, Stack, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/api/auth';
import { fetchLineSettings, updateLineSettings, type LineSettings } from '@/api/line';
import { useApiRouter } from '@/api/router';
import { LineStatusCard } from '@/components/line/LineStatusCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { formatLineTime } from '@/lib/line-time';
import { isOfflineError } from '@/offline/connectivity';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

export default function LineSettingsScreen() {
  const { user } = useAuth();
  const route = useApiRouter();
  const fetcher = useCallback(() => fetchLineSettings(route), [route]);
  const settings = useCachedResource<LineSettings>(cacheKeys.lineSettings, fetcher);
  const [saving, setSaving] = useState(false);
  const number = settings.data?.number ?? null;
  const quiet = number?.on_off ?? {};
  const pickup = number?.ai_config?.auto_pickup ?? {};
  const [start, setStart] = useState(quiet.start ?? '22:00');
  const [end, setEnd] = useState(quiet.end ?? '08:00');
  const [rings, setRings] = useState(String(pickup.after_rings ?? 4));
  const [script, setScript] = useState(pickup.script ?? '');

  const refresh = settings.refresh;

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const persist = async (payload: Parameters<typeof updateLineSettings>[1]) => {
    setSaving(true);
    try {
      const next = await updateLineSettings(route, payload);
      settings.update(() => next);
    } catch (error) {
      Alert.alert(
        'Could not update',
        isOfflineError(error) ? 'You are offline right now.' : 'The provider rejected that.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  const usage = number?.usage;
  const usageLabel =
    usage && typeof usage === 'object'
      ? Object.entries(usage)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join('\n')
      : null;

  return (
    <>
      <Stack.Screen.Title>Line settings</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-4 px-4 pb-16 pt-4"
        contentInsetAdjustmentBehavior="automatic"
      >
        <LineStatusCard number={number} />

        {number?.balance_usd != null ? (
          <View className="rounded-3xl bg-surface p-4">
            <Text className="text-sm text-muted">Balance</Text>
            <Text className="mt-1 text-2xl font-semibold text-foreground">
              ${number.balance_usd.toFixed(2)}
            </Text>
          </View>
        ) : null}

        {number?.renews_at ? (
          <View className="rounded-3xl bg-surface p-4">
            <Text className="text-sm text-muted">Renews</Text>
            <Text className="mt-1 text-base text-foreground">
              {formatLineTime(number.renews_at)}
            </Text>
            <Text className="mt-1 text-sm capitalize text-muted">
              {number.billing_period ?? 'monthly'}
            </Text>
          </View>
        ) : null}

        <View className="flex-row items-center justify-between rounded-3xl bg-surface px-4 py-3">
          <View className="flex-1 pr-4">
            <Text className="text-base font-medium text-foreground">Auto-renew</Text>
            <Text className="text-sm text-muted">
              Losing this number breaks every account verified with it.
            </Text>
          </View>
          <Switch
            value={number?.auto_renew ?? false}
            disabled={saving || number === null}
            onValueChange={(value) => {
              void persist({ auto_renew: value });
            }}
          />
        </View>

        <View className="gap-3 rounded-3xl bg-surface p-4">
          <Text className="text-base font-medium text-foreground">Quiet hours</Text>
          <Text className="text-sm text-muted">Calls stay quiet. SMS still come in.</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-base text-foreground">Enabled</Text>
            <Switch
              value={Boolean(quiet.enabled)}
              disabled={saving || number === null}
              onValueChange={(value) => {
                void persist({
                  on_off: { enabled: value, start, end, timezone: 'America/Mexico_City' },
                });
              }}
            />
          </View>
          <Input label="From" value={start} onChangeText={setStart} placeholder="22:00" />
          <Input label="Until" value={end} onChangeText={setEnd} placeholder="08:00" />
          <Button
            variant="secondary"
            disabled={saving}
            onPress={() => {
              void persist({
                on_off: { enabled: true, start, end, timezone: 'America/Mexico_City' },
              });
            }}
          >
            Save quiet hours
          </Button>
        </View>

        <View className="gap-3 rounded-3xl bg-surface p-4">
          <Text className="text-base font-medium text-foreground">AI pickup</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-base text-foreground">Answer when I do not</Text>
            <Switch
              value={Boolean(pickup.enabled)}
              disabled={saving || number === null}
              onValueChange={(value) => {
                void persist({
                  ai: { auto_pickup: { ...pickup, enabled: value } },
                });
              }}
            />
          </View>
          <Input
            label="Rings before pickup"
            value={rings}
            onChangeText={setRings}
            keyboardType="number-pad"
          />
          <Input
            label="Script"
            value={script}
            onChangeText={setScript}
            placeholder="I'm unavailable. Leave a message."
            multiline
          />
          <Button
            variant="secondary"
            disabled={saving}
            onPress={() => {
              void persist({
                ai: {
                  auto_pickup: {
                    ...pickup,
                    after_rings: Number(rings) || 4,
                    script,
                  },
                },
              });
            }}
          >
            Save AI pickup
          </Button>
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 pr-4 text-base text-foreground">Voicemail summaries</Text>
            <Switch
              value={Boolean(number?.ai_config?.voicemail_summary?.enabled)}
              disabled={saving || number === null}
              onValueChange={(value) => {
                void persist({
                  ai: { voicemail_summary: { enabled: value, include_sentiment: true } },
                });
              }}
            />
          </View>
        </View>

        {usageLabel ? (
          <View className="rounded-3xl bg-surface p-4">
            <Text className="text-base font-medium text-foreground">Usage this period</Text>
            <Text className="mt-2 font-mono text-sm text-muted">{usageLabel}</Text>
          </View>
        ) : null}

        <Button onPress={() => router.push('/line/live' as Href)} variant="outline">
          Open live panel
        </Button>
      </ScrollView>
    </>
  );
}
