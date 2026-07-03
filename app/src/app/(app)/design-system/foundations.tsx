import { Stack } from 'expo-router';
import {
  ArrowSquareOut,
  Bell,
  CaretRight,
  Compass,
  Gear,
  House,
  type Icon,
  MagnifyingGlass,
  Palette,
  Plus,
  Trash,
} from 'phosphor-react-native';
import { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

const SURFACES = [
  { label: 'bg-background', className: 'bg-background' },
  { label: 'bg-surface', className: 'bg-surface' },
  { label: 'bg-surface-selected', className: 'bg-surface-selected' },
  { label: 'bg-primary', className: 'bg-primary' },
] as const;
const TEXTS = [
  { label: 'text-foreground', className: 'text-foreground' },
  { label: 'text-muted', className: 'text-muted' },
  { label: 'text-primary-emphasis', className: 'text-primary-emphasis' },
] as const;
const TYPE_SAMPLES = [
  { label: 'title · text-5xl', className: 'text-5xl font-semibold leading-[52px]' },
  { label: 'subtitle · text-[32px]', className: 'text-[32px] font-semibold leading-[44px]' },
  { label: 'body · text-base', className: 'text-base font-medium' },
  { label: 'small · text-sm', className: 'text-sm font-medium' },
  { label: 'caption · text-xs', className: 'text-xs font-medium' },
  { label: 'mono · font-mono text-xs', className: 'font-mono text-xs' },
] as const;
const SPACING = [
  { name: 'space-1', px: 4 },
  { name: 'space-2', px: 8 },
  { name: 'space-4', px: 16 },
  { name: 'space-6', px: 24 },
  { name: 'space-8', px: 32 },
  { name: 'space-16', px: 64 },
] as const;
const ICONS: { Glyph: Icon; name: string }[] = [
  { Glyph: House, name: 'House' },
  { Glyph: Compass, name: 'Compass' },
  { Glyph: MagnifyingGlass, name: 'MagnifyingGlass' },
  { Glyph: Bell, name: 'Bell' },
  { Glyph: Plus, name: 'Plus' },
  { Glyph: Trash, name: 'Trash' },
  { Glyph: Gear, name: 'Gear' },
  { Glyph: CaretRight, name: 'CaretRight' },
  { Glyph: ArrowSquareOut, name: 'ArrowSquareOut' },
  { Glyph: Palette, name: 'Palette' },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</Text>
      {children}
    </View>
  );
}

export default function Foundations() {
  const iconColor = useThemeColor('foreground');

  return (
    <>
      <Stack.Screen.Title large>Foundations</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 p-4"
      >
        <Text className="text-sm text-muted">
          Tokens carry both light and dark values — switch your system appearance to see them flip.
        </Text>

        <Section title="Surfaces">
          <View className="gap-2">
            {SURFACES.map((surface) => (
              <View key={surface.label} className="flex-row items-center gap-3">
                <View
                  className={`size-12 rounded-xl border border-surface-selected ${surface.className}`}
                />
                <Text className="font-mono text-xs text-foreground">{surface.label}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Text">
          <View className="gap-1">
            {TEXTS.map((token) => (
              <Text key={token.label} className={`text-base font-medium ${token.className}`}>
                {token.label} — The quick brown fox
              </Text>
            ))}
          </View>
        </Section>

        <Section title="Typography">
          <View className="gap-3">
            {TYPE_SAMPLES.map((sample) => (
              <View key={sample.label} className="gap-1">
                <Text className="font-mono text-[10px] text-muted">{sample.label}</Text>
                <Text className={`text-foreground ${sample.className}`}>Aa</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Spacing">
          <View className="gap-2">
            {SPACING.map((step) => (
              <View key={step.name} className="flex-row items-center gap-3">
                <View className="h-3 rounded bg-primary" style={{ width: step.px }} />
                <Text className="font-mono text-xs text-muted">
                  {step.name} · {step.px}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Icons">
          <View className="flex-row flex-wrap gap-4">
            {ICONS.map(({ Glyph, name }) => (
              <View key={name} className="w-16 items-center gap-1">
                <Glyph size={24} color={iconColor} />
                <Text className="text-center text-[10px] text-muted" numberOfLines={1}>
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>
    </>
  );
}
