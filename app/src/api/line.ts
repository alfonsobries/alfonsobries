import { defineOfflineMutation } from '@/offline/queue';

import { apiClient } from './client';
import { useApiRouter } from './router';

type ApiRoute = ReturnType<typeof useApiRouter>;

export type LineContact = {
  id: number;
  e164: string;
  name: string | null;
  notes: string | null;
  blocked: boolean;
  favorite: boolean;
};

export type LineMessageStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'received';

export type LineMessage = {
  id: number;
  contact_id: number;
  contact?: LineContact | null;
  client_key: string | null;
  direction: 'in' | 'out';
  body: string;
  media_urls: string[];
  segments: number;
  status: LineMessageStatus;
  failure_code: string | null;
  cost_usd: number | null;
  otp_code: string | null;
  scheduled_at: string | null;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
};

export type LineCall = {
  id: number;
  contact_id: number;
  contact: LineContact | null;
  direction: 'in' | 'out';
  status: 'ringing' | 'answered' | 'completed' | 'missed' | 'failed';
  answered_by: 'ai' | 'voicemail' | null;
  started_at: string;
  answered_at: string | null;
  ended_at: string | null;
  duration_sec: number;
  has_recording: boolean;
  cost_usd: number | null;
  seen_at: string | null;
  voicemail: LineVoicemail | null;
};

export type LineVoicemail = {
  id: number;
  contact_id: number;
  contact: LineContact | null;
  call_id: number | null;
  has_audio: boolean;
  transcript: string | null;
  translation: string | null;
  summary: string | null;
  sentiment: string | null;
  duration_sec: number | null;
  received_at: string;
  heard_at: string | null;
};

export type LineNumber = {
  id: number;
  e164: string;
  display: string | null;
  status: string;
  billing_period: string | null;
  renews_at: string | null;
  auto_renew: boolean;
  ai_enabled: boolean;
  ai_config: LineAiConfig | null;
  on_off: LineQuietHours | null;
  usage: Record<string, unknown> | null;
  balance_usd: number | null;
  panel_url: string | null;
  synced_at: string | null;
};

export type LineQuietHours = {
  enabled?: boolean;
  start?: string;
  end?: string;
  timezone?: string;
};

export type LineAiConfig = {
  addons?: string[];
  auto_pickup?: {
    enabled?: boolean;
    after_rings?: number;
    script?: string;
    language?: string;
    voice?: string;
  };
  screening?: { enabled?: boolean };
  translator?: { enabled?: boolean; target_language?: string };
  voicemail_summary?: { enabled?: boolean; include_sentiment?: boolean };
};

export type LineOverview = {
  number: LineNumber | null;
  unread_messages: number;
  unseen_missed_calls: number;
  unheard_voicemails: number;
};

export type LineThread = LineContact & {
  unread_count: number;
  last_message: LineMessage | null;
  last_call: LineCall | null;
};

export type LineThreadDetail = {
  contact: LineContact;
  messages: LineMessage[];
  has_more: boolean;
};

export type LineSettings = {
  number: LineNumber | null;
};

export function lineUnreadTotal(overview: LineOverview | null): number {
  if (!overview) {
    return 0;
  }

  return overview.unread_messages + overview.unseen_missed_calls + overview.unheard_voicemails;
}

export function contactLabel(contact: Pick<LineContact, 'name' | 'e164'>): string {
  return contact.name?.trim() || contact.e164;
}

export async function fetchLineOverview(route: ApiRoute): Promise<LineOverview> {
  const { data } = await apiClient.get<{ data: LineOverview }>(route('api.line.overview'));

  return data.data;
}

export async function fetchLineThreads(route: ApiRoute, query?: string): Promise<LineThread[]> {
  const { data } = await apiClient.get<{ data: LineThread[] }>(route('api.line.threads.index'), {
    params: query ? { q: query } : undefined,
  });

  return data.data;
}

export async function fetchLineThread(
  route: ApiRoute,
  contactId: number,
  before?: number,
): Promise<LineThreadDetail> {
  const { data } = await apiClient.get<{ data: LineThreadDetail }>(
    route('api.line.threads.show', { lineContact: contactId }),
    { params: before ? { before } : undefined },
  );

  return data.data;
}

export async function sendLineMessage(
  route: ApiRoute,
  payload: {
    to: string;
    body: string;
    client_key?: string;
    scheduled_at?: string;
    media_keys?: string[];
  },
): Promise<LineMessage> {
  const { data } = await apiClient.post<{ data: LineMessage }>(
    route('api.line.messages.store'),
    payload,
  );

  return data.data;
}

export const queueLineSend = defineOfflineMutation<{
  to: string;
  body: string;
  client_key: string;
  scheduled_at?: string;
  media_keys?: string[];
}>('line.send', async (payload, route) => {
  await sendLineMessage(route, payload);
});

export async function fetchLineCalls(route: ApiRoute): Promise<LineCall[]> {
  const { data } = await apiClient.get<{ data: LineCall[] }>(route('api.line.calls.index'));

  return data.data;
}

export async function placeLineCall(
  route: ApiRoute,
  payload: { to: string; callerid_mask: 'own' | 'rotate' | 'hide'; recording_enabled?: boolean },
): Promise<LineCall> {
  const { data } = await apiClient.post<{ data: LineCall }>(route('api.line.calls.store'), payload);

  return data.data;
}

export async function hangupLineCall(route: ApiRoute, callId: number): Promise<LineCall> {
  const { data } = await apiClient.post<{ data: LineCall }>(
    route('api.line.calls.hangup', { lineCall: callId }),
  );

  return data.data;
}

export async function markLineCallsSeen(route: ApiRoute): Promise<void> {
  await apiClient.post(route('api.line.calls.seen'));
}

export async function fetchLineCallRecording(route: ApiRoute, callId: number): Promise<string> {
  const { data } = await apiClient.get<{ data: { url: string } }>(
    route('api.line.calls.recording', { lineCall: callId }),
  );

  return data.data.url;
}

export async function fetchLineVoicemails(route: ApiRoute): Promise<LineVoicemail[]> {
  const { data } = await apiClient.get<{ data: LineVoicemail[] }>(
    route('api.line.voicemails.index'),
  );

  return data.data;
}

export async function fetchLineVoicemailAudio(
  route: ApiRoute,
  voicemailId: number,
): Promise<string> {
  const { data } = await apiClient.get<{ data: { url: string } }>(
    route('api.line.voicemails.audio', { lineVoicemail: voicemailId }),
  );

  return data.data.url;
}

export async function deleteLineVoicemail(route: ApiRoute, voicemailId: number): Promise<void> {
  await apiClient.delete(route('api.line.voicemails.destroy', { lineVoicemail: voicemailId }));
}

export async function markLineVoicemailHeard(
  route: ApiRoute,
  voicemailId: number,
): Promise<LineVoicemail> {
  const { data } = await apiClient.post<{ data: LineVoicemail }>(
    route('api.line.voicemails.heard', { lineVoicemail: voicemailId }),
  );

  return data.data;
}

export async function updateLineContact(
  route: ApiRoute,
  contactId: number,
  payload: Partial<Pick<LineContact, 'name' | 'notes' | 'blocked' | 'favorite'>>,
): Promise<LineContact> {
  const { data } = await apiClient.patch<{ data: LineContact }>(
    route('api.line.contacts.update', { lineContact: contactId }),
    payload,
  );

  return data.data;
}

export async function fetchLineSettings(route: ApiRoute): Promise<LineSettings> {
  const { data } = await apiClient.get<{ data: LineSettings }>(route('api.line.settings.show'));

  return data.data;
}

export async function updateLineSettings(
  route: ApiRoute,
  payload: { auto_renew?: boolean; ai?: LineAiConfig; on_off?: LineQuietHours },
): Promise<LineSettings> {
  const { data } = await apiClient.patch<{ data: LineSettings }>(
    route('api.line.settings.update'),
    payload,
  );

  return data.data;
}
