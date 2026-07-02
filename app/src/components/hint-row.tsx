import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type HintRowProps = {
  title?: string;
  hint?: ReactNode;
};

export function HintRow({ title = 'Try editing', hint = 'app/index.tsx' }: HintRowProps) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-sm font-medium text-foreground">{title}</Text>
      <View className="rounded-lg bg-surface-selected px-2 py-0.5">
        <Text className="text-base font-medium text-muted">{hint}</Text>
      </View>
    </View>
  );
}
