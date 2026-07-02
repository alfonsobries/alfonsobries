import NativeSegmentedControl from '@react-native-segmented-control/segmented-control';
import { type ImageSourcePropType } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type SegmentOption<T> = { value: T; label?: string; icon?: ImageSourcePropType };

type SegmentedControlProperties<T> = {
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
};

export function SegmentedControl<T extends string | number>({
  value,
  onChange,
  options,
}: SegmentedControlProperties<T>) {
  const track = useThemeColor('surface-selected');
  const tint = useThemeColor('primary-emphasis');
  const muted = useThemeColor('muted');
  const activeLabel = useThemeColor('primary-emphasis-foreground');
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  // The native UISegmentedControl accepts an image source per segment, but the
  // package's types only expose `string[]`, so we widen here.
  const values = options.map((option) => option.icon ?? option.label ?? '') as unknown as string[];

  return (
    <NativeSegmentedControl
      values={values}
      selectedIndex={selectedIndex}
      onChange={(event) => onChange(options[event.nativeEvent.selectedSegmentIndex].value)}
      backgroundColor={track}
      tintColor={tint}
      fontStyle={{ color: muted }}
      activeFontStyle={{ color: activeLabel }}
      style={{ height: 40 }}
    />
  );
}
