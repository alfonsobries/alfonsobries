import { router, usePathname, type Href } from 'expo-router';
import { useCallback } from 'react';

import { useAuth } from '@/api/auth';
import type { LineCall } from '@/api/line';
import { useLineChannel } from '@/hooks/use-line-channel';

/**
 * Raises the incoming-call screen when the line starts ringing and the
 * app is already open. Push covers the background/killed case.
 */
export function useLineIncoming(): void {
  const { user } = useAuth();
  const pathname = usePathname();

  const onCall = useCallback(
    (call: LineCall) => {
      if (user?.family_member !== 'alfonso') {
        return;
      }

      if (call.direction !== 'in' || call.status !== 'ringing') {
        return;
      }

      if (pathname.includes('/line/incoming')) {
        return;
      }

      router.push(`/line/incoming?call=${call.id}` as Href);
    },
    [pathname, user?.family_member],
  );

  useLineChannel({ onCall });
}
