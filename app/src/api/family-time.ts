import { defineOfflineMutation } from '@/offline/queue';

import type { KidMember } from './behaviors';
import { apiClient } from './client';
import { useApiRouter } from './router';

type ApiRoute = ReturnType<typeof useApiRouter>;

export type PhoneReportStatus = 'pending' | 'confirmed' | 'work';

export type PhoneReport = {
  id: number;
  family_member: KidMember;
  date: string;
  status: PhoneReportStatus;
  /** What this report added to the bank — zero until it is confirmed. */
  minutes: number;
};

export type FamilyActivity = {
  id: number;
  name: string;
  cost_minutes: number;
  image_url: string | null;
};

export type FamilyTimeSummary = {
  activities: FamilyActivity[];
  minutes: number;
  /** Days in a row with nothing confirmed. */
  cleanDays: number;
};

export async function fetchFamilyTime(route: ApiRoute): Promise<FamilyTimeSummary> {
  const { data } = await apiClient.get<{
    data: FamilyActivity[];
    minutes: number;
    clean_days: number;
  }>(route('api.family-activities.index'));

  return { activities: data.data, minutes: data.minutes, cleanDays: data.clean_days };
}

/** Cash the minutes in — the family is doing this together now. */
export async function redeemFamilyActivity(
  route: ApiRoute,
  familyActivity: number,
): Promise<number> {
  const { data } = await apiClient.post<{ minutes: number }>(
    route('api.family-activities.redeem', { familyActivity }),
  );

  return data.minutes;
}

export async function fetchPhoneReports(
  route: ApiRoute,
): Promise<{ reports: PhoneReport[]; minutes: number }> {
  const { data } = await apiClient.get<{ data: PhoneReport[]; minutes: number }>(
    route('api.phone-reports.index'),
  );

  return { reports: data.data, minutes: data.minutes };
}

/** A kid says dad is on his phone. One a day each. */
export async function reportPhone(route: ApiRoute, member: KidMember): Promise<PhoneReport> {
  const { data } = await apiClient.post<{ data: PhoneReport }>(route('api.phone-reports.store'), {
    family_member: member,
  });

  return data.data;
}

export async function reviewPhoneReport(
  route: ApiRoute,
  phoneReport: number,
  confirmed: boolean,
): Promise<PhoneReport> {
  const { data } = await apiClient.post<{ data: PhoneReport }>(
    route('api.phone-reports.review', { phoneReport }),
    { confirmed },
  );

  return data.data;
}

/**
 * Telling dad he is on his phone is exactly the moment there may be no wi-fi —
 * in the car, at a park — so it records locally and replays later. One a day
 * each, which the dedupe key mirrors so a second press never queues twice.
 */
export const queuePhoneReport = defineOfflineMutation<{ member: KidMember }>(
  'phone-reports.store',
  async ({ member }, route) => {
    await reportPhone(route, member);
  },
);

export function phoneReportDedupeKey(member: KidMember, date: string): string {
  return `phone-reports.store:${member}:${date}`;
}
