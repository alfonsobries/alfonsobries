import * as Notifications from 'expo-notifications';
import { Redirect, router, Stack, useFocusEffect, type Href } from 'expo-router';
import { Gear, Phone, Plus, Voicemail } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { useAuth } from '@/api/auth';
import {
  fetchLineOverview,
  fetchLineThreads,
  lineUnreadTotal,
  type LineOverview,
  type LineThread,
} from '@/api/line';
import { useApiRouter } from '@/api/router';
import { LineStatusCard } from '@/components/line/LineStatusCard';
import { ThreadListItem } from '@/components/line/ThreadListItem';
import { Input } from '@/components/ui/Input';
import { useLineChannel } from '@/hooks/use-line-channel';
import { useLineContacts } from '@/hooks/use-line-contacts';
import { useThemeColor } from '@/hooks/use-theme-color';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

export default function LineHubScreen() {
  const { user } = useAuth();
  const route = useApiRouter();
  const tint = useThemeColor('primary-emphasis');
  const [query, setQuery] = useState('');
  const resolveContacts = useLineContacts();

  const fetchOverview = useCallback(() => fetchLineOverview(route), [route]);
  const fetchThreads = useCallback(() => fetchLineThreads(route), [route]);
  const overview = useCachedResource<LineOverview>(cacheKeys.lineOverview, fetchOverview);
  const threads = useCachedResource<LineThread[]>(cacheKeys.lineThreads, fetchThreads);

  const refreshOverview = overview.refresh;
  const refreshThreads = threads.refresh;
  const refresh = useCallback(async () => {
    await Promise.all([refreshOverview(), refreshThreads()]);
  }, [refreshOverview, refreshThreads]);

  const unread = lineUnreadTotal(overview.data);

  useFocusEffect(
    useCallback(() => {
      void Notifications.setBadgeCountAsync(unread);
    }, [unread]),
  );

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void resolveContacts();
    }, [refresh, resolveContacts]),
  );

  useLineChannel({
    onMessage: () => {
      void refresh();
    },
    onCall: () => {
      void refresh();
    },
  });

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  const needle = query.trim().toLowerCase();
  const visible = (threads.data ?? []).filter((thread) => {
    if (needle === '') {
      return true;
    }

    return (
      thread.name?.toLowerCase().includes(needle) ||
      thread.e164.includes(needle) ||
      thread.last_message?.body.toLowerCase().includes(needle)
    );
  });

  return (
    <>
      <Stack.Screen.Title>Line</Stack.Screen.Title>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View className="flex-row items-center gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="New message"
                onPress={() => router.push('/line/compose' as Href)}
                hitSlop={8}
              >
                <Plus size={22} color={tint} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dialer"
                onPress={() => router.push('/line/dialer' as Href)}
                hitSlop={8}
              >
                <Phone size={22} color={tint} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Settings"
                onPress={() => router.push('/line/settings' as Href)}
                hitSlop={8}
              >
                <Gear size={22} color={tint} />
              </Pressable>
            </View>
          ),
        }}
      />

      <FlatList
        className="flex-1 bg-background"
        contentContainerClassName="gap-3 px-4 pb-16 pt-4"
        contentInsetAdjustmentBehavior="automatic"
        data={visible}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View className="gap-3 pb-2">
            <LineStatusCard number={overview.data?.number ?? null} />
            {unread > 0 ? <Text className="text-sm text-muted">{unread} waiting</Text> : null}
            <View className="flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Call log"
                onPress={() => router.push('/line/calls' as Href)}
                className="h-11 flex-1 items-center justify-center rounded-2xl bg-surface"
              >
                <Text className="text-sm font-medium text-foreground">Calls</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voicemail"
                onPress={() => router.push('/line/voicemail' as Href)}
                className="h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl bg-surface"
              >
                <Voicemail size={16} color={tint} />
                <Text className="text-sm font-medium text-foreground">Voicemail</Text>
              </Pressable>
            </View>
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder="Search messages or names"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        }
        renderItem={({ item }) => (
          <ThreadListItem
            thread={item}
            onPress={() => router.push(`/line/thread?contact=${item.id}` as Href)}
          />
        )}
        ListEmptyComponent={
          threads.status === 'loading' ? (
            <View className="gap-3">
              <View className="h-20 animate-pulse rounded-3xl bg-surface" />
              <View className="h-20 animate-pulse rounded-3xl bg-surface" />
            </View>
          ) : threads.status === 'error' ? (
            <Text className="px-2 pt-8 text-center text-base text-muted">
              Could not load conversations.
            </Text>
          ) : (
            <Text className="px-2 pt-8 text-center text-base text-muted">
              No messages yet. The first SMS to this number lands here.
            </Text>
          )
        }
      />
    </>
  );
}
