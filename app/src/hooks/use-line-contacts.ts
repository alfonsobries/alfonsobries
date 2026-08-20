import * as Contacts from 'expo-contacts';
import { useCallback, useRef } from 'react';

import { fetchLineThreads, updateLineContact, type LineThread } from '@/api/line';
import { useApiRouter } from '@/api/router';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

function toE164(value: string): string | null {
  const parsed = parsePhoneNumberFromString(value, 'MX');

  return parsed?.isValid() ? parsed.number : (parsePhoneNumberFromString(value)?.number ?? null);
}

/**
 * Fills missing line contact names from the iPhone address book. Never
 * overwrites a name Alfonso already set.
 */
export function useLineContacts(): () => Promise<void> {
  const route = useApiRouter();
  const ran = useRef(false);

  return useCallback(async () => {
    if (ran.current) {
      return;
    }

    ran.current = true;

    const permission = await Contacts.requestPermissionsAsync();

    if (permission.status !== 'granted') {
      return;
    }

    const book = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
    });

    const names = new Map<string, string>();

    for (const person of book.data) {
      const name = person.name?.trim();
      if (!name) {
        continue;
      }

      for (const phone of person.phoneNumbers ?? []) {
        if (!phone.number) {
          continue;
        }

        const e164 = toE164(phone.number);
        if (e164) {
          names.set(e164, name);
        }
      }
    }

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
