import * as AppleAuthentication from 'expo-apple-authentication';
import { useState } from 'react';
import { ActivityIndicator, Platform, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/api/auth';
import FaceSimple from '@/assets/face-simple.svg';

const APPLE_CANCEL_CODE = 'ERR_REQUEST_CANCELED';

export default function LoginScreen() {
  const { signInWithApple } = useAuth();
  const colorScheme = useColorScheme();
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
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1 items-center justify-between px-8 py-12">
        <View className="flex-1 items-center justify-center gap-8">
          <FaceSimple width={184} height={173} />
          <View className="items-center gap-3">
            <Text className="text-center text-4xl font-bold text-foreground">Alfonso&apos;s App</Text>
            <Text className="text-center text-base text-muted">
              A little home for me and my family.
            </Text>
          </View>
        </View>

        <View className="w-full gap-3">
          {error ? <Text className="text-center text-sm text-danger">{error}</Text> : null}

          {Platform.OS === 'ios' ? (
            busy ? (
              <View className="h-[52px] items-center justify-center">
                <ActivityIndicator />
              </View>
            ) : (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={
                  colorScheme === 'dark'
                    ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                    : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={26}
                style={{ width: '100%', height: 52 }}
                onPress={handleAppleSignIn}
              />
            )
          ) : (
            <Text className="text-center text-sm text-muted">
              Sign in with Apple is available on iOS.
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
