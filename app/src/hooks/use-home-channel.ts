import { useEffect, useRef } from 'react';

import { createEcho } from '@/api/echo';
import type { HomeMessage } from '@/api/home';

/**
 * Listen for new and settled turns of a person's home chat, wherever they
 * came from (this device, another one, or Telegram). No-ops when sockets
 * aren't configured; the chat's polling fallback covers that.
 */
export function useHomeChannel(
  userId: number | null,
  onMessage: (message: HomeMessage) => void,
): void {
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const echo = createEcho();
    if (!echo) {
      return;
    }

    const channelName = `home.${userId}`;
    echo
      .private(channelName)
      .listen('.home.message', (payload: HomeMessage) => onMessageRef.current(payload));

    return () => {
      echo.leave(channelName);
      echo.disconnect();
    };
  }, [userId]);
}
