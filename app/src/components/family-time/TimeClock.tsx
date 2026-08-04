import { Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import { useThemeColor } from '@/hooks/use-theme-color';

const QUARTER_MINUTES = 15;
const QUARTERS_PER_HOUR = 4;

type ClockFaceProperties = {
  /** How many of the four quarters are painted in. */
  quarters: number;
  size: number;
  label?: string;
};

// A clock face with some of its quarters painted in. Reading a number is out
// of reach at four and six; counting painted slices is not.
export function ClockFace({ quarters, size, label }: ClockFaceProperties) {
  const filled = useThemeColor('primary');
  const empty = useThemeColor('surface-selected');
  const border = useThemeColor('border');

  const center = size / 2;
  const radius = center - Math.max(3, size * 0.045);
  const painted = Math.max(0, Math.min(QUARTERS_PER_HOUR, quarters));

  return (
    <Svg width={size} height={size} accessibilityLabel={label}>
      <Circle cx={center} cy={center} r={radius} fill={empty} />

      <G>
        {Array.from({ length: painted }, (_, index) => (
          <Path key={index} d={quarterPath(center, radius, index)} fill={filled} />
        ))}
      </G>

      {Array.from({ length: QUARTERS_PER_HOUR }, (_, index) => (
        <Line
          key={index}
          x1={center}
          y1={center}
          {...endpoint(center, radius, index * 90)}
          stroke={border}
          strokeWidth={size > 60 ? 2 : 1}
        />
      ))}

      <Circle cx={center} cy={center} r={radius} fill="none" stroke={border} strokeWidth={3} />
      <Circle cx={center} cy={center} r={size > 60 ? 4 : 2} fill={border} />
    </Svg>
  );
}

type TimeClockProperties = {
  minutes: number;
  size?: number;
};

// The family's saved minutes: a face that fills up a quarter at a time — it
// grows and stays put, never counts down. Full hours drop out of the face and
// are counted as dots underneath, so a kid can add them up by pointing.
export function TimeClock({ minutes, size = 132 }: TimeClockProperties) {
  const hours = Math.floor(minutes / 60);
  const quarters = Math.floor((minutes % 60) / QUARTER_MINUTES);

  return (
    <View className="items-center gap-2">
      <ClockFace quarters={quarters} size={size} label={`${minutes} minutes saved`} />

      {hours > 0 ? (
        <View className="flex-row items-center gap-1.5">
          {Array.from({ length: hours }, (_, index) => (
            <View key={index} className="size-3 rounded-full bg-primary" />
          ))}
          <Text className="ml-1 text-xs text-muted">
            {hours === 1 ? '1 full hour' : `${hours} full hours`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

type PriceClocksProperties = {
  minutes: number;
  size?: number;
};

// What an activity costs, in the same slices the big clock fills up with: a
// full face is an hour, so half a face is half an hour. Nothing to read.
export function PriceClocks({ minutes, size = 26 }: PriceClocksProperties) {
  const fullHours = Math.floor(minutes / 60);
  const rest = Math.floor((minutes % 60) / QUARTER_MINUTES);
  const faces = [
    ...Array.from({ length: fullHours }, () => QUARTERS_PER_HOUR),
    ...(rest > 0 ? [rest] : []),
  ];

  return (
    <View className="flex-row items-center gap-1">
      {faces.map((quarters, index) => (
        <ClockFace
          key={index}
          quarters={quarters}
          size={size}
          label={index === 0 ? `costs ${minutes} minutes` : undefined}
        />
      ))}
    </View>
  );
}

/** A pie slice covering one quarter of the face, starting at twelve. */
function quarterPath(center: number, radius: number, index: number): string {
  const from = endpoint(center, radius, index * 90);
  const to = endpoint(center, radius, (index + 1) * 90);

  return `M ${center} ${center} L ${from.x2} ${from.y2} A ${radius} ${radius} 0 0 1 ${to.x2} ${to.y2} Z`;
}

function endpoint(center: number, radius: number, degrees: number): { x2: number; y2: number } {
  const radians = (degrees * Math.PI) / 180;

  return {
    x2: center + radius * Math.sin(radians),
    y2: center - radius * Math.cos(radians),
  };
}

/** "45 min", "1 h", "1 h 15 min" — how the bank reads out loud. */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) {
    return `${rest} min`;
  }

  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
