import { router, Stack } from 'expo-router';
import { BellRinging, PaintBrush, Robot, SignOut } from 'phosphor-react-native';
import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';

import { useAuth } from '@/api/auth';
import { apiClient } from '@/api/client';
import { useApiRouter } from '@/api/router';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { SettingsSection } from '@/components/settings/SettingsSection';

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const route = useApiRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [notifying, setNotifying] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  const handleTestNotification = async () => {
    setNotifying(true);
    try {
      await apiClient.post(route('api.notifications.test'));
      Alert.alert('Sent', 'A test notification is on its way.');
    } catch {
      Alert.alert('Could not send', 'Make sure notifications are allowed, then try again.');
    } finally {
      setNotifying(false);
    }
  };

  return (
    <>
      <Stack.Screen.Title>Settings</Stack.Screen.Title>

      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-7 px-4 pb-16 pt-4"
        contentInsetAdjustmentBehavior="automatic"
      >
        <SettingsSection title="Notifications">
          <SettingsRow
            icon={BellRinging}
            label="Send a test notification"
            loading={notifying}
            onPress={handleTestNotification}
          />
        </SettingsSection>

        {user?.family_member === 'alfonso' ? (
          <SettingsSection title="Developer">
            <SettingsRow
              icon={PaintBrush}
              label="Design System"
              showChevron
              onPress={() => router.push('/design-system')}
            />
            <SettingsRow
              icon={Robot}
              label="AI Models"
              showChevron
              onPress={() => router.push('/ai-models')}
            />
          </SettingsSection>
        ) : null}

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
    </>
  );
}
