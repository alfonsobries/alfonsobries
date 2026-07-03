import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useAuth, type FamilyMember } from '@/api/auth';
import AlfonsoAvatar from '@/assets/me.svg';
import SaidaAvatar from '@/assets/saida.svg';

const AVATARS: Record<FamilyMember, typeof AlfonsoAvatar> = {
  alfonso: AlfonsoAvatar,
  saida: SaidaAvatar,
};

export default function HomeScreen() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0];
  const greeting = firstName ? `Hey ${firstName} 👋` : "Welcome to Alfonso's App";
  const Avatar = AVATARS[user?.family_member ?? 'alfonso'];

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-background px-6">
      <Animated.View entering={FadeIn.duration(500)}>
        <Avatar width={168} height={220} />
      </Animated.View>
      <Text className="text-center text-5xl font-semibold leading-[52px] text-foreground">
        {greeting}
      </Text>
    </View>
  );
}
