import { router, useFocusEffect } from 'expo-router';
import { CaretRight } from 'phosphor-react-native';
import { useCallback } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  type Assistant,
  type Conversation,
  deleteConversation,
  fetchAssistants,
  fetchConversations,
} from '@/api/chat';
import { useApiRouter } from '@/api/router';
import { AssistantTile } from '@/components/chat/AssistantTile';
import { useThemeColor } from '@/hooks/use-theme-color';
import { isOfflineError } from '@/offline/connectivity';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

type ChatOverview = {
  assistants: Assistant[];
  conversations: Conversation[];
};

export default function ChatScreen() {
  const route = useApiRouter();
  const insets = useSafeAreaInsets();

  const fetcher = useCallback(async (): Promise<ChatOverview> => {
    const [assistants, conversations] = await Promise.all([
      fetchAssistants(route),
      fetchConversations(route),
    ]);

    return { assistants, conversations };
  }, [route]);

  const overview = useCachedResource<ChatOverview>(cacheKeys.assistants, fetcher);
  const { refresh } = overview;

  // Past conversations stay readable offline; only starting or continuing one
  // needs the network, which the thread screen says for itself.
  const assistants = overview.data?.assistants ?? null;
  const conversations = overview.data?.conversations ?? null;

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const handleDelete = (conversation: Conversation) => {
    Alert.alert('Delete conversation?', 'Its messages will be gone for good.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteConversation(route, conversation.id);
              await refresh();
            } catch (error) {
              Alert.alert(
                'Could not delete',
                isOfflineError(error) ? 'You are offline right now.' : 'Please try again.',
              );
            }
          })();
        },
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top + 4, paddingBottom: 24 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="px-4">
        <Text className="text-3xl font-semibold leading-tight text-foreground">Chat</Text>
        <Text className="mt-1 text-base text-muted">Pick an assistant to start</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-5"
        contentContainerClassName="gap-3 px-4"
      >
        {assistants === null
          ? [0, 1].map((key) => (
              <View key={key} className="h-32 w-40 animate-pulse rounded-3xl bg-surface" />
            ))
          : assistants.map((assistant) => (
              <AssistantTile
                key={assistant.id}
                assistant={assistant}
                onPress={() => router.push(`/chat/thread?assistant=${assistant.id}`)}
              />
            ))}
      </ScrollView>

      <View className="mt-8 px-4">
        <Text className="mb-3 text-lg font-semibold text-foreground">Recent</Text>

        {conversations === null ? (
          <View className="overflow-hidden rounded-3xl bg-surface">
            {[0, 1, 2].map((key) => (
              <View
                key={key}
                className={`h-16 animate-pulse ${key > 0 ? 'border-t border-border' : ''}`}
              />
            ))}
          </View>
        ) : conversations.length === 0 ? (
          <View className="items-center rounded-3xl bg-surface px-6 py-10">
            <Text className="text-center text-base text-muted">
              No conversations yet. Pick an assistant above to start one.
            </Text>
          </View>
        ) : (
          <View className="overflow-hidden rounded-3xl bg-surface">
            {conversations.map((conversation, index) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                first={index === 0}
                onPress={() => router.push(`/chat/thread?conversation=${conversation.id}`)}
                onLongPress={() => handleDelete(conversation)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function ConversationRow({
  conversation,
  first,
  onPress,
  onLongPress,
}: {
  conversation: Conversation;
  first: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const mutedColor = useThemeColor('muted');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onLongPress={onLongPress}
      className={`flex-row items-center gap-3 px-4 py-3 active:bg-surface-selected ${
        first ? '' : 'border-t border-border'
      }`}
    >
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface-selected">
        <Text className="text-xl">{conversation.assistant.emoji ?? '💬'}</Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="flex-1 text-base font-medium text-foreground" numberOfLines={1}>
            {conversation.title ?? conversation.assistant.name}
          </Text>
          <Text className="text-xs text-muted">{formatWhen(conversation.updated_at)}</Text>
        </View>
        {conversation.last_message ? (
          <Text className="mt-0.5 text-sm text-muted" numberOfLines={1}>
            {conversation.last_message}
          </Text>
        ) : null}
      </View>
      <CaretRight size={14} color={mutedColor} />
    </Pressable>
  );
}
