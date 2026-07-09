import { Redirect } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { useAuth } from '@/api/auth';
import { AiModelPicker } from '@/components/settings/AiModelPicker';

export default function AiModelsScreen() {
  const { user } = useAuth();

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-7 px-4 pb-16 pt-4"
        contentInsetAdjustmentBehavior="automatic"
      >
        <AiModelPicker />
      </ScrollView>
    </View>
  );
}
