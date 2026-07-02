import * as Device from 'expo-device';
import { Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { ApiStatusCard } from '@/components/api-status-card';
import { HintRow } from '@/components/hint-row';
import { useStatus } from '@/hooks/use-status';

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <Text className="text-sm font-medium text-foreground">use browser devtools</Text>;
  }
  if (Device.isDevice) {
    return (
      <Text className="text-sm font-medium text-foreground">
        shake device or press <Text className="font-mono text-xs">m</Text> in terminal
      </Text>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <Text className="text-sm font-medium text-foreground">
      press <Text className="font-mono text-xs">{shortcut}</Text>
    </Text>
  );
}

export default function HomeScreen() {
  const { status, isLoading, error, refetch } = useStatus();
  const greeting = status?.message ?? "Welcome to Alfonso's App";

  return (
    <View className="flex-1 flex-row justify-center bg-background">
      <SafeAreaView className="w-full max-w-[800px] flex-1 items-center gap-4 px-6 pb-[66px]">
        <View className="flex-1 items-center justify-center gap-6 px-6">
          <AnimatedIcon />
          <Text className="text-center text-5xl font-semibold leading-[52px] text-foreground">
            {greeting}
          </Text>
        </View>

        <ApiStatusCard status={status} isLoading={isLoading} error={error} onRetry={refetch} />

        <Text className="font-mono text-xs uppercase text-muted">get started</Text>

        <View className="w-full gap-4 self-stretch rounded-3xl bg-surface px-4 py-6">
          <HintRow title="Try editing" hint={<Text className="font-mono text-xs">src/app/index.tsx</Text>} />
          <HintRow title="Dev tools" hint={getDevMenuHint()} />
          <HintRow title="Fresh start" hint={<Text className="font-mono text-xs">npm run reset-project</Text>} />
        </View>
      </SafeAreaView>
    </View>
  );
}
