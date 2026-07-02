import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';

export function SheetDemoContent() {
  const insets = useSafeAreaInsets();

  return (
    <View className="gap-4 bg-background px-4 pt-6" style={{ paddingBottom: insets.bottom + 16 }}>
      <Text className="text-2xl font-semibold text-foreground">Sheet title</Text>
      <Text className="text-base text-muted">
        Placeholder content. Drag the grabber to resize, or swipe down to dismiss.
      </Text>
      <View className="items-start">
        <Button onPress={() => router.back()}>Close</Button>
      </View>
    </View>
  );
}
