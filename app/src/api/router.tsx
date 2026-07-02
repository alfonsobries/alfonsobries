import { createContext, useContext, type ReactNode } from 'react';
import type { Config } from 'ziggy-js';
import { useRoute } from 'ziggy-js';

import { API_ORIGIN } from '@/constants/env';

import { Ziggy } from './ziggy.gen';

type ApiRoute = ReturnType<typeof useRoute>;

type ApiRouterProviderProperties = {
  children: ReactNode;
};

const ApiRouterContext = createContext<ApiRoute | undefined>(undefined);

export function ApiRouterProvider({ children }: ApiRouterProviderProperties): ReactNode {
  const route = useRoute({ ...Ziggy, url: API_ORIGIN } as Config);

  return <ApiRouterContext.Provider value={route}>{children}</ApiRouterContext.Provider>;
}

// Returns Ziggy's `route()` helper bound to the API, so callers reference
// endpoints by their Laravel name (e.g. `route('api.status')`).
export function useApiRouter(): ApiRoute {
  const route = useContext(ApiRouterContext);

  if (!route) {
    throw new Error('useApiRouter must be used within an ApiRouterProvider');
  }

  return route;
}
