import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Plus } from 'phosphor-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, Text, View } from 'react-native';

import type { FamilyMember } from '@/api/auth';
import { type Expense, type ExpenseFilters, fetchExpenses } from '@/api/expenses';
import { useApiRouter } from '@/api/router';
import { ExpenseRow } from '@/components/home/ExpenseRow';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useExpensesChannel } from '@/hooks/use-expenses-channel';
import { useThemeColor } from '@/hooks/use-theme-color';
import { dayKey, formatDayLabel } from '@/lib/expense-dates';
import { formatMoney } from '@/lib/money';
import { cacheKeys, readCache, writeCache } from '@/offline/store';

type Payer = FamilyMember | 'all';

type Section = {
  key: string;
  title: string;
  total: number;
  data: Expense[];
};

function sectionsFor(expenses: Expense[]): Section[] {
  const sections: Section[] = [];

  for (const expense of expenses) {
    const date = new Date(expense.spent_at);
    const key = dayKey(date);
    let section = sections.at(-1);

    if (!section || section.key !== key) {
      section = { key, title: formatDayLabel(date), total: 0, data: [] };
      sections.push(section);
    }

    section.data.push(expense);
    if (expense.currency === 'MXN') {
      section.total += expense.amount;
    }
  }

  return sections;
}

/**
 * Every expense, newest first and grouped by day, with search and a filter by
 * who paid. Opened from the chat's menu, or from a stats row with that row's
 * category or account and period already applied.
 */
export default function ExpensesScreen() {
  const params = useLocalSearchParams<{
    title?: string;
    from?: string;
    to?: string;
    category_id?: string;
    payment_account_id?: string;
    paid_by?: FamilyMember;
  }>();
  const route = useApiRouter();
  const muted = useThemeColor('muted');
  const tint = useThemeColor('foreground');

  const [payer, setPayer] = useState<Payer>(params.paid_by ?? 'all');
  const [search, setSearch] = useState('');

  const filters = useMemo<ExpenseFilters>(
    () => ({
      from: params.from,
      to: params.to,
      category_id: params.category_id ? Number(params.category_id) : undefined,
      payment_account_id: params.payment_account_id ? Number(params.payment_account_id) : undefined,
      paid_by: payer === 'all' ? undefined : payer,
      search: search.trim() || undefined,
    }),
    [params.from, params.to, params.category_id, params.payment_account_id, payer, search],
  );

  const cacheKey = cacheKeys.expenses(JSON.stringify(filters));
  const [expenses, setExpenses] = useState<Expense[] | null>(
    () => readCache<Expense[]>(cacheKey) ?? null,
  );
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const page = await fetchExpenses(route, filters);
      writeCache(cacheKey, page.data);
      setExpenses(page.data);
      setHasMore(page.has_more);
      setFailed(false);
    } catch {
      setExpenses((current) => current ?? readCache<Expense[]>(cacheKey));
      setFailed(true);
    }
  }, [cacheKey, filters, route]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useExpensesChannel(refresh);

  const loadMore = async () => {
    const last = expenses?.at(-1);

    if (!hasMore || loadingMore || !last) {
      return;
    }

    setLoadingMore(true);
    try {
      const page = await fetchExpenses(route, filters, last.id);
      setExpenses((current) => [...(current ?? []), ...page.data]);
      setHasMore(page.has_more);
    } catch {
      // Scrolling to the end again retries.
    } finally {
      setLoadingMore(false);
    }
  };

  const sections = useMemo(() => sectionsFor(expenses ?? []), [expenses]);

  return (
    <>
      <Stack.Screen
        options={{
          title: params.title ?? 'Gastos',
          headerSearchBarOptions: {
            placeholder: 'Buscar gastos',
            hideWhenScrolling: false,
            onChangeText: (event) => setSearch(event.nativeEvent.text),
            onCancelButtonPress: () => setSearch(''),
          },
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Agregar gasto"
              hitSlop={8}
              onPress={() => router.push('/expenses/edit')}
              className="h-11 w-11 items-center justify-center active:opacity-60"
            >
              <Plus size={22} color={tint} />
            </Pressable>
          ),
        }}
      />

      <SectionList
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        sections={sections}
        keyExtractor={(expense) => String(expense.id)}
        stickySectionHeadersEnabled={false}
        contentContainerClassName="pb-12"
        ListHeaderComponent={
          <View className="px-4 pb-2 pt-3">
            <SegmentedControl<Payer>
              value={payer}
              onChange={setPayer}
              options={[
                { value: 'all', label: 'Los dos' },
                { value: 'alfonso', label: 'Alfonso' },
                { value: 'saida', label: 'Saida' },
              ]}
            />
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View className="flex-row items-baseline justify-between px-4 pb-1.5 pt-5">
            <Text className="text-sm font-semibold text-foreground">{section.title}</Text>
            <Text className="text-sm tabular-nums text-muted">{formatMoney(section.total)}</Text>
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <View
            className={`mx-4 bg-surface ${index === 0 ? 'rounded-t-2xl' : ''} ${
              index === section.data.length - 1 ? 'rounded-b-2xl' : 'border-b border-border'
            } overflow-hidden`}
          >
            <ExpenseRow
              expense={item}
              showPayer={payer === 'all'}
              onPress={() =>
                router.push({ pathname: '/expenses/edit', params: { id: String(item.id) } })
              }
            />
          </View>
        )}
        ListEmptyComponent={
          expenses === null && !failed ? (
            <View className="items-center py-16">
              <ActivityIndicator color={muted} />
            </View>
          ) : (
            <View className="mx-4 mt-6 items-center rounded-3xl bg-surface px-6 py-10">
              <Text className="text-4xl">🧾</Text>
              <Text className="mt-3 text-center text-base text-muted">
                {failed && expenses === null
                  ? 'No se pudieron cargar los gastos. Revisa tu conexión.'
                  : search
                    ? 'Nada coincide con esa búsqueda.'
                    : 'Aún no hay gastos aquí.'}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-6">
              <ActivityIndicator color={muted} />
            </View>
          ) : null
        }
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.5}
        keyboardDismissMode="on-drag"
      />
    </>
  );
}
