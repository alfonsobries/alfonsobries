import { Link, Stack } from 'expo-router';
import { CaretRight } from 'phosphor-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

const CATEGORIES = [
  {
    title: 'Foundations',
    subtitle: 'Colors, typography, spacing, icons',
    href: '/design-system/foundations',
  },
  {
    title: 'Buttons',
    subtitle: 'Variants, sizes, states',
    href: '/design-system/buttons',
  },
  {
    title: 'Cards',
    subtitle: 'Surface container, pressable',
    href: '/design-system/cards',
  },
  {
    title: 'Avatars',
    subtitle: 'Family avatars, full body and circle, any size',
    href: '/design-system/avatars',
  },
  {
    title: 'Actions',
    subtitle: 'Icon-forward card buttons in a grid',
    href: '/design-system/actions',
  },
  {
    title: 'Inputs',
    subtitle: 'Fields, switch, checkbox, radio',
    href: '/design-system/inputs',
  },
  {
    title: 'Navigation',
    subtitle: 'Segmented control',
    href: '/design-system/navigation',
  },
  {
    title: 'Overlays',
    subtitle: 'Form sheets',
    href: '/design-system/overlays',
  },
] as const;

export default function DesignSystemIndex() {
  const tint = useThemeColor('muted');

  return (
    <>
      <Stack.Screen.Title large>Design System</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-3 p-4"
      >
        {CATEGORIES.map((category) => (
          <Link key={category.href} href={category.href} asChild>
            <Pressable className="active:opacity-70">
              <View className="flex-row items-center justify-between rounded-2xl bg-surface px-4 py-4">
                <View className="gap-0.5">
                  <Text className="text-base font-semibold text-foreground">{category.title}</Text>
                  <Text className="text-sm text-muted">{category.subtitle}</Text>
                </View>
                <CaretRight size={18} color={tint} />
              </View>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </>
  );
}
