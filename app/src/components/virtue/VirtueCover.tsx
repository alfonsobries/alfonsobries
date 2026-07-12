import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { authImageHeaders } from '@/api/client';
import { useApiRouter } from '@/api/router';
import { fetchVirtueSummary } from '@/api/virtue';
import { Illustration } from '@/components/ui/Illustration';
import { paisajeStage } from '@/data/virtue';

// The profile cover: the journey landscape as a wide banner, like a social
// profile header. It advances with the overall stage, so the world quietly
// changes as the practice does. Renders nothing when the stats aren't
// available (offline or another user).
export function VirtueCover() {
  const route = useApiRouter();
  const [stage, setStage] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        try {
          const summary = await fetchVirtueSummary(route);
          setStage(summary.stats.stage);
        } catch {
          // Not available for this user or offline — the cover stays hidden.
        }
      })();
    }, [route]),
  );

  if (stage === null) {
    return null;
  }

  return (
    <View className="w-full overflow-hidden rounded-3xl" style={{ aspectRatio: 3 }}>
      <Illustration
        source={{
          uri: route('api.virtue.mascot', { set: 'paisaje', stage: paisajeStage(stage) }),
          headers: authImageHeaders(),
        }}
        transition={200}
      />
    </View>
  );
}
