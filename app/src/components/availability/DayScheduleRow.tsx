import { DatePicker, Host } from '@expo/ui/swift-ui';
import { environment } from '@expo/ui/swift-ui/modifiers';
import { Plus, X } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { Switch } from '@/components/ui/Switch';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  dateToTime,
  type DaySchedule,
  minutesOf,
  rangeIsValid,
  type TimeRange,
  timeToDate,
  WEEKDAYS,
} from '@/lib/availability';

type DayScheduleRowProperties = {
  schedule: DaySchedule;
  onChange: (next: DaySchedule) => void;
};

const DEFAULT_RANGE: TimeRange = { from: '09:00', to: '18:00' };

/** A new range right after the day's last one, so adding never starts invalid. */
function nextRange(ranges: TimeRange[]): TimeRange {
  const last = ranges.at(-1);

  if (!last) {
    return DEFAULT_RANGE;
  }

  const start = Math.min(minutesOf(last.to === '24:00' ? '23:00' : last.to) + 60, 22 * 60);
  const end = Math.min(start + 60, 24 * 60);
  const format = (minutes: number): string =>
    minutes === 24 * 60
      ? '24:00'
      : `${`${Math.floor(minutes / 60)}`.padStart(2, '0')}:${`${minutes % 60}`.padStart(2, '0')}`;

  return { from: format(start), to: format(end) };
}

/** One weekday in the schedule editor: on/off, and its time ranges. */
export function DayScheduleRow({ schedule, onChange }: DayScheduleRowProperties) {
  const tint = useThemeColor('primary-emphasis');
  const weekday = WEEKDAYS[schedule.day - 1];
  const enabled = schedule.ranges.length > 0;

  const handleToggle = (value: boolean): void => {
    onChange({ ...schedule, ranges: value ? [DEFAULT_RANGE] : [] });
  };

  const handleRangeChange = (index: number, range: TimeRange): void => {
    onChange({
      ...schedule,
      ranges: schedule.ranges.map((current, at) => (at === index ? range : current)),
    });
  };

  const handleRemove = (index: number): void => {
    onChange({ ...schedule, ranges: schedule.ranges.filter((_, at) => at !== index) });
  };

  return (
    <View className="gap-2 px-4 py-3">
      <View className="min-h-11 flex-row items-center justify-between">
        <Text className="text-base font-medium text-foreground">{weekday.long}</Text>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          accessibilityLabel={`${weekday.long}: ${enabled ? 'con horario' : 'sin horario'}`}
        />
      </View>

      {schedule.ranges.map((range, index) => (
        <TimeRangeRow
          key={index}
          dayLabel={weekday.long}
          range={range}
          onChange={(next) => handleRangeChange(index, next)}
          onRemove={() => handleRemove(index)}
        />
      ))}

      {enabled ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Agregar otro horario el ${weekday.long.toLowerCase()}`}
          onPress={() =>
            onChange({ ...schedule, ranges: [...schedule.ranges, nextRange(schedule.ranges)] })
          }
          className="min-h-11 flex-row items-center gap-2 self-start active:opacity-60"
        >
          <Plus size={16} color={tint} weight="bold" />
          <Text className="text-sm font-medium text-primary-emphasis">Otro horario</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function TimeRangeRow({
  dayLabel,
  range,
  onChange,
  onRemove,
}: {
  dayLabel: string;
  range: TimeRange;
  onChange: (next: TimeRange) => void;
  onRemove: () => void;
}) {
  const muted = useThemeColor('muted');
  const valid = rangeIsValid(range);

  return (
    <View className="gap-1">
      <View className="flex-row items-center gap-2">
        <TimeField
          accessibilityLabel={`${dayLabel}, desde`}
          value={range.from}
          onChange={(from) => onChange({ ...range, from })}
          isEnd={false}
        />
        <Text className="text-sm text-muted">a</Text>
        <TimeField
          accessibilityLabel={`${dayLabel}, hasta`}
          value={range.to}
          onChange={(to) => onChange({ ...range, to })}
          isEnd
        />
        <View className="flex-1" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Quitar ${range.from} a ${range.to}`}
          hitSlop={8}
          onPress={onRemove}
          className="size-11 items-center justify-center rounded-full active:bg-surface-selected"
        >
          <X size={18} color={muted} weight="bold" />
        </Pressable>
      </View>
      {!valid ? (
        <Text className="text-xs text-danger">La hora final debe ser después de la inicial.</Text>
      ) : range.to === '24:00' ? (
        <Text className="text-xs text-muted">Hasta la medianoche.</Text>
      ) : null}
    </View>
  );
}

function TimeField({
  value,
  onChange,
  isEnd,
  accessibilityLabel,
}: {
  value: string;
  onChange: (time: string) => void;
  isEnd: boolean;
  accessibilityLabel: string;
}) {
  return (
    <View accessibilityLabel={accessibilityLabel} className="min-h-11 justify-center">
      <Host matchContents>
        <DatePicker
          selection={timeToDate(value)}
          displayedComponents={['hourAndMinute']}
          onDateChange={(date) => onChange(dateToTime(date, isEnd))}
          modifiers={[environment('locale', 'es_ES')]}
        />
      </Host>
    </View>
  );
}
