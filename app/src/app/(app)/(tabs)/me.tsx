import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/api/auth';
import { getPerson } from '@/api/family';
import { ProfileView } from '@/components/family/ProfileView';
import { ToolsSection } from '@/components/tools/ToolsSection';

export default function MyProfileScreen() {
  const { user } = useAuth();
  const person = getPerson(user?.family_member ?? undefined);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView
          contentContainerClassName="gap-6 px-4 pb-16 pt-4"
          contentInsetAdjustmentBehavior="automatic"
        >
          <Text className="px-1 text-4xl font-bold text-foreground">Profile</Text>
          {person ? <ProfileView person={person} /> : null}
          {user?.family_member === 'alfonso' ? <ToolsSection /> : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
