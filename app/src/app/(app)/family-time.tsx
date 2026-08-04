import * as LocalAuthentication from 'expo-local-authentication';
import { Stack, useFocusEffect } from 'expo-router';
import { CheckCircle, DeviceMobile, Gift } from 'phosphor-react-native';
import { useCallback } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { getPerson, isKid, PEOPLE } from '@/api/family';
import {
  fetchFamilyTime,
  fetchPhoneReports,
  phoneReportDedupeKey,
  queuePhoneReport,
  redeemFamilyActivity,
  reportPhone,
  type FamilyActivity,
  type PhoneReport,
} from '@/api/family-time';
import { useApiRouter } from '@/api/router';
import { localDate } from '@/api/virtue';
import { formatMinutes, PriceClocks, TimeClock } from '@/components/family-time/TimeClock';
import { PersonAvatar } from '@/components/family/PersonAvatar';
import { Illustration } from '@/components/ui/Illustration';
import { useThemeColor } from '@/hooks/use-theme-color';
import { isOfflineError } from '@/offline/connectivity';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

const KIDS = PEOPLE.filter((person) => isKid(person.key));

type FamilyTime = {
  activities: FamilyActivity[];
  minutes: number;
  cleanDays: number;
  reports: PhoneReport[];
};

// The family's time bank. The kids press their own face when dad is on his
// phone instead of with them, and it buys the family fifteen minutes together
// right away — the phone is in their hands, so pressing it is the whole story.
// Neither of them reads yet, so the screen leans on faces, art and the clock.
export default function FamilyTimeScreen() {
  const route = useApiRouter();
  const accent = useThemeColor('primary-emphasis');

  const fetcher = useCallback(async (): Promise<FamilyTime> => {
    const [summary, history] = await Promise.all([
      fetchFamilyTime(route),
      fetchPhoneReports(route),
    ]);

    return { ...summary, reports: history.reports };
  }, [route]);

  const bank = useCachedResource<FamilyTime>(cacheKeys.familyTime, fetcher);
  const { refresh, update } = bank;

  const activities = bank.data?.activities ?? [];
  const minutes = bank.data?.minutes ?? 0;
  const cleanDays = bank.data?.cleanDays ?? 0;
  const reports = bank.data?.reports ?? [];

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const reportedToday = new Set(
    reports.filter((report) => report.date === localDate()).map((report) => report.family_member),
  );

  async function handleReport(member: 'regina' | 'andres'): Promise<void> {
    const date = localDate();

    // The button reads as sent the moment it is pressed, online or not.
    update((current) =>
      current === null
        ? current
        : {
            ...current,
            reports: [
              { id: -Date.now(), family_member: member, date, minutes: 15 },
              ...current.reports,
            ],
          },
    );

    try {
      await reportPhone(route, member);
      await refresh();
    } catch (error) {
      if (isOfflineError(error)) {
        queuePhoneReport({ member }, { dedupeKey: phoneReportDedupeKey(member, date) });
        return;
      }

      await refresh();
      Alert.alert('Could not send it', 'Please try again in a moment.');
    }
  }

  async function handleRedeem(activity: FamilyActivity): Promise<void> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm it's you to cash the minutes in",
      cancelLabel: 'Cancel',
    });

    if (!result.success) {
      return;
    }

    try {
      await redeemFamilyActivity(route, activity.id);
      Alert.alert('Time to go 🎉', activity.name);
      await refresh();
    } catch (error) {
      if (isOfflineError(error)) {
        Alert.alert('No connection', 'Cash it in once you are back online.');
        return;
      }

      Alert.alert('Not yet', 'There are not enough minutes saved up.');
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Family time' }} />

      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 p-4"
      >
        <View className="items-center gap-3 rounded-3xl bg-surface p-6">
          <TimeClock minutes={minutes} />
          <Text className="text-2xl font-bold text-foreground">{formatMinutes(minutes)}</Text>
          <Text className="text-center text-sm text-muted">
            {minutes === 0 ? 'Nothing saved up right now.' : 'Saved up for something together.'}
          </Text>
          {cleanDays > 0 ? (
            <Text className="text-center text-xs text-muted">
              {cleanDays === 1 ? '1 day' : `${cleanDays} days`} without a report
            </Text>
          ) : null}
        </View>

        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <DeviceMobile size={18} color={accent} weight="fill" />
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
              Is dad on his phone?
            </Text>
          </View>
          <View className="flex-row gap-3">
            {KIDS.map((kid) => (
              <ReportButton
                key={kid.key}
                person={kid.key as 'regina' | 'andres'}
                done={reportedToday.has(kid.key as 'regina' | 'andres')}
                onPress={() => void handleReport(kid.key as 'regina' | 'andres')}
              />
            ))}
          </View>
          <Text className="px-1 text-xs text-muted">
            Once a day each — it counts the moment they press.
          </Text>
        </View>

        <View className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
            Spend it on
          </Text>
          <View className="flex-row flex-wrap">
            {activities.map((activity) => (
              <View key={activity.id} className="w-1/2 p-1.5">
                <ActivityCard
                  activity={activity}
                  affordable={minutes >= activity.cost_minutes}
                  onPress={() => void handleRedeem(activity)}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function ReportButton({
  person,
  done,
  onPress,
}: {
  person: 'regina' | 'andres';
  done: boolean;
  onPress: () => void;
}) {
  const success = useThemeColor('success');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${getPerson(person)?.name} saw dad on his phone`}
      accessibilityState={{ disabled: done }}
      disabled={done}
      onPress={onPress}
      className={`flex-1 items-center gap-2 rounded-3xl bg-surface p-4 ${
        done ? 'opacity-40' : 'active:opacity-70'
      }`}
    >
      <View className="h-24 items-center justify-center">
        <PersonAvatar person={person} width={96} height={96} />
      </View>
      {done ? <CheckCircle size={28} color={success} weight="fill" /> : null}
    </Pressable>
  );
}

function ActivityCard({
  activity,
  affordable,
  onPress,
}: {
  activity: FamilyActivity;
  affordable: boolean;
  onPress: () => void;
}) {
  const accent = useThemeColor('primary-emphasis');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={activity.name}
      accessibilityState={{ disabled: !affordable }}
      disabled={!affordable}
      onPress={onPress}
      className={`items-center gap-2 rounded-3xl bg-surface p-3 ${
        affordable ? 'active:opacity-70' : 'opacity-40'
      }`}
    >
      <View className="size-24 items-center justify-center overflow-hidden rounded-2xl bg-surface-selected">
        {activity.image_url ? (
          <Illustration source={{ uri: activity.image_url }} />
        ) : (
          <Gift size={32} color={accent} weight="fill" />
        )}
      </View>
      <PriceClocks minutes={activity.cost_minutes} />
      <Text className="text-center text-sm text-muted" numberOfLines={1}>
        {activity.name}
      </Text>
    </Pressable>
  );
}
