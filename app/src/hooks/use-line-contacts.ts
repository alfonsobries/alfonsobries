import { useCallback, useRef } from 'react';

import { fetchLineThreads, updateLineContact, type LineThread } from '@/api/line';
import { useApiRouter } from '@/api/router';
import { phoneBookNames } from '@/lib/phone-contact';

/**
 * Fills missing line contact names from the iPhone address book. Never
 * overwrites a name already set.
 */
export function useLineContacts(): () => Promise<void> {
  const route = useApiRouter();
  const ran = useRef(false);

  return useCallback(async () => {
    if (ran.current) {
      return;
    }

    ran.current = true;

    const names = await phoneBookNames();

    if (names.size === 0) {
      return;
    }

    const threads: LineThread[] = await fetchLineThreads(route);

    await Promise.all(
      threads
        .filter((thread) => !thread.name && names.has(thread.e164))
        .map((thread) => updateLineContact(route, thread.id, { name: names.get(thread.e164) })),
    );
  }, [route]);
}
