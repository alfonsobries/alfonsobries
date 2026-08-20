import { Redirect, router, Stack, useLocalSearchParams, type Href } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { Phone, User } from 'phosphor-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

import { useAuth } from '@/api/auth';
import {
  contactLabel,
  fetchLineThread,
  queueLineSend,
  sendLineMessage,
  type LineContact,
  type LineMessage,
} from '@/api/line';
import { useApiRouter } from '@/api/router';
import { MessageBubble } from '@/components/line/MessageBubble';
import { MessageComposer } from '@/components/line/MessageComposer';
import { useLineChannel } from '@/hooks/use-line-channel';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatPhone } from '@/lib/phone';
import { isOfflineError } from '@/offline/connectivity';
import { cacheKeys, readCache, writeCache } from '@/offline/store';

type CachedThread = {
  contact: LineContact;
  messages: LineMessage[];
};

export default function LineThreadScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ contact?: string }>();
  const contactId = params.contact ? Number(params.contact) : NaN;
  const route = useApiRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tint = useThemeColor('primary-emphasis');
  const cacheKey = Number.isFinite(contactId) ? cacheKeys.lineThread(String(contactId)) : null;
  const cached = cacheKey ? readCache<CachedThread>(cacheKey) : null;
  const [contact, setContact] = useState<LineContact | null>(cached?.contact ?? null);
  const [messages, setMessages] = useState<LineMessage[] | null>(cached?.messages ?? null);
  const [sending, setSending] = useState(false);
  const hadCache = useRef(cached !== null);

  const upsert = useCallback((incoming: LineMessage) => {
    setMessages((current) => {
      if (current === null) {
        return current;
      }

      const byId = current.findIndex((message) => message.id === incoming.id);
      if (byId >= 0) {
        const next = [...current];
        next[byId] = incoming;
        return next;
      }

      const byKey = incoming.client_key
        ? current.findIndex((message) => message.client_key === incoming.client_key)
        : -1;
      if (byKey >= 0) {
        const next = [...current];
        next[byKey] = incoming;
        return next;
      }

      return [incoming, ...current];
    });
  }, []);

  useEffect(() => {
    if (!Number.isFinite(contactId) || !cacheKey) {
      return;
    }

    void (async () => {
      try {
        const detail = await fetchLineThread(route, contactId);
        setContact(detail.contact);
        setMessages(detail.messages);
        writeCache(cacheKey, { contact: detail.contact, messages: detail.messages });
      } catch (error) {
        if (!hadCache.current) {
          Alert.alert(
            'Could not open thread',
            isOfflineError(error) ? 'You are offline right now.' : 'Please try again.',
          );
        }
      }
    })();
  }, [cacheKey, contactId, route]);

  useEffect(() => {
    if (cacheKey && contact && messages) {
      writeCache(cacheKey, { contact, messages });
    }
  }, [cacheKey, contact, messages]);

  useLineChannel({
    onMessage: (incoming) => {
      if (incoming.contact_id === contactId) {
        upsert(incoming);
      }
    },
  });

  const handleSend = async (
    body: string,
    attachments: { key: string; localUri: string }[] = [],
  ): Promise<boolean> => {
    if (!contact) {
      return false;
    }

    const clientKey = crypto.randomUUID();
    const optimistic: LineMessage = {
      id: Date.now() * -1,
      contact_id: contact.id,
      contact,
      client_key: clientKey,
      direction: 'out',
      body,
      media_urls: attachments.map((item) => item.localUri),
      segments: 1,
      status: 'queued',
      failure_code: null,
      cost_usd: null,
      otp_code: null,
      scheduled_at: null,
      sent_at: new Date().toISOString(),
      delivered_at: null,
      read_at: null,
    };

    setSending(true);
    upsert(optimistic);

    try {
      const sent = await sendLineMessage(route, {
        to: contact.e164,
        body,
        client_key: clientKey,
        media_keys: attachments.map((item) => item.key),
      });
      upsert(sent);
      return true;
    } catch (error) {
      if (isOfflineError(error)) {
        queueLineSend(
          {
            to: contact.e164,
            body,
            client_key: clientKey,
            media_keys: attachments.map((item) => item.key),
          },
          { dedupeKey: `line.send:${clientKey}` },
        );
        return true;
      }

      upsert({ ...optimistic, status: 'failed' });
      Alert.alert('Could not send', 'Please try again in a moment.');
      return false;
    } finally {
      setSending(false);
    }
  };

  const handleRetry = (message: LineMessage) => {
    if (!contact) {
      return;
    }

    void handleSend(message.body);
  };

  const title = contact ? contactLabel(contact) : 'Thread';
  const inverted = useMemo(() => messages ?? [], [messages]);

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Stack.Screen.Title>{title}</Stack.Screen.Title>
      <Stack.Screen
        options={{
          headerRight: () =>
            contact ? (
              <View className="flex-row items-center gap-3">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Call"
                  onPress={() =>
                    router.push(`/line/dialer?to=${encodeURIComponent(contact.e164)}` as Href)
                  }
                  hitSlop={8}
                >
                  <Phone size={22} color={tint} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Contact details"
                  onPress={() => router.push(`/line/contact?contact=${contact.id}` as Href)}
                  hitSlop={8}
                >
                  <User size={22} color={tint} />
                </Pressable>
              </View>
            ) : null,
        }}
      />

      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        {contact && contact.name ? (
          <Text className="px-4 pt-2 text-center text-xs text-muted">
            {formatPhone(contact.e164)}
          </Text>
        ) : null}
        <FlatList
          className="flex-1"
          contentContainerClassName="gap-3 px-4 py-4"
          inverted
          data={inverted}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <MessageBubble message={item} onRetry={handleRetry} />}
          onEndReached={() => {
            const oldest = messages?.[messages.length - 1];
            if (!oldest || !Number.isFinite(contactId) || !cacheKey) {
              return;
            }

            void (async () => {
              try {
                const older = await fetchLineThread(route, contactId, oldest.id);
                if (older.messages.length === 0) {
                  return;
                }

                setMessages((current) => {
                  const existing = new Set((current ?? []).map((message) => message.id));
                  return [
                    ...(current ?? []),
                    ...older.messages.filter((message) => !existing.has(message.id)),
                  ];
                });
              } catch {
                // Older pages can wait.
              }
            })();
          }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-base text-muted">No messages in this thread yet.</Text>
            </View>
          }
        />
        <View style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
          <MessageComposer sending={sending} onSend={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
