import { Redirect, router, Stack, type Href } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/api/auth';
import { queueLineSend, sendLineMessage } from '@/api/line';
import { useApiRouter } from '@/api/router';
import { MessageComposer } from '@/components/line/MessageComposer';
import { Input } from '@/components/ui/Input';
import type { UploadedImage } from '@/hooks/use-image-upload';
import { digitsToE164, formatPhone, isE164 } from '@/lib/phone';
import { isOfflineError } from '@/offline/connectivity';

export default function LineComposeScreen() {
  const { user } = useAuth();
  const route = useApiRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [raw, setRaw] = useState('');
  const [sending, setSending] = useState(false);

  const e164 = isE164(raw.trim()) ? raw.trim() : digitsToE164(raw);

  const handleSend = async (
    body: string,
    attachments: UploadedImage[],
    scheduledAt: string | null,
  ): Promise<boolean> => {
    if (!e164) {
      Alert.alert('Check the number', 'That does not look like a valid phone number.');
      return false;
    }

    const clientKey = crypto.randomUUID();
    setSending(true);

    try {
      const sent = await sendLineMessage(route, {
        to: e164,
        body,
        client_key: clientKey,
        scheduled_at: scheduledAt ?? undefined,
        media_keys: attachments.map((item) => item.key),
      });
      router.replace(`/line/thread?contact=${sent.contact_id}` as Href);
      return true;
    } catch (error) {
      if (isOfflineError(error)) {
        queueLineSend(
          {
            to: e164,
            body,
            client_key: clientKey,
            scheduled_at: scheduledAt ?? undefined,
            media_keys: attachments.map((item) => item.key),
          },
          { dedupeKey: `line.send:${clientKey}` },
        );
        Alert.alert('Queued', 'It will send when you are back online.');
        return true;
      }

      Alert.alert('Could not send', 'Please try again.');
      return false;
    } finally {
      setSending(false);
    }
  };

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Stack.Screen.Title>New message</Stack.Screen.Title>
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <View className="flex-1 px-4 pt-4">
          <Input
            label="To"
            value={raw}
            onChangeText={setRaw}
            placeholder="+52 …"
            keyboardType="phone-pad"
            autoFocus
          />
          {e164 ? <Input label="Looks like" value={formatPhone(e164)} editable={false} /> : null}
        </View>
        <View style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
          <MessageComposer sending={sending} onSend={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
