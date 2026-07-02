import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/api/auth';
import Avatar from '@/assets/me.svg';
import { ApiStatusCard } from '@/components/api-status-card';
import { Button } from '@/components/ui/Button';
import { useStatus } from '@/hooks/use-status';

export default function HomeScreen() {
  const { status, isLoading, error, refetch } = useStatus();
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const firstName = user?.name?.split(' ')[0];
  const greeting = firstName ? `Hey ${firstName}` : (status?.message ?? "Welcome to Alfonso's App");

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <View className="flex-1 flex-row justify-center bg-background">
      <SafeAreaView className="w-full max-w-[800px] flex-1 items-center gap-4 px-6 pb-[66px]">
        <View className="flex-1 items-center justify-center gap-6 px-6">
          <Animated.View entering={FadeIn.duration(500)}>
            <Avatar width={168} height={220} />
          </Animated.View>
          <Text className="text-center text-5xl font-semibold leading-[52px] text-foreground">
            {greeting}
          </Text>
        </View>

        <ApiStatusCard status={status} isLoading={isLoading} error={error} onRetry={refetch} />

        <Button variant="outline" fullWidth loading={signingOut} onPress={handleSignOut}>
          Sign out
        </Button>
      </SafeAreaView>
    </View>
  );
}
