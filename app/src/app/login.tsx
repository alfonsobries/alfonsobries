import { AppleLogo } from 'phosphor-react-native';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/api/auth';
import FaceSimple from '@/assets/face-simple.svg';

const APPLE_CANCEL_CODE = 'ERR_REQUEST_CANCELED';

export default function LoginScreen() {
  const { signInWithApple } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAppleSignIn = async () => {
    setBusy(true);
    setError(null);

    try {
      await signInWithApple();
    } catch (caught) {
      if ((caught as { code?: string }).code !== APPLE_CANCEL_CODE) {
        setError('Sign in failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <SafeAreaView className="flex-1 items-center justify-between px-8 py-12">
        <View className="flex-1 items-center justify-center gap-8">
          <FaceSimple width={184} height={173} />
          <View className="items-center gap-3">
            <Text className="text-center text-4xl font-bold text-primary-foreground">
              Alfonso&apos;s App
            </Text>
            <Text className="text-center text-base text-primary-foreground opacity-70">
              A little home for me and my family.
            </Text>
          </View>
        </View>

        <View className="w-full gap-3">
          {error ? <Text className="text-center text-sm text-danger">{error}</Text> : null}

          {Platform.OS === 'ios' ? (
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={handleAppleSignIn}
              className={`h-[52px] flex-row items-center justify-center gap-2 rounded-full bg-neutral-950 ${busy ? 'opacity-60' : 'active:opacity-80'}`}
            >
              {busy ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <AppleLogo size={20} color="#ffffff" weight="fill" />
                  <Text className="text-base font-medium text-neutral-50">Sign in with Apple</Text>
                </>
              )}
            </Pressable>
          ) : (
            <Text className="text-center text-sm text-primary-foreground opacity-70">
              Sign in with Apple is available on iOS.
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
