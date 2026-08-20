import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

export function formatPhone(e164: string): string {
  const parsed = parsePhoneNumberFromString(e164);

  return parsed?.formatInternational() ?? e164;
}

export function isE164(value: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(value);
}

export function digitsToE164(digits: string, defaultCountry: CountryCode = 'MX'): string | null {
  const trimmed = digits.trim();

  if (trimmed === '') {
    return null;
  }

  const withPlus = trimmed.startsWith('+') ? trimmed : `+${trimmed}`;
  const international = parsePhoneNumberFromString(withPlus);

  if (international?.isValid()) {
    return international.number;
  }

  const national = parsePhoneNumberFromString(trimmed, defaultCountry);

  return national?.isValid() ? national.number : null;
}
