import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SheetProperties = {
  /** Centered heading. Omit it when the content carries its own. */
  title?: string;
  subtitle?: string;
  /** Extra classes for the body below the heading. */
  className?: string;
  children: ReactNode;
};

/**
 * The body of a native form sheet. A sheet draws no header, so the clearance
 * under the grabber, the side padding and the home-indicator gap live here
 * instead of being redone on every screen.
 */
export function Sheet({ title, subtitle, className = '', children }: SheetProperties): ReactNode {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background px-6 pt-8" style={{ paddingBottom: insets.bottom + 16 }}>
      {title ? (
        <View className="mb-6 gap-1">
          <Text className="text-center text-3xl font-semibold text-foreground">{title}</Text>
          {subtitle ? <Text className="text-center text-lg text-muted">{subtitle}</Text> : null}
        </View>
      ) : null}

      <View className={`flex-1 ${className}`}>{children}</View>
    </View>
  );
}
