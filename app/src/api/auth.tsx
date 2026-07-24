import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { isOfflineError } from '@/offline/connectivity';
import { clearQueue } from '@/offline/queue';
import { cacheKeys, clearCache, readCache, writeCache } from '@/offline/store';

import { apiClient } from './client';
import { useApiRouter } from './router';

const TOKEN_KEY = 'auth_token';

// The stored token is the source of truth for "signed in". Confirming it with
// the API is a refresh, not a gate — otherwise a plane with no signal locks the
// user out of an app whose content is mostly local anyway.
const BOOTSTRAP_TIMEOUT = 8000;

export type FamilyMember = 'alfonso' | 'saida';

export type AuthUser = {
  id: number;
  name: string | null;
  email: string | null;
  family_member: FamilyMember | null;
};

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
};

type AuthProviderProperties = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** The stored API token, for consumers outside the HTTP client (watch sync). */
export async function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY).catch(() => null);
}

function setAuthHeader(token: string | null): void {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

export function AuthProvider({ children }: AuthProviderProperties): ReactNode {
  const route = useApiRouter();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      let token: string | null = null;

      try {
        token = await SecureStore.getItemAsync(TOKEN_KEY);
      } catch {
        // A platform without a secure store (web) has no session to restore.
        token = null;
      }

      if (!token) {
        if (active) {
          setStatus('unauthenticated');
        }
        return;
      }

      setAuthHeader(token);

      // Enter on the cached profile first so the app is usable before — and
      // without — a round trip.
      const cached = readCache<AuthUser>(cacheKeys.user);

      if (cached && active) {
        setUser(cached);
        setStatus('authenticated');
      }

      try {
        const { data } = await apiClient.get<AuthUser>(route('api.user'), {
          timeout: BOOTSTRAP_TIMEOUT,
        });
        writeCache(cacheKeys.user, data);

        if (active) {
          setUser(data);
          setStatus('authenticated');
        }
      } catch (error) {
        if (isOfflineError(error)) {
          // Unreachable API says nothing about the token's validity, so the
          // session stands and revalidates whenever the network comes back.
          if (active) {
            setStatus('authenticated');
          }
          return;
        }

        // The API answered and rejected the token: it really is stale.
        setAuthHeader(null);
        clearCache();
        clearQueue();
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);

        if (active) {
          setUser(null);
          setStatus('unauthenticated');
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [route]);

  const signInWithApple = useCallback(async () => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Apple only returns the name on the very first authorization, so forward it
    // to the API when present; later sign-ins reuse the stored account.
    const name = credential.fullName
      ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(' ')
      : undefined;

    const { data } = await apiClient.post<{ token: string; user: AuthUser }>(
      route('api.auth.apple'),
      {
        id_token: credential.identityToken,
        name: name || undefined,
        email: credential.email ?? undefined,
      },
    );

    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    setAuthHeader(data.token);
    writeCache(cacheKeys.user, data.user);
    setUser(data.user);
    setStatus('authenticated');
  }, [route]);

  const signOut = useCallback(async () => {
    try {
      await apiClient.post(route('api.auth.logout'));
    } catch {
      // Ignore network/token errors — clearing the local session is enough.
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAuthHeader(null);
    clearCache();
    clearQueue();
    setUser(null);
    setStatus('unauthenticated');
  }, [route]);

  return (
    <AuthContext.Provider value={{ status, user, signInWithApple, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
