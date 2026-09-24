import { apiClient } from './client';
import type { Expense } from './expenses';
import { useApiRouter } from './router';

type ApiRoute = ReturnType<typeof useApiRouter>;

export type HomeMessageStatus = 'pending' | 'completed' | 'failed';

/**
 * A turn of the home chat. `sending` and `unsent` only exist on the device:
 * an optimistic message on its way, or one whose send failed and can be
 * retried.
 */
export type HomeMessage = {
  id: number;
  role: 'user' | 'assistant';
  content: string | null;
  transcript: string | null;
  status: HomeMessageStatus | 'sending' | 'unsent';
  error: string | null;
  source: 'app' | 'telegram';
  client_key: string | null;
  images: { id: number; url: string }[];
  audio: { id: number; url: string; duration: number | null } | null;
  expenses: (Expense & { action: 'created' | 'updated' | 'deleted' })[];
  created_at: string;
};

export type HomeMessagePage = {
  data: HomeMessage[];
  has_more: boolean;
};

export type OutgoingHomeMessage = {
  content: string | null;
  image_paths: string[];
  audio_path: string | null;
  audio_duration: number | null;
  client_key: string;
};

export type TelegramLink = {
  linked: boolean;
  username: string | null;
  url?: string;
};

export async function fetchHomeMessages(
  route: ApiRoute,
  before?: number,
): Promise<HomeMessagePage> {
  const { data } = await apiClient.get<HomeMessagePage>(route('api.home.messages.index'), {
    params: { before },
  });

  return data;
}

export async function fetchHomeMessage(route: ApiRoute, homeMessage: number): Promise<HomeMessage> {
  const { data } = await apiClient.get<{ data: HomeMessage }>(
    route('api.home.messages.show', { homeMessage }),
  );

  return data.data;
}

export async function sendHomeMessage(
  route: ApiRoute,
  message: OutgoingHomeMessage,
): Promise<{ message: HomeMessage; reply: HomeMessage }> {
  const { data } = await apiClient.post<{ data: { message: HomeMessage; reply: HomeMessage } }>(
    route('api.home.messages.store'),
    message,
    // Transcribing happens after this returns, but uploads of the
    // attachments' records can take a moment on a slow connection.
    { timeout: 30000 },
  );

  return data.data;
}

export async function fetchTelegramLink(route: ApiRoute): Promise<TelegramLink> {
  const { data } = await apiClient.get<{ data: TelegramLink }>(route('api.telegram.show'));

  return data.data;
}

export async function createTelegramLink(route: ApiRoute): Promise<TelegramLink> {
  const { data } = await apiClient.post<{ data: TelegramLink }>(route('api.telegram.store'));

  return data.data;
}

export async function unlinkTelegram(route: ApiRoute): Promise<TelegramLink> {
  const { data } = await apiClient.delete<{ data: TelegramLink }>(route('api.telegram.destroy'));

  return data.data;
}

export function isSettled(message: HomeMessage): boolean {
  return message.status === 'completed' || message.status === 'failed';
}
