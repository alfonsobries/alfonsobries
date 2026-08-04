import * as LocalAuthentication from 'expo-local-authentication';
import { Stack, useFocusEffect } from 'expo-router';
import { CheckCircle, CircleDashed, DeviceMobile } from 'phosphor-react-native';
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
  reviewPhoneReport,
  type FamilyActivity,
  type PhoneReport,
} from '@/api/family-time';
import { useApiRouter } from '@/api/router';
import { localDate } from '@/api/virtue';
import { formatMinutes, TimeClock } from '@/components/family-time/TimeClock';
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

// The family's time bank. The kids press a button when dad is on his phone
// instead of with them; every report he agrees with buys the family fifteen
// minutes together, which they spend on something from the list.
export default function FamilyTimeScreen() {
  const route = useApiRouter();

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

  const pending = reports.filter((report) => report.status === 'pending');
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
              { id: -Date.now(), family_member: member, date, status: 'pending', minutes: 0 },
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

  async function handleReview(report: PhoneReport, confirmed: boolean): Promise<void> {
    try {
      await reviewPhoneReport(route, report.id, confirmed);
      await refresh();
    } catch (error) {
      // Minutes are the API's to grant, so the answer waits for a connection.
      if (isOfflineError(error)) {
        Alert.alert('No connection', 'Answer it once you are back online.');
        return;
      }

      Alert.alert('Could not answer', 'Please try again in a moment.');
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

        {pending.length > 0 ? (
          <View className="gap-3">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
              Waiting for an answer
            </Text>
            {pending.map((report) => (
              <PendingReport
                key={report.id}
                report={report}
                onAnswer={(confirmed) => void handleReview(report, confirmed)}
              />
            ))}
          </View>
        ) : null}

        <View className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
            Is dad on his phone?
          </Text>
          <View className="flex-row gap-3">
            {KIDS.map((kid) => (
              <ReportButton
                key={kid.key}
                name={kid.name}
                done={reportedToday.has(kid.key as 'regina' | 'andres')}
                onPress={() => void handleReport(kid.key as 'regina' | 'andres')}
              />
            ))}
          </View>
          <Text className="px-1 text-xs text-muted">Once a day each.</Text>
        </View>

        <View className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
            Spend it on
          </Text>
          <View className="overflow-hidden rounded-3xl bg-surface">
            {activities.map((activity, index) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                affordable={minutes >= activity.cost_minutes}
                divided={index > 0}
                onPress={() => void handleRedeem(activity)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function PendingReport({
  report,
  onAnswer,
}: {
  report: PhoneReport;
  onAnswer: (confirmed: boolean) => void;
}) {
  const name = getPerson(report.family_member)?.name ?? report.family_member;

  return (
    <View className="gap-3 rounded-3xl bg-surface p-4">
      <Text className="text-base text-foreground">{name} says you were on your phone.</Text>
      <View className="flex-row gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="They are right"
          onPress={() => onAnswer(true)}
          className="flex-1 items-center rounded-2xl bg-primary py-3 active:opacity-80"
        >
          <Text className="text-sm font-semibold text-primary-foreground">
            They&apos;re right · +15 min
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="It was work"
          onPress={() => onAnswer(false)}
          className="flex-1 items-center rounded-2xl bg-surface-selected py-3 active:opacity-80"
        >
          <Text className="text-sm font-semibold text-foreground">It was work</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ReportButton({
  name,
  done,
  onPress,
}: {
  name: string;
  done: boolean;
  onPress: () => void;
}) {
  const accent = useThemeColor('primary-emphasis');
  const muted = useThemeColor('muted');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name} saw dad on his phone`}
      accessibilityState={{ disabled: done }}
      disabled={done}
      onPress={onPress}
      className={`flex-1 items-center gap-2 rounded-3xl bg-surface p-4 ${
        done ? 'opacity-50' : 'active:opacity-70'
      }`}
    >
      <DeviceMobile size={28} color={done ? muted : accent} weight="fill" />
      <Text className="text-base font-semibold text-foreground">{name}</Text>
      <Text className="text-xs text-muted">{done ? 'Sent today' : 'Tap to tell him'}</Text>
    </Pressable>
  );
}

function ActivityRow({
  activity,
  affordable,
  divided,
  onPress,
}: {
  activity: FamilyActivity;
  affordable: boolean;
  divided: boolean;
  onPress: () => void;
}) {
  const success = useThemeColor('success');
  const muted = useThemeColor('muted');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={activity.name}
      accessibilityState={{ disabled: !affordable }}
      disabled={!affordable}
      onPress={onPress}
      className={`flex-row items-center gap-3 p-3 ${divided ? 'border-t border-border' : ''} ${
        affordable ? 'active:opacity-70' : 'opacity-50'
      }`}
    >
      {activity.image_url ? (
        <View className="size-12 items-center justify-center overflow-hidden rounded-xl bg-surface-selected">
          <Illustration source={{ uri: activity.image_url }} />
        </View>
      ) : null}
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-medium text-foreground" numberOfLines={1}>
          {activity.name}
        </Text>
        <Text className="text-sm text-muted">{formatMinutes(activity.cost_minutes)}</Text>
      </View>
      {affordable ? (
        <CheckCircle size={22} color={success} weight="fill" />
      ) : (
        <CircleDashed size={22} color={muted} />
      )}
    </Pressable>
  );
}
