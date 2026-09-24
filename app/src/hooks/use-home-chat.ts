import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  fetchHomeMessage,
  fetchHomeMessages,
  type HomeMessage,
  isSettled,
  type OutgoingHomeMessage,
  sendHomeMessage,
} from '@/api/home';
import { useApiRouter } from '@/api/router';
import { uploadTempFile } from '@/api/uploads';
import type { UploadedImage } from '@/hooks/use-image-upload';
import { isOfflineError } from '@/offline/connectivity';
import { cacheKeys, readCache, writeCache } from '@/offline/store';

import { useHomeChannel } from './use-home-channel';

export type VoiceNote = {
  uri: string;
  durationMillis: number;
};

export type HomeDraft = {
  text: string;
  images: UploadedImage[];
  voiceNote: VoiceNote | null;
};

const CACHED_MESSAGES = 60;
const POLL_INTERVAL = 3000;

let localSequence = 0;

function newClientKey(): string {
  return `app-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Newest first: messages still on their way (negative local ids) on top, then
 * the server's by id.
 */
function ordered(messages: HomeMessage[]): HomeMessage[] {
  return [...messages].sort((a, b) => {
    const aLocal = a.id < 0;
    const bLocal = b.id < 0;

    if (aLocal !== bLocal) {
      return aLocal ? -1 : 1;
    }

    return aLocal ? a.id - b.id : b.id - a.id;
  });
}

function merge(current: HomeMessage[], incoming: HomeMessage[]): HomeMessage[] {
  const byId = new Map(current.map((message) => [message.id, message]));

  for (const message of incoming) {
    const optimistic = message.client_key
      ? current.find((entry) => entry.id < 0 && entry.client_key === message.client_key)
      : undefined;

    if (optimistic) {
      byId.delete(optimistic.id);
    }

    byId.set(message.id, message);
  }

  return ordered([...byId.values()]);
}

/**
 * The home chat's state: cache-first history with paging, optimistic sends
 * that survive a failed network (they stay as "unsent" with a retry), live
 * updates from the socket and polling while an answer is pending.
 */
export function useHomeChat(userId: number | null) {
  const route = useApiRouter();
  const [messages, setMessages] = useState<HomeMessage[]>(
    () => readCache<HomeMessage[]>(cacheKeys.homeChat) ?? [],
  );
  const [loaded, setLoaded] = useState(() => readCache(cacheKeys.homeChat) !== null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const drafts = useRef(new Map<string, HomeDraft>());

  useEffect(() => {
    writeCache(
      cacheKeys.homeChat,
      messages.filter((message) => message.id > 0).slice(0, CACHED_MESSAGES),
    );
  }, [messages]);

  const upsert = useCallback((incoming: HomeMessage) => {
    setMessages((current) => merge(current, [incoming]));
  }, []);

  useHomeChannel(userId, upsert);

  const refresh = useCallback(async () => {
    try {
      const page = await fetchHomeMessages(route);
      setMessages((current) => {
        const newestLoaded = page.data.at(-1)?.id ?? 0;
        // Keep what's on the device that the first page doesn't cover:
        // unsent messages and older pages already loaded.
        const kept = current.filter((message) => message.id < 0 || message.id < newestLoaded);

        return merge(kept, page.data);
      });
      setHasMore(page.has_more);
      setLoaded(true);
    } catch {
      // Offline or a blip: the cached history stays on screen.
      setLoaded(true);
    }
  }, [route]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refresh();
      }
    });

    return () => subscription.remove();
  }, [refresh]);

  const loadMore = useCallback(async () => {
    const oldest = messages.filter((message) => message.id > 0).at(-1);

    if (!hasMore || loadingMore || !oldest) {
      return;
    }

    setLoadingMore(true);
    try {
      const page = await fetchHomeMessages(route, oldest.id);
      setMessages((current) => merge(current, page.data));
      setHasMore(page.has_more);
    } catch {
      // The next scroll to the top retries.
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, messages, route]);

  // The socket is the fast path; this covers a dropped or unconfigured one.
  const pendingId =
    messages.find((message) => message.role === 'assistant' && message.status === 'pending')?.id ??
    null;

  useEffect(() => {
    if (!pendingId) {
      return;
    }

    const interval = setInterval(() => {
      void (async () => {
        try {
          const fresh = await fetchHomeMessage(route, pendingId);
          if (isSettled(fresh)) {
            upsert(fresh);
          }
        } catch {
          // Transient; the next tick retries.
        }
      })();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [pendingId, route, upsert]);

  const deliver = useCallback(
    async (clientKey: string, localId: number) => {
      const draft = drafts.current.get(clientKey);

      if (!draft) {
        return;
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === localId ? { ...message, status: 'sending', error: null } : message,
        ),
      );

      try {
        const audioPath = draft.voiceNote
          ? await uploadTempFile(route, draft.voiceNote.uri, 'audio/m4a', 'm4a')
          : null;

        const outgoing: OutgoingHomeMessage = {
          content: draft.text.trim() || null,
          image_paths: draft.images.map((image) => image.key),
          audio_path: audioPath,
          audio_duration: draft.voiceNote ? Math.round(draft.voiceNote.durationMillis) : null,
          client_key: clientKey,
        };

        const { message, reply } = await sendHomeMessage(route, outgoing);
        drafts.current.delete(clientKey);
        setMessages((current) => merge(current, [message, reply]));
      } catch (error) {
        setMessages((current) =>
          current.map((message) =>
            message.id === localId
              ? {
                  ...message,
                  status: 'unsent',
                  error: isOfflineError(error)
                    ? 'Sin conexión. Toca para reintentar.'
                    : 'No se pudo enviar. Toca para reintentar.',
                }
              : message,
          ),
        );
      }
    },
    [route],
  );

  const send = useCallback(
    (draft: HomeDraft) => {
      const clientKey = newClientKey();
      localSequence += 1;
      const localId = -localSequence;

      drafts.current.set(clientKey, draft);

      const optimistic: HomeMessage = {
        id: localId,
        role: 'user',
        content: draft.text.trim() || null,
        transcript: null,
        status: 'sending',
        error: null,
        source: 'app',
        client_key: clientKey,
        images: draft.images.map((image, index) => ({ id: index, url: image.localUri })),
        audio: draft.voiceNote
          ? { id: 0, url: draft.voiceNote.uri, duration: draft.voiceNote.durationMillis }
          : null,
        expenses: [],
        created_at: new Date().toISOString(),
      };

      setMessages((current) => ordered([optimistic, ...current]));
      void deliver(clientKey, localId);
    },
    [deliver],
  );

  const retry = useCallback(
    (message: HomeMessage) => {
      if (message.client_key && message.id < 0) {
        void deliver(message.client_key, message.id);
      }
    },
    [deliver],
  );

  const discard = useCallback((message: HomeMessage) => {
    if (message.client_key) {
      drafts.current.delete(message.client_key);
    }
    setMessages((current) => current.filter((entry) => entry.id !== message.id));
  }, []);

  /** Patch the expense cards in place after an edit, delete or undo. */
  const replaceExpense = useCallback(
    (expense: HomeMessage['expenses'][number] | { id: number }) => {
      setMessages((current) =>
        current.map((message) =>
          message.expenses.some((entry) => entry.id === expense.id)
            ? {
                ...message,
                expenses: message.expenses.map((entry) =>
                  entry.id === expense.id ? { ...entry, ...expense, action: entry.action } : entry,
                ),
              }
            : message,
        ),
      );
    },
    [],
  );

  const thinking = messages.some(
    (message) =>
      (message.role === 'user' && message.status === 'sending') ||
      (message.role === 'assistant' && message.status === 'pending'),
  );

  return {
    messages,
    loaded,
    hasMore,
    loadingMore,
    thinking,
    refresh,
    loadMore,
    send,
    retry,
    discard,
    replaceExpense,
  };
}
