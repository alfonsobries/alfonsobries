import { useEffect, useRef } from 'react';

import type { ChatMessage } from '@/api/chat';
import { createEcho } from '@/api/echo';

/**
 * Listen for assistant replies settling (completed or failed) on the
 * conversation's private Reverb channel. No-ops without an id or when
 * sockets aren't configured — the caller's polling fallback covers those.
 */
export function useConversationChannel(
  conversationId: number | null,
  onUpdate: (message: ChatMessage) => void,
): void {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const echo = createEcho();
    if (!echo) {
      return;
    }

    const channelName = `conversation.${conversationId}`;
    echo
      .private(channelName)
      .listen('ChatMessageUpdated', (payload: ChatMessage) => onUpdateRef.current(payload));

    return () => {
      echo.leave(channelName);
      echo.disconnect();
    };
  }, [conversationId]);
}
