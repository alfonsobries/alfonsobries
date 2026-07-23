import { StyleSheet, View } from 'react-native';

import { authImageHeaders } from '@/api/client';
import { useApiRouter } from '@/api/router';
import { Illustration } from '@/components/ui/Illustration';

export type VirtueSceneStages = {
  /** Body → earth mound */
  tierra: number;
  /** Mind → sky */
  cielo: number;
  /** Spirit → tree */
  arbol: number;
};

/**
 * Hero journey scene: three full-bleed layers composited in world space.
 * Alignment is baked into the PNGs (shared crest anchor) — do not offset
 * layers in layout, or combos drift.
 */
export function VirtueScene({
  stages,
  version,
  onError,
  aspectRatio = 3 / 2,
}: {
  stages: VirtueSceneStages;
  version: string;
  onError?: () => void;
  aspectRatio?: number;
}) {
  const route = useApiRouter();
  const headers = authImageHeaders();

  const layer = (set: keyof VirtueSceneStages, stage: number) => ({
    uri: route('api.virtue.mascot', { set, stage, v: version }),
    headers,
  });

  return (
    <View className="w-full overflow-hidden rounded-3xl" style={{ aspectRatio }}>
      <Illustration
        source={layer('cielo', stages.cielo)}
        contentFit="cover"
        transition={200}
        onError={onError}
        style={StyleSheet.absoluteFill}
      />
      <Illustration
        source={layer('tierra', stages.tierra)}
        contentFit="cover"
        transition={200}
        onError={onError}
        style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
      />
      <Illustration
        source={layer('arbol', stages.arbol)}
        contentFit="cover"
        transition={200}
        onError={onError}
        style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
      />
    </View>
  );
}
