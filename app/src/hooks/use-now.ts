import { useEffect, useState } from 'react';

/** The current time in epoch milliseconds, re-read every `intervalMs` so relative labels stay true. */
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return now;
}
