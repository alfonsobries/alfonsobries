import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';
import type { UpdateStatus } from '@/hooks/use-eas-update';

interface EasUpdatePillProperties {
  status: UpdateStatus;
  onRestart: () => Promise<void>;
  onDismiss: () => void;
  dismissed: boolean;
}

export function EasUpdatePill({ status, onRestart, onDismiss, dismissed }: EasUpdatePillProperties) {
  const insets = useSafeAreaInsets();
  const spinnerColor = useThemeColor('background');

  if (status === 'idle' || status === 'checking' || dismissed) {
    return null;
  }

  if (status === 'downloading') {
    return (
      <View pointerEvents="none" className="absolute left-0 right-0 z-50 items-center" style={{ top: insets.top + 16 }}>
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          className="bg-foreground flex-row items-center gap-x-2 rounded-full px-3 py-1.5"
        >
          <ActivityIndicator size="small" color={spinnerColor} />
          <Text className="text-background text-xs">Downloading update…</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View pointerEvents="box-none" className="absolute left-0 right-0 z-50 items-center" style={{ top: insets.top + 16 }}>
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        className="bg-foreground flex-row items-center rounded-full px-3 py-1.5"
      >
        <Text className="text-background text-xs">New update available</Text>
        <Text className="text-background/40 mx-2 text-xs">|</Text>
        <Pressable accessibilityRole="button" onPress={() => void onRestart()} hitSlop={{ top: 14, bottom: 14, left: 6, right: 6 }}>
          <Text className="text-background text-xs font-semibold">Restart</Text>
        </Pressable>
        <Text className="text-background/40 mx-1 text-xs">·</Text>
        <Pressable accessibilityRole="button" onPress={onDismiss} hitSlop={{ top: 14, bottom: 14, left: 6, right: 6 }}>
          <Text className="text-background/70 text-xs">Dismiss</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
