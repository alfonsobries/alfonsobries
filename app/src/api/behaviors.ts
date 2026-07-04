import { apiClient } from './client';
import { useApiRouter } from './router';

type ApiRoute = ReturnType<typeof useApiRouter>;

// The kids whose behaviors are tracked. Kept in sync with
// `User::KID_MEMBERS` on the API.
export type KidMember = 'regina' | 'andres';

export type Behavior = {
  id: number;
  family_member: KidMember;
  name: string;
  points: number;
  image_url: string | null;
};

export type IllustrationStatus = 'pending' | 'generating' | 'completed' | 'failed';

export type BehaviorIllustration = {
  id: number;
  name: string;
  status: IllustrationStatus;
  path: string | null;
  url: string | null;
  error: string | null;
};

export type BehaviorLogEntry = {
  id: number;
  family_member: KidMember;
  behavior: {
    id: number;
    name: string;
    image_url: string | null;
  };
  points: number;
  affected_mood: boolean;
  mood_emoji: string | null;
  logged_by: {
    family_member: string | null;
    name: string | null;
  };
  created_at: string;
};

export type BehaviorPayload = {
  name: string;
  points: number;
  image_path?: string | null;
};

export async function fetchBehaviors(route: ApiRoute, member: KidMember): Promise<Behavior[]> {
  const { data } = await apiClient.get<{ data: Behavior[] }>(
    route('api.kids.behaviors.index', { member }),
  );

  return data.data;
}

export async function createBehavior(
  route: ApiRoute,
  member: KidMember,
  payload: BehaviorPayload,
): Promise<Behavior> {
  const { data } = await apiClient.post<{ data: Behavior }>(route('api.behaviors.store'), {
    family_member: member,
    ...payload,
  });

  return data.data;
}

export async function updateBehavior(
  route: ApiRoute,
  behavior: number,
  payload: Partial<BehaviorPayload>,
): Promise<Behavior> {
  const { data } = await apiClient.patch<{ data: Behavior }>(
    route('api.behaviors.update', { behavior }),
    payload,
  );

  return data.data;
}

export async function deleteBehavior(route: ApiRoute, behavior: number): Promise<void> {
  await apiClient.delete(route('api.behaviors.destroy', { behavior }));
}

export async function fetchBehaviorLogs(
  route: ApiRoute,
  member?: KidMember,
): Promise<BehaviorLogEntry[]> {
  const { data } = await apiClient.get<{ data: BehaviorLogEntry[] }>(
    route('api.behavior-logs.index', member ? { member } : undefined),
  );

  return data.data;
}

export async function logBehavior(
  route: ApiRoute,
  behavior: number,
  payload: { affected_mood: boolean; mood_emoji?: string | null },
): Promise<BehaviorLogEntry> {
  const { data } = await apiClient.post<{ data: BehaviorLogEntry }>(
    route('api.behaviors.logs.store', { behavior }),
    payload,
  );

  return data.data;
}

export async function deleteBehaviorLog(route: ApiRoute, behaviorLog: number): Promise<void> {
  await apiClient.delete(route('api.behavior-logs.destroy', { behaviorLog }));
}

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

/**
 * Ask the API to generate an illustration for a behavior name and poll until
 * it settles. Resolves with the completed illustration; throws when the
 * generation fails or takes too long.
 */
export async function generateIllustration(
  route: ApiRoute,
  name: string,
): Promise<BehaviorIllustration> {
  const { data } = await apiClient.post<{ data: BehaviorIllustration }>(
    route('api.behavior-illustrations.store'),
    { name },
  );

  let illustration = data.data;
  const startedAt = Date.now();

  while (illustration.status === 'pending' || illustration.status === 'generating') {
    if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
      throw new Error('The illustration is taking too long. Try again.');
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const { data: poll } = await apiClient.get<{ data: BehaviorIllustration }>(
      route('api.behavior-illustrations.show', { behaviorIllustration: illustration.id }),
    );
    illustration = poll.data;
  }

  if (illustration.status === 'failed') {
    throw new Error(illustration.error ?? 'The illustration could not be generated.');
  }

  return illustration;
}
