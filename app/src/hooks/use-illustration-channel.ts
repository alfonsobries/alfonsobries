import { useEffect, useRef } from 'react';

import type { BehaviorIllustration } from '@/api/behaviors';
import { createEcho } from '@/api/echo';

/**
 * Listen for a behavior illustration settling (generated or failed) on its
 * private Reverb channel. No-ops without an id or when sockets aren't
 * configured — the caller's polling fallback covers those cases.
 */
export function useIllustrationChannel(
  illustrationId: number | null,
  onUpdate: (illustration: BehaviorIllustration) => void,
): void {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!illustrationId) {
      return;
    }

    const echo = createEcho();
    if (!echo) {
      return;
    }

    const channelName = `behavior-illustration.${illustrationId}`;
    echo
      .private(channelName)
      .listen('BehaviorIllustrationUpdated', (payload: BehaviorIllustration) =>
        onUpdateRef.current(payload),
      );

    return () => {
      echo.leave(channelName);
      echo.disconnect();
    };
  }, [illustrationId]);
}
