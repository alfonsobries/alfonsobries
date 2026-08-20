import { Redirect, router, Stack, type Href } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { AddressBook } from 'phosphor-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/api/auth';
import { queueLineSend, sendLineMessage, updateLineContact } from '@/api/line';
import { useApiRouter } from '@/api/router';
import { MessageComposer } from '@/components/line/MessageComposer';
import { Input } from '@/components/ui/Input';
import type { UploadedImage } from '@/hooks/use-image-upload';
import { useThemeColor } from '@/hooks/use-theme-color';
import { digitsToE164, formatPhone, isE164 } from '@/lib/phone';
import { pickPhoneContact } from '@/lib/phone-contact';
import { isOfflineError } from '@/offline/connectivity';

export default function LineComposeScreen() {
  const { user } = useAuth();
  const route = useApiRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tint = useThemeColor('primary-emphasis');
  const [raw, setRaw] = useState('');
  const [pickedName, setPickedName] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const e164 = isE164(raw.trim()) ? raw.trim() : digitsToE164(raw);

  const handlePick = async () => {
    const picked = await pickPhoneContact();

    if (!picked) {
      return;
    }

    setRaw(picked.e164);
    setPickedName(picked.name);
  };

  const handleSend = async (body: string, attachments: UploadedImage[]): Promise<boolean> => {
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
        media_keys: attachments.map((item) => item.key),
      });

      if (pickedName && sent.contact_id) {
        await updateLineContact(route, sent.contact_id, { name: pickedName }).catch(
          () => undefined,
        );
      }

      router.replace(`/line/thread?contact=${sent.contact_id}` as Href);
      return true;
    } catch (error) {
      if (isOfflineError(error)) {
        queueLineSend(
          {
            to: e164,
            body,
            client_key: clientKey,
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
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pick a contact"
              onPress={() => {
                void handlePick();
              }}
              hitSlop={8}
            >
              <AddressBook size={22} color={tint} />
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <View className="flex-1 gap-3 px-4 pt-4">
          <Input
            label="To"
            value={raw}
            onChangeText={(value) => {
              setRaw(value);
              setPickedName(null);
            }}
            placeholder="Name or number"
            keyboardType="phone-pad"
            autoFocus
          />
          {pickedName ? <Input label="Name" value={pickedName} editable={false} /> : null}
          {e164 && !pickedName ? (
            <Input label="Number" value={formatPhone(e164)} editable={false} />
          ) : null}
        </View>
        <View style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
          <MessageComposer sending={sending} onSend={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
