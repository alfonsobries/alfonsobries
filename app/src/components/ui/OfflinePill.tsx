import { CloudSlash } from 'phosphor-react-native';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useIsOnline } from '@/offline/connectivity';
import { usePendingMutations } from '@/offline/queue';
import { useThemeColor } from '@/hooks/use-theme-color';

/**
 * A quiet marker that the app is running on cached data, plus how much work is
 * waiting to sync. Sits under the update pill so the two never collide.
 */
export function OfflinePill() {
  const insets = useSafeAreaInsets();
  const isOnline = useIsOnline();
  const pending = usePendingMutations();
  const iconColor = useThemeColor('background');

  const syncing = isOnline && pending.length > 0;

  if (isOnline && !syncing) {
    return null;
  }

  const label = syncing
    ? `Syncing ${pending.length} ${pending.length === 1 ? 'change' : 'changes'}…`
    : pending.length > 0
      ? `Offline · ${pending.length} ${pending.length === 1 ? 'change' : 'changes'} queued`
      : 'Offline · showing saved data';

  return (
    <View
      pointerEvents="none"
      className="absolute left-0 right-0 z-40 items-center"
      style={{ top: insets.top + 56 }}
    >
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        className="flex-row items-center gap-x-1.5 rounded-full bg-foreground px-3 py-1.5"
      >
        <CloudSlash size={13} color={iconColor} weight="fill" />
        <Text className="text-xs text-background">{label}</Text>
      </Animated.View>
    </View>
  );
}
