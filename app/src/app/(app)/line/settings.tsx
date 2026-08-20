import { Redirect, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/api/auth';
import { fetchLineSettings, updateLineSettings, type LineSettings } from '@/api/line';
import { useApiRouter } from '@/api/router';
import { LineStatusCard } from '@/components/line/LineStatusCard';
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

  const refresh = settings.refresh;

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const handleAutoRenew = async (value: boolean) => {
    setSaving(true);
    try {
      const next = await updateLineSettings(route, { auto_renew: value });
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
              void handleAutoRenew(value);
            }}
          />
        </View>

        <View className="rounded-3xl bg-surface p-4">
          <Text className="text-base font-medium text-foreground">AI screening</Text>
          <Text className="mt-1 text-sm text-muted">
            {number?.ai_enabled ? 'On — the assistant can pick up.' : 'Off.'}
          </Text>
        </View>

        {usageLabel ? (
          <View className="rounded-3xl bg-surface p-4">
            <Text className="text-base font-medium text-foreground">Usage this period</Text>
            <Text className="mt-2 font-mono text-sm text-muted">{usageLabel}</Text>
          </View>
        ) : null}
      </ScrollView>
    </>
  );
}
