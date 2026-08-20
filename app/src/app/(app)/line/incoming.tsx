import { Redirect, router, Stack, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { useAuth } from '@/api/auth';
import {
  fetchLineCalls,
  hangupLineCall,
  queueLineSend,
  sendLineMessage,
  type LineCall,
} from '@/api/line';
import { useApiRouter } from '@/api/router';
import { IncomingCallCard } from '@/components/line/IncomingCallCard';
import { useLineChannel } from '@/hooks/use-line-channel';
import { isOfflineError } from '@/offline/connectivity';

const QUICK_REPLIES = [
  "Can't pick up — everything OK?",
  'In a meeting, text me.',
  "I'll call you back.",
];

export default function LineIncomingScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ call?: string }>();
  const callId = params.call ? Number(params.call) : NaN;
  const route = useApiRouter();
  const [call, setCall] = useState<LineCall | null>(null);

  useEffect(() => {
    if (!Number.isFinite(callId)) {
      return;
    }

    void (async () => {
      try {
        const calls = await fetchLineCalls(route);
        setCall(calls.find((item) => item.id === callId) ?? null);
      } catch {
        setCall(null);
      }
    })();
  }, [callId, route]);

  useLineChannel({
    onCall: (incoming) => {
      if (incoming.id === callId) {
        setCall(incoming);
      }
    },
  });

  const handleHangup = async () => {
    if (!call) {
      return;
    }

    try {
      const next = await hangupLineCall(route, call.id);
      setCall(next);
    } catch (error) {
      Alert.alert(
        'Could not hang up',
        isOfflineError(error) ? 'You are offline right now.' : 'Please try again.',
      );
    }
  };

  const sendReply = async (body: string) => {
    if (!call?.contact) {
      return;
    }

    try {
      await sendLineMessage(route, { to: call.contact.e164, body });
    } catch (error) {
      if (isOfflineError(error)) {
        queueLineSend(
          { to: call.contact.e164, body, client_key: crypto.randomUUID() },
          { dedupeKey: `line.send:incoming:${call.id}` },
        );
      } else {
        Alert.alert('Could not send', 'Please try again.');
        return;
      }
    }

    router.replace(`/line/thread?contact=${call.contact.id}` as Href);
  };

  const handleReply = () => {
    Alert.alert('Reply with SMS', undefined, [
      ...QUICK_REPLIES.map((body) => ({
        text: body,
        onPress: () => {
          void sendReply(body);
        },
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View className="flex-1 bg-background">
        {call ? (
          <IncomingCallCard
            call={call}
            onHangup={() => {
              void handleHangup();
            }}
            onIgnore={() => {
              router.push('/line/live' as Href);
            }}
            onReply={handleReply}
          />
        ) : null}
      </View>
    </>
  );
}
