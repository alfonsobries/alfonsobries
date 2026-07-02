import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useThemeColor } from '@/hooks/use-theme-color';

export default function AppTabs() {
  const background = useThemeColor('background');
  const indicator = useThemeColor('surface-selected');
  const label = useThemeColor('foreground');
  const muted = useThemeColor('muted');

  return (
    <NativeTabs
      backgroundColor={background}
      indicatorColor={indicator}
      iconColor={{ default: muted, selected: label }}
      labelStyle={{ selected: { color: label } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/settings.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
