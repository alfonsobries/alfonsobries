import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import {
  fetchAccounts,
  fetchCategories,
  type ExpenseCategory,
  type PaymentAccount,
} from '@/api/expenses';
import { useApiRouter } from '@/api/router';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

/** The household's categories, cache-first and refreshed on focus. */
export function useExpenseCategories() {
  const route = useApiRouter();
  const fetcher = useCallback(() => fetchCategories(route), [route]);
  const resource = useCachedResource<ExpenseCategory[]>(cacheKeys.expenseCategories, fetcher);
  const { refresh } = resource;

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return resource;
}

/** The household's payment accounts, cache-first and refreshed on focus. */
export function usePaymentAccounts() {
  const route = useApiRouter();
  const fetcher = useCallback(() => fetchAccounts(route), [route]);
  const resource = useCachedResource<PaymentAccount[]>(cacheKeys.paymentAccounts, fetcher);
  const { refresh } = resource;

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return resource;
}
