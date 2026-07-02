import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useThemeColor } from '@/hooks/use-theme-color';

export default function AppTabs() {
  const background = useThemeColor('background');
  const indicator = useThemeColor('surface-selected');
  const label = useThemeColor('foreground');

  return (
    <NativeTabs
      backgroundColor={background}
      indicatorColor={indicator}
      labelStyle={{ selected: { color: label } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="design-system">
        <NativeTabs.Trigger.Label>Design</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/design.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
