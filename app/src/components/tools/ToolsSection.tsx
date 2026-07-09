import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { LockKey, Sparkle } from 'phosphor-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { useThemeColor } from '@/hooks/use-theme-color';

// The owner's personal tools, behind a single Face ID unlock. The gate isn't
// security — the kids use this phone — it just keeps small fingers from
// wandering into these screens. One unlock reveals every tool at once.
export function ToolsSection() {
  const [unlocked, setUnlocked] = useState(false);
  const accent = useThemeColor('primary-emphasis');

  async function handleUnlock(): Promise<void> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm it's you to open your tools",
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      setUnlocked(true);
    }
  }

  return (
    <View className="gap-3">
      <Text className="px-1 text-xs font-semibold uppercase tracking-wider text-muted">
        My tools
      </Text>

      {unlocked ? (
        <Card className="overflow-hidden p-0">
          <SettingsRow
            label="Virtud"
            icon={Sparkle}
            showChevron
            onPress={() => router.push('/virtue')}
          />
        </Card>
      ) : (
        <Card className="items-center gap-3 py-6">
          <LockKey size={28} color={accent} weight="fill" />
          <Text className="text-sm text-muted">Personal tools stay locked.</Text>
          <Button size="sm" variant="secondary" onPress={() => void handleUnlock()}>
            Unlock
          </Button>
        </Card>
      )}
    </View>
  );
}
