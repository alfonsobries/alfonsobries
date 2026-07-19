import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useApiRouter } from '@/api/router';
import { fetchVirtueSummary } from '@/api/virtue';
import { VirtueScene } from '@/components/virtue/VirtueScene';

// Profile cover: the journey scene as a wide banner. Advances with each
// area's stage so the world quietly changes as the practice does.
export function VirtueCover() {
  const route = useApiRouter();
  const [stages, setStages] = useState<{
    tierra: number;
    cielo: number;
    arbol: number;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        try {
          const summary = await fetchVirtueSummary(route);
          setStages({
            tierra: summary.stats.areas.body.stage,
            cielo: summary.stats.areas.mind.stage,
            arbol: summary.stats.areas.spirit.stage,
          });
        } catch {
          // Not available for this user or offline — the cover stays hidden.
        }
      })();
    }, [route]),
  );

  if (stages === null) {
    return null;
  }

  return <VirtueScene stages={stages} aspectRatio={3} />;
}
