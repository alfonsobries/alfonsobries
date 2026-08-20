import { Redirect, Stack, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/api/auth';
import { fetchLineSettings, type LineSettings } from '@/api/line';
import { useApiRouter } from '@/api/router';
import { LineStatusCard } from '@/components/line/LineStatusCard';
import { formatPhone } from '@/lib/phone';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

export default function LineSettingsScreen() {
  const { user } = useAuth();
  const route = useApiRouter();
  const fetcher = useCallback(() => fetchLineSettings(route), [route]);
  const settings = useCachedResource<LineSettings>(cacheKeys.lineSettings, fetcher);
  const number = settings.data?.number ?? null;
  const refresh = settings.refresh;

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Stack.Screen.Title>My number</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-4 px-4 pb-16 pt-4"
        contentInsetAdjustmentBehavior="automatic"
      >
        <LineStatusCard number={number} />
        {number ? (
          <View className="rounded-3xl bg-surface p-4">
            <Text className="text-sm text-muted">E.164</Text>
            <Text selectable className="mt-1 text-base text-foreground">
              {formatPhone(number.e164)}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </>
  );
}
