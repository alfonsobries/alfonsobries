import { apiClient } from './client';
import { useApiRouter } from './router';

type ApiRoute = ReturnType<typeof useApiRouter>;

// An illustration kept in the family gallery. The API copies the image out of
// its chat message, so favorites survive deleting the conversation.
export type FavoriteIllustration = {
  id: number;
  chat_message_id: number | null;
  prompt: string | null;
  members: string[] | null;
  url: string | null;
  created_at: string;
};

export async function fetchFavoriteIllustrations(route: ApiRoute): Promise<FavoriteIllustration[]> {
  const { data } = await apiClient.get<{ data: FavoriteIllustration[] }>(
    route('api.illustration-favorites.index'),
  );

  return data.data;
}

export async function addFavoriteIllustration(
  route: ApiRoute,
  chatMessageId: number,
): Promise<FavoriteIllustration> {
  const { data } = await apiClient.post<{ data: FavoriteIllustration }>(
    route('api.illustration-favorites.store'),
    { chat_message_id: chatMessageId },
  );

  return data.data;
}

export async function removeFavoriteIllustration(
  route: ApiRoute,
  favoriteIllustration: number,
): Promise<void> {
  await apiClient.delete(route('api.illustration-favorites.destroy', { favoriteIllustration }));
}
