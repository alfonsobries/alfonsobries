import NativeSegmentedControl from '@react-native-segmented-control/segmented-control';
import { type ImageSourcePropType } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type SegmentOption<T> = {
  value: T;
  label?: string;
  /** Icon shown when the segment is not selected. */
  icon?: ImageSourcePropType;
  /**
   * Icon shown when the segment is selected. The native control bakes the image
   * color, so pass a dark variant here that reads on the selected fill; falls
   * back to `icon`.
   */
  iconSelected?: ImageSourcePropType;
};

type SegmentedControlProperties<T> = {
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
};

const HEIGHT = 40;

export function SegmentedControl<T extends string | number>({
  value,
  onChange,
  options,
}: SegmentedControlProperties<T>) {
  const track = useThemeColor('surface-selected');
  const tint = useThemeColor('primary');
  const muted = useThemeColor('muted');
  const activeLabel = useThemeColor('primary-foreground');
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  // The native UISegmentedControl accepts an image source per segment, but the
  // package's types only expose `string[]`, so we widen here. Swapping the
  // selected segment's image is how we recolor it per state (the control can't).
  const values = options.map((option, index) => {
    const icon = index === selectedIndex ? (option.iconSelected ?? option.icon) : option.icon;
    return icon ?? option.label ?? '';
  }) as unknown as string[];

  return (
    <NativeSegmentedControl
      values={values}
      selectedIndex={selectedIndex}
      onChange={(event) => onChange(options[event.nativeEvent.selectedSegmentIndex].value)}
      backgroundColor={track}
      tintColor={tint}
      fontStyle={{ color: muted }}
      activeFontStyle={{ color: activeLabel }}
      style={{ height: HEIGHT, borderRadius: HEIGHT / 2 }}
    />
  );
}
