import { Check } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import {
  fetchAiModels,
  updateAiModel,
  type AiModelKind,
  type AiModelSettings,
} from '@/api/ai-models';
import { useApiRouter } from '@/api/router';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { useThemeColor } from '@/hooks/use-theme-color';

const SECTIONS: { kind: AiModelKind; title: string; footer: string }[] = [
  {
    kind: 'chat',
    title: 'Chat model',
    footer: 'Used by every chat assistant (translator included).',
  },
  {
    kind: 'image',
    title: 'Image model',
    footer: 'Used by the illustrator everywhere: chat drawings, behaviors and rewards.',
  },
];

/**
 * The runtime AI model switch, ordered cheapest first with a human cost
 * tag on each option. Only rendered for Alfonso — the API enforces it too.
 */
export function AiModelPicker() {
  const route = useApiRouter();
  const accent = useThemeColor('primary-emphasis');

  const [settings, setSettings] = useState<AiModelSettings | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        try {
          setSettings(await fetchAiModels(route));
        } catch {
          // The section simply stays hidden; the next focus retries.
        }
      })();
    }, [route]),
  );

  if (!settings) {
    return null;
  }

  const handleSelect = async (kind: AiModelKind, id: string) => {
    if (settings[kind].active === id || switching !== null) {
      return;
    }

    setSwitching(`${kind}:${id}`);
    try {
      setSettings(await updateAiModel(route, kind, id));
    } catch {
      Alert.alert('Could not switch the model', 'Please try again.');
    } finally {
      setSwitching(null);
    }
  };

  return (
    <>
      {SECTIONS.map(({ kind, title, footer }) => (
        <SettingsSection key={kind} title={title} footer={footer}>
          {settings[kind].models.map((model) => {
            const active = settings[kind].active === model.id;
            const busy = switching === `${kind}:${model.id}`;

            return (
              <Pressable
                key={model.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => void handleSelect(kind, model.id)}
                className="flex-row items-center gap-3 px-4 py-3 active:bg-surface-selected"
              >
                <View className="flex-1 gap-0.5">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-medium text-foreground">{model.label}</Text>
                    <Text className="text-sm text-muted">{model.cost}</Text>
                    {model.recommended ? (
                      <View className="rounded-full bg-surface-selected px-2 py-0.5">
                        <Text className="text-[11px] font-medium text-foreground">Recommended</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text className="text-xs text-muted">{model.blurb}</Text>
                </View>

                {busy ? (
                  <ActivityIndicator size="small" color={accent} />
                ) : active ? (
                  <Check size={18} weight="bold" color={accent} />
                ) : (
                  <View className="w-[18px]" />
                )}
              </Pressable>
            );
          })}
        </SettingsSection>
      ))}
    </>
  );
}
