import { useEffect, useRef } from 'react';

import { createEcho } from '@/api/echo';

/**
 * Calls back whenever the shared expenses change, from either partner's chat,
 * Telegram or an edit screen, so lists and totals refetch on their own.
 */
export function useExpensesChannel(onChange: () => void): void {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const echo = createEcho();
    if (!echo) {
      return;
    }

    echo.private('expenses').listen('.expenses.changed', () => onChangeRef.current());

    return () => {
      echo.leave('expenses');
      echo.disconnect();
    };
  }, []);
}
