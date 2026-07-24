import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';

export function SheetDemoContent() {
  return (
    <Sheet title="Sheet title" subtitle="Drag the grabber to resize, or swipe down to dismiss.">
      <View className="items-start">
        <Button onPress={() => router.back()}>Close</Button>
      </View>
      <Text className="mt-4 text-base text-muted">
        Every form sheet wraps its body in Sheet, so the grabber clearance, the side padding and the
        home-indicator gap are the same everywhere.
      </Text>
    </Sheet>
  );
}
