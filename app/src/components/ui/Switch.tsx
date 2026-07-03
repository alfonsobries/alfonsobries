import { Switch as NativeSwitch, type SwitchProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export function Switch(props: SwitchProps) {
  const on = useThemeColor('primary');
  const off = useThemeColor('surface-selected');

  return (
    <NativeSwitch
      trackColor={{ true: on, false: off }}
      thumbColor="#ffffff"
      ios_backgroundColor={off}
      {...props}
    />
  );
}
