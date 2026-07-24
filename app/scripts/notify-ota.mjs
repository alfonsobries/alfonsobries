#!/usr/bin/env node
// Pings the API's signed OTA webhook after `eas update` succeeds, so the
// devices get a push that a new version is ready. Best-effort: a publish
// should never fail because the notification couldn't be sent.
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(here, '..');

// pnpm scripts don't load .env; read the few keys we need from it directly.
function envFromDotfile() {
  try {
    return Object.fromEntries(
      readFileSync(resolve(appDir, '.env'), 'utf8')
        .split('\n')
        .map((line) => line.match(/^([A-Z0-9_]+)=("?)(.*)\2$/))
        .filter(Boolean)
        .map((match) => [match[1], match[3]]),
    );
  } catch {
    return {};
  }
}

const env = { ...envFromDotfile(), ...process.env };

const secret = env.EAS_NOTIFY_SECRET;
const url = env.OTA_NOTIFY_URL ?? 'https://api.alfonsobries.com/api/ota/published';

if (!secret) {
  console.warn('notify-ota: EAS_NOTIFY_SECRET is not set — skipping the update notification.');
  process.exit(0);
}

const channelFlag = process.argv.indexOf('--channel');
const body = JSON.stringify({
  message: env.OTA_NOTIFY_MESSAGE ?? 'Production release',
  channel: channelFlag !== -1 ? process.argv[channelFlag + 1] : undefined,
});

try {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Ota-Signature': createHmac('sha256', secret).update(body).digest('hex'),
    },
    body,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.warn(`notify-ota: the API answered ${response.status}`, payload);
    process.exit(0);
  }

  console.log(`notify-ota: notified ${payload.devices ?? '?'} device(s).`);
} catch (error) {
  console.warn('notify-ota: could not reach the API —', error.message);
  process.exit(0);
}
