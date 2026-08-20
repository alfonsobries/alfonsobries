import { Redirect, Stack } from 'expo-router';
import { Phone } from 'phosphor-react-native';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/api/auth';
import { placeLineCall } from '@/api/line';
import { useApiRouter } from '@/api/router';
import { Keypad } from '@/components/line/Keypad';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useThemeColor } from '@/hooks/use-theme-color';
import { digitsToE164, formatPhone } from '@/lib/phone';
import { isOfflineError, useIsOnline } from '@/offline/connectivity';

type CallerId = 'own' | 'rotate' | 'hide';

export default function LineDialerScreen() {
  const { user } = useAuth();
  const route = useApiRouter();
  const online = useIsOnline();
  const playTint = useThemeColor('primary-foreground');
  const [digits, setDigits] = useState('');
  const [mask, setMask] = useState<CallerId>('own');
  const [placing, setPlacing] = useState(false);

  const e164 = digitsToE164(digits);
  const canCall = online && !placing && e164 !== null;

  const handleCall = async () => {
    if (!e164) {
      Alert.alert('Check the number', 'That does not look like a valid phone number.');
      return;
    }

    if (!online) {
      Alert.alert('You are offline', 'Calling needs a connection.');
      return;
    }

    setPlacing(true);
    try {
      await placeLineCall(route, { to: e164, callerid_mask: mask });
      Alert.alert(
        'Calling',
        'The destination should ring. Live audio still lives on the provider panel until that spike is done.',
      );
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

        <Keypad value={digits} onChange={setDigits} />

        <View className="items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Place call"
            disabled={!canCall}
            onPress={() => {
              void handleCall();
            }}
            className={`size-20 items-center justify-center rounded-full ${canCall ? 'bg-success' : 'bg-surface-selected'}`}
          >
            <Phone size={32} color={playTint} weight="fill" />
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}
