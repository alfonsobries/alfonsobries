import type { KidMember } from './behaviors';
import { apiClient } from './client';
import { useApiRouter } from './router';

type ApiRoute = ReturnType<typeof useApiRouter>;

export type ChoreStatus = 'done' | 'approved' | 'rejected';

export type Chore = {
  id: number;
  family_member: KidMember;
  name: string;
  points: number;
  image_url: string | null;
  today: {
    log_id: number;
    status: ChoreStatus;
  } | null;
};

export type ChoreLogEntry = {
  id: number;
  family_member: KidMember;
  chore: {
    id: number;
    name: string;
    image_url: string | null;
  };
  date: string;
  status: ChoreStatus;
  points: number;
};

export type Reward = {
  id: number;
  family_member: KidMember;
  name: string;
  cost: number;
  image_url: string | null;
  achieved_at: string | null;
};

export type RewardsSummary = {
  rewards: Reward[];
  balance: number;
};

export type ChorePayload = {
  name: string;
  points: number;
  image_path?: string | null;
};

export type RewardPayload = {
  name: string;
  cost: number;
  image_path?: string | null;
};

export async function fetchChores(route: ApiRoute, member: KidMember): Promise<Chore[]> {
  const { data } = await apiClient.get<{ data: Chore[] }>(
    route('api.kids.chores.index', { member }),
  );

  return data.data;
}

export async function createChore(
  route: ApiRoute,
  member: KidMember,
  payload: ChorePayload,
): Promise<Chore> {
  const { data } = await apiClient.post<{ data: Chore }>(route('api.chores.store'), {
    family_member: member,
    ...payload,
  });

  return data.data;
}

export async function updateChore(
  route: ApiRoute,
  chore: number,
  payload: Partial<ChorePayload>,
): Promise<Chore> {
  const { data } = await apiClient.patch<{ data: Chore }>(
    route('api.chores.update', { chore }),
    payload,
  );

  return data.data;
}

export async function deleteChore(route: ApiRoute, chore: number): Promise<void> {
  await apiClient.delete(route('api.chores.destroy', { chore }));
}

/** The kid marks a chore done for today. */
export async function checkChore(route: ApiRoute, chore: number): Promise<ChoreLogEntry> {
  const { data } = await apiClient.post<{ data: ChoreLogEntry }>(
    route('api.chores.logs.store', { chore }),
  );

  return data.data;
}

/** Uncheck an accidental tap — only works while a parent hasn't reviewed. */
export async function uncheckChore(route: ApiRoute, choreLog: number): Promise<void> {
  await apiClient.delete(route('api.chore-logs.destroy', { choreLog }));
}

export async function fetchTodayChoreLogs(
  route: ApiRoute,
  member?: KidMember,
): Promise<ChoreLogEntry[]> {
  const { data } = await apiClient.get<{ data: ChoreLogEntry[] }>(
    route('api.chore-logs.index', member ? { member } : undefined),
  );

  return data.data;
}

export async function reviewChoreLog(
  route: ApiRoute,
  choreLog: number,
  approved: boolean,
): Promise<ChoreLogEntry> {
  const { data } = await apiClient.post<{ data: ChoreLogEntry }>(
    route('api.chore-logs.review', { choreLog }),
    { approved },
  );

  return data.data;
}

export async function fetchRewards(route: ApiRoute, member: KidMember): Promise<RewardsSummary> {
  const { data } = await apiClient.get<{ data: Reward[]; balance: number }>(
    route('api.kids.rewards.index', { member }),
  );

  return { rewards: data.data, balance: data.balance };
}

export async function createReward(
  route: ApiRoute,
  member: KidMember,
  payload: RewardPayload,
): Promise<Reward> {
  const { data } = await apiClient.post<{ data: Reward }>(route('api.rewards.store'), {
    family_member: member,
    ...payload,
  });

  return data.data;
}

export async function updateReward(
  route: ApiRoute,
  reward: number,
  payload: Partial<RewardPayload>,
): Promise<Reward> {
  const { data } = await apiClient.patch<{ data: Reward }>(
    route('api.rewards.update', { reward }),
    payload,
  );

  return data.data;
}

export async function deleteReward(route: ApiRoute, reward: number): Promise<void> {
  await apiClient.delete(route('api.rewards.destroy', { reward }));
}

export async function redeemReward(route: ApiRoute, reward: number): Promise<Reward> {
  const { data } = await apiClient.post<{ data: Reward }>(route('api.rewards.redeem', { reward }));

  return data.data;
}
