import { type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SheetProperties = {
  /** Centered heading. Omit it when the content carries its own. */
  title?: string;
  subtitle?: string;
  /**
   * Let the sheet itself scroll. Pass this instead of nesting a `ScrollView`:
   * a sheet resizes its first descendant scroll view to the whole sheet, so a
   * nested one escapes this padding and paints over the heading.
   */
  scrollable?: boolean;
  /** Extra classes for the body below the heading. */
  className?: string;
  children: ReactNode;
};

/**
 * The body of a native form sheet. A sheet draws no header, so the clearance
 * under the grabber, the side padding and the home-indicator gap live here
 * instead of being redone on every screen.
 */
export function Sheet({
  title,
  subtitle,
  scrollable = false,
  className = '',
  children,
}: SheetProperties): ReactNode {
  const insets = useSafeAreaInsets();
  const paddingBottom = insets.bottom + 16;

  const heading = title ? (
    <View className="mb-6 gap-1">
      <Text className="text-center text-3xl font-semibold text-foreground">{title}</Text>
      {subtitle ? <Text className="text-center text-lg text-muted">{subtitle}</Text> : null}
    </View>
  ) : null;

  if (scrollable) {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName={`px-6 pt-8 ${className}`}
        contentContainerStyle={{ paddingBottom }}
      >
        {heading}
        {children}
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 bg-background px-6 pt-8" style={{ paddingBottom }}>
      {heading}
      <View className={`flex-1 ${className}`}>{children}</View>
    </View>
  );
}
