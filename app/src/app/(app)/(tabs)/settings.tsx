import { router } from 'expo-router';
import { PaintBrush, SignOut } from 'phosphor-react-native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/api/auth';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { SettingsSection } from '@/components/settings/SettingsSection';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView
          contentContainerClassName="gap-7 px-4 pb-16 pt-4"
          contentInsetAdjustmentBehavior="automatic"
        >
          <Text className="px-1 text-4xl font-bold text-foreground">Settings</Text>

          <SettingsSection title="Developer">
            <SettingsRow
              icon={PaintBrush}
              label="Design System"
              showChevron
              onPress={() => router.push('/design-system')}
            />
          </SettingsSection>

          <SettingsSection>
            <SettingsRow
              icon={SignOut}
              label="Sign out"
              destructive
              loading={signingOut}
              onPress={handleSignOut}
            />
          </SettingsSection>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
