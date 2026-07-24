import { apiClient } from './client';
import { useApiRouter } from './router';

type ApiRoute = ReturnType<typeof useApiRouter>;

export type AiModelKind = 'chat' | 'image';

export type AiModelOption = {
  id: string;
  label: string;
  provider: string;
  /** Human cost tier: $, $$ or $$$. */
  cost: string;
  /** One-line human comparison ("Cheapest and fast — plenty for…"). */
  blurb: string;
  recommended: boolean;
};

export type AiModelGroup = {
  /** Cheapest first, as ordered by the API. */
  models: AiModelOption[];
  active: string;
};

export type AiModelSettings = Record<AiModelKind, AiModelGroup>;

export async function fetchAiModels(route: ApiRoute): Promise<AiModelSettings> {
  const { data } = await apiClient.get<{ data: AiModelSettings }>(route('api.ai-models.index'));

  return data.data;
}

export async function updateAiModel(
  route: ApiRoute,
  kind: AiModelKind,
  id: string,
): Promise<AiModelSettings> {
  const { data } = await apiClient.put<{ data: AiModelSettings }>(route('api.ai-models.update'), {
    kind,
    id,
  });

  return data.data;
}
