import * as Updates from 'expo-updates';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'ready';

interface EasUpdateResult {
  status: UpdateStatus;
  applyUpdate: () => Promise<void>;
  dismissUpdate: () => void;
  dismissed: boolean;
}

const AUTO_DISMISS_MS = 8_000;

export function useEasUpdate(): EasUpdateResult {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [dismissed, setDismissed] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<UpdateStatus>('idle');

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) {
      return;
    }

    // Guards against overlapping checks (launch + foreground firing together).
    let inFlight = false;

    const checkForUpdate = async (): Promise<void> => {
      // Already downloading or waiting to restart — nothing to re-check.
      if (inFlight || statusRef.current === 'downloading' || statusRef.current === 'ready') {
        return;
      }

      inFlight = true;
      setStatus('checking');

      try {
        const update = await Updates.checkForUpdateAsync();

        if (!update.isAvailable) {
          setStatus('idle');
          return;
        }

        setStatus('downloading');
        await Updates.fetchUpdateAsync();
        setStatus('ready');
        // A freshly downloaded update supersedes a previously dismissed pill.
        setDismissed(false);
      } catch {
        setStatus('idle');
      } finally {
        inFlight = false;
      }
    };

    void checkForUpdate();

    // Re-check whenever the app returns to the foreground, so an update
    // shipped mid-session reaches the user without a full relaunch.
    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') {
        void checkForUpdate();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (status === 'ready' && !dismissed) {
      dismissTimerRef.current = setTimeout(() => {
        setDismissed(true);
      }, AUTO_DISMISS_MS);
    }

    return () => {
      if (dismissTimerRef.current !== null) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };
  }, [status, dismissed]);

  const applyUpdate = useCallback(async (): Promise<void> => {
    try {
      await Updates.reloadAsync();
    } catch {
      // Reload failed — update will apply on next app open.
    }
  }, []);

  const dismissUpdate = useCallback((): void => {
    setDismissed(true);
  }, []);

  return { status, applyUpdate, dismissUpdate, dismissed };
}
