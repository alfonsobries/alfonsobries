import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { useAuth } from '@/api/auth';
import { fetchLineSettings } from '@/api/line';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

export default function LineLiveScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ url?: string }>();
  const route = useApiRouter();
  const fetcher = useCallback(() => fetchLineSettings(route), [route]);
  const settings = useCachedResource(cacheKeys.lineSettings, fetcher);
  const [failed, setFailed] = useState(false);
  const panelUrl = params.url || settings.data?.number?.panel_url || 'https://privacynumber.io/';

  const openInBrowser = async () => {
    try {
      await WebBrowser.openAuthSessionAsync(panelUrl, 'alfonsobries://line');
    } catch {
      Alert.alert('Could not open the panel', 'Try again in a moment.');
    }
  };

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Stack.Screen.Title>Live call</Stack.Screen.Title>
      {failed ? (
        <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-background px-6">
          <Text className="text-center text-base text-muted">
            The provider panel blocked the in-app view. Open it in Safari — that is the only
            live-audio path they expose.
          </Text>
          <Button onPress={() => void openInBrowser()}>Open panel</Button>
        </SafeAreaView>
      ) : (
        <View className="flex-1 bg-background">
          <WebView
            source={{ uri: panelUrl }}
            mediaCapturePermissionGrantType="grant"
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            onError={() => setFailed(true)}
            onHttpError={() => setFailed(true)}
            style={{ flex: 1 }}
          />
        </View>
      )}
    </>
  );
}
