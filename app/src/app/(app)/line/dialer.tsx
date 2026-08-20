import { Redirect, router, Stack, type Href } from 'expo-router';
import { Phone } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/api/auth';
import { fetchLineCalls, hangupLineCall, placeLineCall, type LineCall } from '@/api/line';
import { contactLabel } from '@/api/line';
import { useApiRouter } from '@/api/router';
import { Keypad } from '@/components/line/Keypad';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Switch';
import { useLineChannel } from '@/hooks/use-line-channel';
import { useThemeColor } from '@/hooks/use-theme-color';
import { digitsToE164, formatPhone } from '@/lib/phone';
import { isOfflineError, useIsOnline } from '@/offline/connectivity';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

type CallerId = 'own' | 'rotate' | 'hide';

export default function LineDialerScreen() {
  const { user } = useAuth();
  const route = useApiRouter();
  const online = useIsOnline();
  const playTint = useThemeColor('primary-foreground');
  const [digits, setDigits] = useState('');
  const [mask, setMask] = useState<CallerId>('own');
  const [record, setRecord] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [active, setActive] = useState<LineCall | null>(null);
  const fetcher = useCallback(() => fetchLineCalls(route), [route]);
  const recents = useCachedResource<LineCall[]>(cacheKeys.lineCalls, fetcher);

  const e164 = digitsToE164(digits);
  const canCall = online && !placing && e164 !== null && active === null;

  useLineChannel({
    onCall: (call) => {
      if (active && call.id === active.id) {
        setActive(call);
      }
    },
  });

  const handleCall = async (to: string) => {
    if (!online) {
      Alert.alert('You are offline', 'Calling needs a connection.');
      return;
    }

    setPlacing(true);
    try {
      const call = await placeLineCall(route, {
        to,
        callerid_mask: mask,
        recording_enabled: record,
      });
      setActive(call);
      router.push('/line/live' as Href);
    } catch (error) {
      Alert.alert(
        'Could not place the call',
        isOfflineError(error) ? 'You are offline right now.' : 'Please try again.',
      );
    } finally {
      setPlacing(false);
    }
  };

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  const recentPeople = (recents.data ?? [])
    .filter((call) => call.contact)
    .filter(
      (call, index, list) =>
        list.findIndex((item) => item.contact_id === call.contact_id) === index,
    )
    .slice(0, 6);

  return (
    <>
      <Stack.Screen.Title>Keypad</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-6 px-4 pb-16 pt-4"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center gap-2 pt-4">
          <Text className="text-center text-4xl font-semibold text-foreground">
            {digits.length > 0 ? formatPhone(e164 ?? `+${digits}`) : ' '}
          </Text>
          {active ? <Text className="text-sm capitalize text-muted">{active.status}</Text> : null}
          {!online ? <Text className="text-sm text-muted">Calling needs a connection.</Text> : null}
        </View>

        <SegmentedControl
          value={mask}
          onChange={setMask}
          options={[
            { value: 'own', label: 'My number' },
            { value: 'rotate', label: 'Rotate' },
            { value: 'hide', label: 'Hide' },
          ]}
        />

        <View className="flex-row items-center justify-between rounded-3xl bg-surface px-4 py-3">
          <Text className="text-base text-foreground">Record this call</Text>
          <Switch value={record} onValueChange={setRecord} />
        </View>

        {recentPeople.length > 0 ? (
          <View className="gap-2">
            <Text className="text-sm text-muted">Recents</Text>
            <View className="flex-row flex-wrap gap-2">
              {recentPeople.map((call) => (
                <Pressable
                  key={call.contact_id}
                  accessibilityRole="button"
                  onPress={() => {
                    if (call.contact) {
                      setDigits(call.contact.e164.replace(/^\+/, ''));
                    }
                  }}
                  className="rounded-full bg-surface px-3 py-2"
                >
                  <Text className="text-sm text-foreground">
                    {call.contact ? contactLabel(call.contact) : ''}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <Keypad value={digits} onChange={setDigits} />

        <View className="items-center gap-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Place call"
            disabled={!canCall}
            onPress={() => {
              if (e164) {
                void handleCall(e164);
              }
            }}
            className={`size-20 items-center justify-center rounded-full ${canCall ? 'bg-success' : 'bg-surface-selected'}`}
          >
            <Phone size={32} color={playTint} weight="fill" />
          </Pressable>
          {active ? (
            <Button
              variant="outline"
              onPress={() => {
                void hangupLineCall(route, active.id).then((call) => setActive(call));
              }}
            >
              Hang up
            </Button>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}
