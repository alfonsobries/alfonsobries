import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { fetchBoxes, type Box } from '@/api/boxes';
import { useApiRouter } from '@/api/router';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

/**
 * Every box with its contents, cache-first and refreshed on focus. The whole
 * catalog is one payload, so search and every box screen work offline.
 */
export function useBoxes() {
  const route = useApiRouter();
  const fetcher = useCallback(() => fetchBoxes(route), [route]);
  const resource = useCachedResource<Box[]>(cacheKeys.boxes, fetcher);
  const { refresh } = resource;

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return resource;
}
