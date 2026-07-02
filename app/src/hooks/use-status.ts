import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/api/client';
import { useApiRouter } from '@/api/router';

export type ApiStatus = {
  message: string;
  status: string;
  environment: string;
  version: string;
  server_time: string;
};

type UseStatusResult = {
  status: ApiStatus | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useStatus(): UseStatusResult {
  const route = useApiRouter();
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const { data } = await apiClient.get<ApiStatus>(route('api.status'), { signal });
        setStatus(data);
        setError(null);
      } catch {
        if (!signal?.aborted) {
          setError('Could not reach the API');
          setStatus(null);
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [route],
  );

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await load();
  }, [load]);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      await load(controller.signal);
    })();

    return () => controller.abort();
  }, [load]);

  return { status, isLoading, error, refetch };
}
