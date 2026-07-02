import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { apiClient } from './client';
import { useApiRouter } from './router';

const TOKEN_KEY = 'auth_token';

export type AuthUser = {
  id: number;
  name: string | null;
  email: string | null;
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
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);

        if (!token) {
          if (active) {
            setStatus('unauthenticated');
          }
          return;
        }

        setAuthHeader(token);
        const { data } = await apiClient.get<AuthUser>(route('api.user'));
        if (active) {
          setUser(data);
          setStatus('authenticated');
        }
      } catch {
        // Stale/invalid token, or a platform without a secure store (web):
        // drop it and fall back to the signed-out state.
        setAuthHeader(null);
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
        if (active) {
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

    const { data } = await apiClient.post<{ token: string; user: AuthUser }>(route('api.auth.apple'), {
      id_token: credential.identityToken,
      name: name || undefined,
      email: credential.email ?? undefined,
    });

    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    setAuthHeader(data.token);
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
