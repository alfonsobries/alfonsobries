import { router, useLocalSearchParams } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  type Assistant,
  type ChatMessage,
  fetchAssistants,
  fetchConversation,
  fetchMessage,
  isSettled,
  sendMessage,
  startConversation,
} from '@/api/chat';
import { useApiRouter } from '@/api/router';
import { Composer } from '@/components/chat/Composer';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { useConversationChannel } from '@/hooks/use-conversation-channel';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { UploadedImage } from '@/hooks/use-image-upload';

export default function ChatThreadScreen() {
  const params = useLocalSearchParams<{ conversation?: string; assistant?: string }>();
  const route = useApiRouter();
  const insets = useSafeAreaInsets();
  const foregroundColor = useThemeColor('foreground');

  const initialConversationId = params.conversation ? Number(params.conversation) : null;
  const newAssistantId = params.assistant ? Number(params.assistant) : null;

  const [conversationId, setConversationId] = useState<number | null>(initialConversationId);
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [messages, setMessages] = useState<ChatMessage[] | null>(initialConversationId ? null : []);
  const [sending, setSending] = useState(false);

  const upsertMessage = useCallback((incoming: ChatMessage) => {
    setMessages((current) => {
      if (current === null) {
        return current;
      }
      if (current.some((message) => message.id === incoming.id)) {
        return current.map((message) => (message.id === incoming.id ? incoming : message));
      }
      return [...current, incoming];
    });
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        if (initialConversationId) {
          const detail = await fetchConversation(route, initialConversationId);
          setAssistant(detail.assistant);
          setMessages(detail.messages);
        } else if (newAssistantId) {
          const assistants = await fetchAssistants(route);
          setAssistant(assistants.find((entry) => entry.id === newAssistantId) ?? null);
        }
      } catch {
        Alert.alert('Could not open the chat', 'Please try again.');
        router.back();
      }
    })();
    // Params identify the screen instance; they don't change while it's open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Replies arrive on the conversation's private channel…
  useConversationChannel(conversationId, upsertMessage);

  // …with polling as the fallback while a reply is still pending.
  const pendingId = messages?.find((message) => message.status === 'pending')?.id ?? null;

  useEffect(() => {
    if (!pendingId) {
      return;
    }

    const interval = setInterval(() => {
      void (async () => {
        try {
          const fresh = await fetchMessage(route, pendingId);
          if (isSettled(fresh)) {
            upsertMessage(fresh);
          }
        } catch {
          // Transient; the next tick retries.
        }
      })();
    }, 3000);

    return () => clearInterval(interval);
  }, [pendingId, route, upsertMessage]);

  const handleSend = async (content: string, attachments: UploadedImage[]): Promise<boolean> => {
    if (!assistant) {
      return false;
    }

    const imagePaths = attachments.map((attachment) => attachment.key);

    setSending(true);
    try {
      if (conversationId) {
        const { user_message: userMessage, reply } = await sendMessage(
          route,
          conversationId,
          content || null,
          imagePaths,
        );
        upsertMessage(userMessage);
        upsertMessage(reply);
      } else {
        const detail = await startConversation(route, assistant.id, content || null, imagePaths);
        setConversationId(detail.id);
        setMessages(detail.messages);
      }
      return true;
    } catch {
      Alert.alert('Could not send', 'Please check your connection and try again.');
      return false;
    } finally {
      setSending(false);
    }
  };

  const inverted = messages === null ? [] : [...messages].reverse();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        className="flex-row items-center gap-2 border-b border-border px-2 pb-2"
        style={{ paddingTop: insets.top + 4 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-selected"
        >
          <CaretLeft size={22} color={foregroundColor} />
        </Pressable>
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="text-xl">{assistant?.emoji ?? '💬'}</Text>
          <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
            {assistant?.name ?? 'Chat'}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <FlatList
        className="flex-1"
        data={inverted}
        inverted
        keyExtractor={(message) => String(message.id)}
        renderItem={({ item }) => (
          <MessageBubble message={item} copyableOutput={assistant?.copyable_output ?? false} />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          messages !== null && assistant ? (
            // Inverted list, so this renders upside down without the flip.
            <View style={{ transform: [{ scaleY: -1 }] }} className="items-center px-8 pt-16">
              <Text className="text-5xl">{assistant.emoji ?? '💬'}</Text>
              <Text className="mt-3 text-lg font-semibold text-foreground">{assistant.name}</Text>
              {assistant.description ? (
                <Text className="mt-1 text-center text-base text-muted">
                  {assistant.description}
                </Text>
              ) : null}
            </View>
          ) : null
        }
      />

      <View className="px-4 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
        <Composer sending={sending} onSend={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}
