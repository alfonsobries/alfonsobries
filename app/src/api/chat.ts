import { apiClient } from './client';
import { useApiRouter } from './router';

type ApiRoute = ReturnType<typeof useApiRouter>;

// A chat "mini app": a system prompt plus presentation hints, assigned
// per family member on the API (managed from Nova). Illustrator assistants
// reply with a generated image instead of text.
export type AssistantKind = 'chat' | 'illustrator';

export type Assistant = {
  id: number;
  slug: string;
  kind: AssistantKind;
  name: string;
  emoji: string | null;
  description: string | null;
  copyable_output: boolean;
};

export type ChatMessageStatus = 'pending' | 'completed' | 'failed';

export type ChatAttachment = {
  id: number;
  url: string;
};

export type ChatMessage = {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string | null;
  status: ChatMessageStatus;
  error: string | null;
  attachments: ChatAttachment[];
  created_at: string;
};

export type Conversation = {
  id: number;
  title: string | null;
  /** Who stars in the drawings; only set on illustrator conversations. */
  members: string[] | null;
  assistant: Assistant;
  updated_at: string;
  last_message?: string | null;
};

export type ConversationDetail = Conversation & {
  messages: ChatMessage[];
};

export async function fetchAssistants(route: ApiRoute): Promise<Assistant[]> {
  const { data } = await apiClient.get<{ data: Assistant[] }>(route('api.assistants.index'));

  return data.data;
}

export async function fetchConversations(route: ApiRoute): Promise<Conversation[]> {
  const { data } = await apiClient.get<{ data: Conversation[] }>(route('api.conversations.index'));

  return data.data;
}

export async function fetchConversation(
  route: ApiRoute,
  conversation: number,
): Promise<ConversationDetail> {
  const { data } = await apiClient.get<{ data: ConversationDetail }>(
    route('api.conversations.show', { conversation }),
  );

  return data.data;
}

export async function startConversation(
  route: ApiRoute,
  assistantId: number,
  content: string | null,
  imagePaths: string[] = [],
  members: string[] = [],
): Promise<ConversationDetail> {
  const { data } = await apiClient.post<{ data: ConversationDetail }>(
    route('api.conversations.store'),
    { assistant_id: assistantId, content, image_paths: imagePaths, members },
  );

  return data.data;
}

export async function sendMessage(
  route: ApiRoute,
  conversation: number,
  content: string | null,
  imagePaths: string[] = [],
): Promise<{ user_message: ChatMessage; reply: ChatMessage }> {
  const { data } = await apiClient.post<{
    data: { user_message: ChatMessage; reply: ChatMessage };
  }>(route('api.conversations.messages.store', { conversation }), {
    content,
    image_paths: imagePaths,
  });

  return data.data;
}

export async function fetchMessage(route: ApiRoute, chatMessage: number): Promise<ChatMessage> {
  const { data } = await apiClient.get<{ data: ChatMessage }>(
    route('api.chat-messages.show', { chatMessage }),
  );

  return data.data;
}

export async function deleteConversation(route: ApiRoute, conversation: number): Promise<void> {
  await apiClient.delete(route('api.conversations.destroy', { conversation }));
}

export function isSettled(message: ChatMessage): boolean {
  return message.status === 'completed' || message.status === 'failed';
}
