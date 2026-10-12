import * as Haptics from 'expo-haptics';
import { Minus, Plus, Power } from 'phosphor-react-native';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  type ClimateChange,
  type ClimateMode,
  type ClimateUnit,
  stepTemperature,
} from '@/api/climate';
import { Select } from '@/components/ui/Select';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Switch';
import { useThemeColor } from '@/hooks/use-theme-color';

import { FAN_LABELS, MODE_ORDER, MODES, SWING_LABELS, formatTemperature } from './climate-modes';

type ClimateUnitCardProperties = {
  unit: ClimateUnit;
  expanded: boolean;
  onToggleExpanded: () => void;
  /** Applies a change; resolves once the unit confirmed it (or it was rolled back). */
  onChange: (change: ClimateChange) => Promise<void>;
};

/** Temperature taps settle into one command after this pause. */
const TEMPERATURE_DEBOUNCE_MS = 600;

export function ClimateUnitCard({
  unit,
  expanded,
  onToggleExpanded,
  onChange,
}: ClimateUnitCardProperties) {
  const muted = useThemeColor('muted');
  const foreground = useThemeColor('foreground');
  const state = unit.state;
  const capabilities = unit.capabilities;
  const [pendingTemperature, setPendingTemperature] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);

  const on = state?.power ?? false;
  const mode = state ? MODES[state.mode] : null;
  const target = pendingTemperature ?? state?.target_temperature ?? null;
  const usesTarget = state !== null && state.mode !== 'fan';
  const subtitle = !unit.online
    ? 'Sin conexión'
    : !on || !state || !mode
      ? 'Apagado'
      : usesTarget
        ? `${mode.activity} a ${formatTemperature(target)}`
        : mode.activity;

  const handlePower = (value: boolean): void => {
    void Haptics.selectionAsync();
    void onChange({ power: value });
  };

  const handleStep = (direction: 1 | -1): void => {
    if (target === null) {
      return;
    }

    const next = stepTemperature(target, direction, capabilities);
    setPendingTemperature(next);
    void Haptics.selectionAsync();
    clearTimeout(timer.current ?? undefined);
    timer.current = setTimeout(() => {
      void onChange({ target_temperature: next }).finally(() => setPendingTemperature(null));
    }, TEMPERATURE_DEBOUNCE_MS);
  };

  const Glyph = on && mode ? mode.icon : Power;

  return (
    <View className="overflow-hidden rounded-3xl bg-surface">
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${unit.name}, ${subtitle}`}
          accessibilityHint={expanded ? 'Oculta los controles' : 'Muestra los controles'}
          accessibilityState={{ expanded }}
          disabled={!unit.online}
          onPress={onToggleExpanded}
          className="flex-1 flex-row items-center gap-3 active:opacity-70"
        >
          <View
            className={`h-11 w-11 items-center justify-center rounded-full ${on && mode ? '' : 'bg-surface-selected'}`}
            style={on && mode ? { backgroundColor: mode.tint } : undefined}
          >
            <Glyph size={20} weight="bold" color={on && mode ? '#ffffff' : muted} />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
              {unit.name}
            </Text>
            <Text
              className={`text-sm ${unit.online ? 'text-muted' : 'text-danger'}`}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          </View>
          {state?.indoor_temperature != null ? (
            <Text
              className="text-base text-muted"
              accessibilityLabel={`${formatTemperature(state.indoor_temperature)} en el cuarto`}
            >
              {formatTemperature(state.indoor_temperature)}
            </Text>
          ) : null}
        </Pressable>
        <Switch
          accessibilityLabel={`Encender ${unit.name}`}
          value={on}
          disabled={!unit.online || !state}
          onValueChange={handlePower}
        />
      </View>

      {expanded && state ? (
        <View className="gap-4 border-t border-border px-4 pb-4 pt-4">
          {usesTarget && target !== null ? (
            <View className="flex-row items-center justify-between">
              <StepButton
                label="Bajar temperatura"
                disabled={!on || target <= capabilities.min_temperature}
                onPress={() => handleStep(-1)}
              >
                <Minus size={22} weight="bold" color={foreground} />
              </StepButton>
              <View
                className="items-center"
                accessible
                accessibilityRole="adjustable"
                accessibilityLabel="Temperatura objetivo"
                accessibilityValue={{ text: formatTemperature(target) }}
                accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
                onAccessibilityAction={(event) =>
                  handleStep(event.nativeEvent.actionName === 'increment' ? 1 : -1)
                }
              >
                <Text
                  className="text-5xl font-light text-foreground"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {formatTemperature(target)}
                </Text>
                <Text className="text-xs text-muted">
                  {state.outdoor_temperature != null
                    ? `Afuera ${formatTemperature(state.outdoor_temperature)}`
                    : 'Objetivo'}
                </Text>
              </View>
              <StepButton
                label="Subir temperatura"
                disabled={!on || target >= capabilities.max_temperature}
                onPress={() => handleStep(1)}
              >
                <Plus size={22} weight="bold" color={foreground} />
              </StepButton>
            </View>
          ) : null}

          <SegmentedControl<ClimateMode>
            value={state.mode}
            onChange={(next) => void onChange({ mode: next })}
            options={MODE_ORDER.filter((key) => capabilities.modes.includes(key)).map((key) => ({
              value: key,
              label: MODES[key].label,
            }))}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Select
                label="Ventilador"
                value={state.fan_speed}
                disabled={!on || state.mode === 'dry'}
                searchable={false}
                options={capabilities.fan_speeds.map((speed) => ({
                  value: speed,
                  label: FAN_LABELS[speed],
                }))}
                onChange={(next) =>
                  void onChange({ fan_speed: next as ClimateChange['fan_speed'] })
                }
              />
            </View>
            {capabilities.swings.length > 1 ? (
              <View className="flex-1">
                <Select
                  label="Aleta"
                  value={state.swing}
                  disabled={!on}
                  searchable={false}
                  options={capabilities.swings.map((swing) => ({
                    value: swing,
                    label: SWING_LABELS[swing],
                  }))}
                  onChange={(next) => void onChange({ swing: next as ClimateChange['swing'] })}
                />
              </View>
            ) : null}
          </View>

          <View className="flex-row flex-wrap gap-2">
            {capabilities.eco ? (
              <FeatureChip
                label="Eco"
                active={state.eco}
                disabled={!on || !['cool', 'auto'].includes(state.mode)}
                onPress={() => void onChange({ eco: !state.eco })}
              />
            ) : null}
            {capabilities.turbo ? (
              <FeatureChip
                label="Turbo"
                active={state.turbo}
                disabled={!on || !['cool', 'heat'].includes(state.mode)}
                onPress={() => void onChange({ turbo: !state.turbo })}
              />
            ) : null}
            <FeatureChip
              label="Dormir"
              active={state.sleep}
              disabled={!on || state.mode === 'fan'}
              onPress={() => void onChange({ sleep: !state.sleep })}
            />
          </View>

          {!on ? (
            <Text className="text-xs text-muted">Enciende el aire para cambiar el ajuste.</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

type StepButtonProperties = {
  label: string;
  disabled: boolean;
  onPress: () => void;
  children: ReactNode;
};

function StepButton({ label, disabled, onPress, children }: StepButtonProperties) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      className={`h-14 w-14 items-center justify-center rounded-full bg-surface-selected active:opacity-60 ${disabled ? 'opacity-40' : ''}`}
    >
      {children}
    </Pressable>
  );
}

type FeatureChipProperties = {
  label: string;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
};

function FeatureChip({ label, active, disabled, onPress }: FeatureChipProperties) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: active, disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`h-11 min-w-20 items-center justify-center rounded-full px-4 ${
        active ? 'bg-primary' : 'bg-surface-selected'
      } ${disabled ? 'opacity-40' : 'active:opacity-70'}`}
    >
      <Text
        className={`text-sm font-medium ${active ? 'text-primary-foreground' : 'text-foreground'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
