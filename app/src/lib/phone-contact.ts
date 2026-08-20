import { Contact, ContactField, requestPermissionsAsync } from 'expo-contacts';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export type PickedPhoneContact = {
  name: string;
  e164: string;
};

export function toE164(value: string): string | null {
  const parsed = parsePhoneNumberFromString(value, 'MX');

  return parsed?.isValid() ? parsed.number : (parsePhoneNumberFromString(value)?.number ?? null);
}

function displayName(details: {
  fullName?: string | null;
  givenName?: string | null;
  familyName?: string | null;
}): string {
  const joined = [details.givenName, details.familyName].filter(Boolean).join(' ').trim();

  return details.fullName?.trim() || joined;
}

function firstE164(phones: { number?: string }[] | undefined): string | null {
  for (const phone of phones ?? []) {
    if (!phone.number) {
      continue;
    }

    const e164 = toE164(phone.number);

    if (e164) {
      return e164;
    }
  }

  return null;
}

export async function pickPhoneContact(): Promise<PickedPhoneContact | null> {
  const permission = await requestPermissionsAsync();

  if (permission.status !== 'granted') {
    return null;
  }

  const contact = await Contact.presentPicker();

  if (!contact) {
    return null;
  }

  const details = await contact.getDetails([
    ContactField.FULL_NAME,
    ContactField.GIVEN_NAME,
    ContactField.FAMILY_NAME,
    ContactField.PHONES,
  ]);

  const e164 = firstE164(details.phones);

  if (!e164) {
    return null;
  }

  return {
    name: displayName(details) || e164,
    e164,
  };
}

export async function phoneBookNames(): Promise<Map<string, string>> {
  const permission = await requestPermissionsAsync();
  const names = new Map<string, string>();

  if (permission.status !== 'granted') {
    return names;
  }

  const rows = await Contact.getAllDetails([
    ContactField.FULL_NAME,
    ContactField.GIVEN_NAME,
    ContactField.FAMILY_NAME,
    ContactField.PHONES,
  ]);

  for (const details of rows) {
    const name = displayName(details);

    if (!name) {
      continue;
    }

    for (const phone of details.phones ?? []) {
      if (!phone.number) {
        continue;
      }

      const e164 = toE164(phone.number);

      if (e164 && !names.has(e164)) {
        names.set(e164, name);
      }
    }
  }

  return names;
}
