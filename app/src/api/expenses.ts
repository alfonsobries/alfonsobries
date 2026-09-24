import { apiClient } from './client';
import type { FamilyMember } from './auth';
import { useApiRouter } from './router';

type ApiRoute = ReturnType<typeof useApiRouter>;

export type ExpenseCategory = {
  id: number;
  name: string;
  emoji: string;
  archived: boolean;
};

export type PaymentAccountKind = 'credit_card' | 'debit_card' | 'cash' | 'transfer' | 'wallet';

export type PaymentAccount = {
  id: number;
  name: string;
  emoji: string;
  kind: PaymentAccountKind;
  last4: string | null;
  /** Whose it is; null when both use it. */
  owner: FamilyMember | null;
  archived: boolean;
};

export type Expense = {
  id: number;
  amount: number;
  currency: string;
  description: string;
  merchant: string | null;
  emoji: string | null;
  note: string | null;
  paid_by: FamilyMember;
  spent_at: string;
  source: 'chat' | 'telegram' | 'manual';
  category: ExpenseCategory | null;
  account: PaymentAccount | null;
  deleted: boolean;
  created_at: string;
};

export type ExpenseInput = {
  amount?: number;
  currency?: string;
  description?: string;
  merchant?: string | null;
  note?: string | null;
  emoji?: string | null;
  paid_by?: FamilyMember;
  category_id?: number | null;
  payment_account_id?: number | null;
  spent_at?: string;
};

export type ExpenseFilters = {
  from?: string;
  to?: string;
  paid_by?: FamilyMember;
  category_id?: number;
  payment_account_id?: number;
  search?: string;
};

export type ExpensePage = {
  data: Expense[];
  has_more: boolean;
};

export type ShareRow = {
  total: number;
  count: number;
  share: number;
};

export type SpendingSummary = {
  from: string;
  to: string;
  currency: string;
  total: number;
  count: number;
  previous_total: number;
  by_category: (ShareRow & { category: ExpenseCategory | null })[];
  by_person: (ShareRow & { member: FamilyMember })[];
  by_account: (ShareRow & { account: PaymentAccount | null })[];
  series: { unit: 'day' | 'month'; points: { date: string; total: number }[] };
  largest: Expense[];
  other_currencies: { currency: string; total: number; count: number }[];
};

export const ACCOUNT_KINDS: { value: PaymentAccountKind; label: string; emoji: string }[] = [
  { value: 'credit_card', label: 'Tarjeta de crédito', emoji: '💳' },
  { value: 'debit_card', label: 'Tarjeta de débito', emoji: '💳' },
  { value: 'cash', label: 'Efectivo', emoji: '💵' },
  { value: 'transfer', label: 'Transferencia', emoji: '🏦' },
  { value: 'wallet', label: 'Monedero digital', emoji: '📱' },
];

export async function fetchExpenses(
  route: ApiRoute,
  filters: ExpenseFilters = {},
  before?: number,
): Promise<ExpensePage> {
  const { data } = await apiClient.get<ExpensePage>(route('api.expenses.index'), {
    params: { ...filters, before },
  });

  return data;
}

export async function fetchExpense(route: ApiRoute, expense: number): Promise<Expense> {
  const { data } = await apiClient.get<{ data: Expense }>(route('api.expenses.show', { expense }));

  return data.data;
}

export async function createExpense(route: ApiRoute, input: ExpenseInput): Promise<Expense> {
  const { data } = await apiClient.post<{ data: Expense }>(route('api.expenses.store'), input);

  return data.data;
}

export async function updateExpense(
  route: ApiRoute,
  expense: number,
  input: ExpenseInput,
): Promise<Expense> {
  const { data } = await apiClient.patch<{ data: Expense }>(
    route('api.expenses.update', { expense }),
    input,
  );

  return data.data;
}

export async function deleteExpense(route: ApiRoute, expense: number): Promise<Expense> {
  const { data } = await apiClient.delete<{ data: Expense }>(
    route('api.expenses.destroy', { expense }),
  );

  return data.data;
}

export async function restoreExpense(route: ApiRoute, expense: number): Promise<Expense> {
  const { data } = await apiClient.post<{ data: Expense }>(
    route('api.expenses.restore', { expense }),
  );

  return data.data;
}

export async function fetchSpendingSummary(
  route: ApiRoute,
  filters: ExpenseFilters & { from: string; to: string },
): Promise<SpendingSummary> {
  const { data } = await apiClient.get<{ data: SpendingSummary }>(route('api.expenses.summary'), {
    params: filters,
  });

  return data.data;
}

export async function fetchCategories(route: ApiRoute): Promise<ExpenseCategory[]> {
  const { data } = await apiClient.get<{ data: ExpenseCategory[] }>(
    route('api.expense-categories.index'),
  );

  return data.data;
}

export async function saveCategory(
  route: ApiRoute,
  input: { name?: string; emoji?: string; archived?: boolean },
  id?: number,
): Promise<ExpenseCategory> {
  const { data } = id
    ? await apiClient.patch<{ data: ExpenseCategory }>(
        route('api.expense-categories.update', { expenseCategory: id }),
        input,
      )
    : await apiClient.post<{ data: ExpenseCategory }>(route('api.expense-categories.store'), input);

  return data.data;
}

export async function deleteCategory(route: ApiRoute, id: number): Promise<void> {
  await apiClient.delete(route('api.expense-categories.destroy', { expenseCategory: id }));
}

export async function reorderCategories(
  route: ApiRoute,
  ids: number[],
): Promise<ExpenseCategory[]> {
  const { data } = await apiClient.put<{ data: ExpenseCategory[] }>(
    route('api.expense-categories.reorder'),
    { ids },
  );

  return data.data;
}

export async function fetchAccounts(route: ApiRoute): Promise<PaymentAccount[]> {
  const { data } = await apiClient.get<{ data: PaymentAccount[] }>(
    route('api.payment-accounts.index'),
  );

  return data.data;
}

export async function saveAccount(
  route: ApiRoute,
  input: Partial<Omit<PaymentAccount, 'id' | 'archived'>> & { archived?: boolean },
  id?: number,
): Promise<PaymentAccount> {
  const { data } = id
    ? await apiClient.patch<{ data: PaymentAccount }>(
        route('api.payment-accounts.update', { paymentAccount: id }),
        input,
      )
    : await apiClient.post<{ data: PaymentAccount }>(route('api.payment-accounts.store'), input);

  return data.data;
}

export async function deleteAccount(route: ApiRoute, id: number): Promise<void> {
  await apiClient.delete(route('api.payment-accounts.destroy', { paymentAccount: id }));
}
