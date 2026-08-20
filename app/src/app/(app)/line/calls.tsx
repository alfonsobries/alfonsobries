import { Redirect, router, Stack, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { useAuth } from '@/api/auth';
import {
  fetchLineCallRecording,
  fetchLineCalls,
  markLineCallsSeen,
  type LineCall,
} from '@/api/line';
import { VoicemailPlayer } from '@/components/line/VoicemailPlayer';
import { useApiRouter } from '@/api/router';
import { CallLogItem } from '@/components/line/CallLogItem';
import { useLineChannel } from '@/hooks/use-line-channel';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

export default function LineCallsScreen() {
  const { user } = useAuth();
  const route = useApiRouter();
  const fetcher = useCallback(() => fetchLineCalls(route), [route]);
  const calls = useCachedResource<LineCall[]>(cacheKeys.lineCalls, fetcher);
  const [recordingUrls, setRecordingUrls] = useState<Record<number, string>>({});

  const refreshCalls = calls.refresh;
  const refresh = useCallback(async () => {
    await refreshCalls();
    try {
      await markLineCallsSeen(route);
    } catch {
      // Badge clears on the next successful visit.
    }
  }, [refreshCalls, route]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useLineChannel({
    onCall: () => {
      void refreshCalls();
    },
  });

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Stack.Screen.Title>Calls</Stack.Screen.Title>
      <FlatList
        className="flex-1 bg-background"
        contentContainerClassName="gap-3 px-4 pb-16 pt-4"
        contentInsetAdjustmentBehavior="automatic"
        data={calls.data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View className="gap-2">
            <CallLogItem
              call={item}
              onPress={() =>
                item.contact
                  ? router.push(`/line/thread?contact=${item.contact.id}` as Href)
                  : undefined
              }
            />
            {item.has_recording ? (
              <VoicemailPlayer
                url={recordingUrls[item.id] ?? null}
                durationSec={item.duration_sec}
                loading={false}
              />
            ) : null}
            {item.has_recording && !recordingUrls[item.id] ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Load recording"
                className="px-4"
                onPress={() => {
                  void fetchLineCallRecording(route, item.id).then((url) => {
                    setRecordingUrls((current) => ({ ...current, [item.id]: url }));
                  });
                }}
              >
                <Text className="text-sm text-primary-emphasis">Load recording</Text>
              </Pressable>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          calls.status === 'loading' ? (
            <View className="h-20 animate-pulse rounded-3xl bg-surface" />
          ) : (
            <Text className="px-2 pt-8 text-center text-base text-muted">
              No calls on this line yet.
            </Text>
          )
        }
      />
    </>
  );
}
