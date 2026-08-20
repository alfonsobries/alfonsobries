import { useEffect, useRef } from 'react';

import { createEcho } from '@/api/echo';
import type { LineCall, LineMessage, LineVoicemail } from '@/api/line';

type LineChannelHandlers = {
  onMessage?: (message: LineMessage) => void;
  onCall?: (call: LineCall) => void;
  onVoicemail?: (voicemail: LineVoicemail) => void;
};

/**
 * Live private-line traffic on the Reverb `line` channel. No-ops when
 * sockets aren't configured — screens fall back to refresh-on-focus.
 */
export function useLineChannel(handlers: LineChannelHandlers): void {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const echo = createEcho();

    if (!echo) {
      return;
    }

    echo
      .private('line')
      .listen('LineMessageUpdated', (payload: LineMessage) => {
        handlersRef.current.onMessage?.(payload);
      })
      .listen('LineCallUpdated', (payload: LineCall) => {
        handlersRef.current.onCall?.(payload);
      })
      .listen('LineVoicemailUpdated', (payload: LineVoicemail) => {
        handlersRef.current.onVoicemail?.(payload);
      });

    return () => {
      echo.leave('line');
      echo.disconnect();
    };
  }, []);
}
