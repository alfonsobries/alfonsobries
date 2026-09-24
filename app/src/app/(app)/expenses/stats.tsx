import { Chart, Host } from '@expo/ui/swift-ui';
import { router, Stack, useFocusEffect } from 'expo-router';
import { CaretLeft, CaretRight, TrendDown, TrendUp } from 'phosphor-react-native';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import type { FamilyMember } from '@/api/auth';
import { fetchSpendingSummary, type SpendingSummary } from '@/api/expenses';
import { useApiRouter } from '@/api/router';
import { AvatarCircle } from '@/components/family/AvatarCircle';
import { ExpenseRow } from '@/components/home/ExpenseRow';
import { ShareBarRow } from '@/components/home/ShareBarRow';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useExpensesChannel } from '@/hooks/use-expenses-channel';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatMonth, formatShortMonth, parseDayKey } from '@/lib/expense-dates';
import { formatMoney } from '@/lib/money';
import {
  isCurrentPeriod,
  type Period,
  type PeriodKind,
  periodContaining,
  previousLabel,
  shiftPeriod,
} from '@/lib/periods';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

type Payer = FamilyMember | 'all';

const PAYER_NAMES = { alfonso: 'Alfonso', saida: 'Saida' } as const;
const WEEKDAYS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

const rangeFormatter = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' });

function periodTitle(period: Period): string {
  if (period.kind === 'month') {
    return formatMonth(period.from);
  }

  if (period.kind === 'year') {
    return String(period.from.getFullYear());
  }

  const last = new Date(period.to);
  last.setDate(last.getDate() - 1);

  return `${rangeFormatter.format(period.from)} - ${rangeFormatter.format(last)}`.replace(
    /\./g,
    '',
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="px-4 text-xs font-medium uppercase tracking-wide text-muted">{title}</Text>
      <View className="overflow-hidden rounded-3xl bg-surface">{children}</View>
    </View>
  );
}

function Divider() {
  return <View className="ml-4 h-px bg-border" />;
}

/**
 * Where the money goes: a period's total against the one before, the trend
 * inside it, and the breakdown by category, person and account. Every row
 * opens the expenses behind it.
 */
export default function SpendingStatsScreen() {
  const route = useApiRouter();
  const muted = useThemeColor('muted');
  const foreground = useThemeColor('foreground');
  const bar = useThemeColor('primary-emphasis');

  const [period, setPeriod] = useState<Period>(() => periodContaining('month', new Date()));
  const [payer, setPayer] = useState<Payer>('all');

  const periodKey = `${period.kind}-${period.from.toISOString()}-${payer}`;
  const fetcher = useCallback(
    () =>
      fetchSpendingSummary(route, {
        from: period.from.toISOString(),
        to: period.to.toISOString(),
        paid_by: payer === 'all' ? undefined : payer,
      }),
    [route, period, payer],
  );
  const summary = useCachedResource<SpendingSummary>(cacheKeys.spendingSummary(periodKey), fetcher);
  const { refresh } = summary;

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useExpensesChannel(refresh);

  const data = summary.data;
  const current = isCurrentPeriod(period);

  const chartPoints = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.series.points.map((point, index) => {
      const date = parseDayKey(point.date);
      const x =
        data.series.unit === 'month'
          ? formatShortMonth(date)
          : period.kind === 'week'
            ? (WEEKDAYS[index] ?? String(date.getDate()))
            : date.getDate();

      return { x, y: point.total, color: bar };
    });
  }, [data, period.kind, bar]);

  const openExpenses = (params: Record<string, string>) => {
    router.push({
      pathname: '/expenses',
      params: {
        from: period.from.toISOString(),
        to: period.to.toISOString(),
        ...(payer === 'all' ? {} : { paid_by: payer }),
        ...params,
      },
    });
  };

  const delta =
    data && data.previous_total > 0
      ? (data.total - data.previous_total) / data.previous_total
      : null;
  const biggestCategory = Math.max(...(data?.by_category.map((row) => row.total) ?? [0]), 1);
  const biggestAccount = Math.max(...(data?.by_account.map((row) => row.total) ?? [0]), 1);
  const biggestPerson = Math.max(...(data?.by_person.map((row) => row.total) ?? [0]), 1);

  return (
    <>
      <Stack.Screen options={{ title: 'Estadísticas' }} />

      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 px-4 pb-16 pt-3"
      >
        <View className="gap-3">
          <SegmentedControl<PeriodKind>
            value={period.kind}
            onChange={(kind) => setPeriod(periodContaining(kind, new Date()))}
            options={[
              { value: 'week', label: 'Semana' },
              { value: 'month', label: 'Mes' },
              { value: 'year', label: 'Año' },
            ]}
          />

          <View className="flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Periodo anterior"
              hitSlop={8}
              onPress={() => setPeriod(shiftPeriod(period, -1))}
              className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-selected"
            >
              <CaretLeft size={20} color={foreground} />
            </Pressable>
            <Text accessibilityRole="header" className="text-lg font-semibold text-foreground">
              {periodTitle(period)}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Periodo siguiente"
              accessibilityState={{ disabled: current }}
              disabled={current}
              hitSlop={8}
              onPress={() => setPeriod(shiftPeriod(period, 1))}
              className={`h-11 w-11 items-center justify-center rounded-full ${
                current ? 'opacity-30' : 'active:bg-surface-selected'
              }`}
            >
              <CaretRight size={20} color={foreground} />
            </Pressable>
          </View>

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

        {!data ? (
          <View className="items-center py-16">
            {summary.status === 'error' ? (
              <Text className="text-center text-base text-muted">
                No se pudieron cargar las estadísticas. Revisa tu conexión.
              </Text>
            ) : (
              <ActivityIndicator color={muted} />
            )}
          </View>
        ) : (
          <>
            <View className="items-center gap-1 rounded-3xl bg-surface px-4 py-6">
              <Text className="text-sm text-muted">
                {payer === 'all' ? 'Gastaron' : `${PAYER_NAMES[payer]} gastó`}
              </Text>
              <Text
                accessibilityRole="summary"
                className="text-[40px] font-semibold tabular-nums text-foreground"
              >
                {formatMoney(data.total)}
              </Text>
              <Text className="text-sm text-muted">
                {data.count === 1 ? '1 gasto' : `${data.count} gastos`}
              </Text>
              {delta !== null ? (
                <View className="mt-2 flex-row items-center gap-1.5 rounded-full bg-surface-selected px-3 py-1">
                  {delta >= 0 ? (
                    <TrendUp size={14} color={foreground} weight="bold" />
                  ) : (
                    <TrendDown size={14} color={foreground} weight="bold" />
                  )}
                  <Text className="text-sm text-foreground">
                    {`${delta >= 0 ? '+' : '-'}${Math.abs(Math.round(delta * 100))}% vs ${previousLabel(period.kind)}`}
                  </Text>
                </View>
              ) : null}
            </View>

            {data.count === 0 ? (
              <View className="items-center rounded-3xl bg-surface px-6 py-10">
                <Text className="text-4xl">🌱</Text>
                <Text className="mt-3 text-center text-base text-muted">
                  No hay gastos en este periodo.
                </Text>
              </View>
            ) : (
              <>
                <Card title={data.series.unit === 'month' ? 'Por mes' : 'Por día'}>
                  <View className="px-2 py-4">
                    <Host style={{ height: 180 }}>
                      <Chart
                        type="bar"
                        data={chartPoints}
                        showGrid
                        animate
                        barStyle={{ cornerRadius: 3 }}
                      />
                    </Host>
                  </View>
                </Card>

                <Card title="Por categoría">
                  {data.by_category.map((row, index) => (
                    <Fragment key={row.category?.id ?? 0}>
                      {index > 0 ? <Divider /> : null}
                      <ShareBarRow
                        leading={row.category?.emoji ?? '📦'}
                        label={row.category?.name ?? 'Sin categoría'}
                        total={row.total}
                        count={row.count}
                        share={row.share}
                        relative={row.total / biggestCategory}
                        onPress={
                          row.category
                            ? () =>
                                openExpenses({
                                  category_id: String(row.category?.id),
                                  title: row.category?.name ?? 'Gastos',
                                })
                            : undefined
                        }
                      />
                    </Fragment>
                  ))}
                </Card>

                {payer === 'all' ? (
                  <Card title="Por persona">
                    {data.by_person.map((row, index) => (
                      <Fragment key={row.member}>
                        {index > 0 ? <Divider /> : null}
                        <ShareBarRow
                          leading={<AvatarCircle person={row.member} size={28} />}
                          label={PAYER_NAMES[row.member]}
                          total={row.total}
                          count={row.count}
                          share={row.share}
                          relative={row.total / biggestPerson}
                          onPress={() => setPayer(row.member)}
                        />
                      </Fragment>
                    ))}
                  </Card>
                ) : null}

                <Card title="Por cuenta">
                  {data.by_account.map((row, index) => (
                    <Fragment key={row.account?.id ?? 0}>
                      {index > 0 ? <Divider /> : null}
                      <ShareBarRow
                        leading={row.account?.emoji ?? '❔'}
                        label={row.account?.name ?? 'Sin especificar'}
                        total={row.total}
                        count={row.count}
                        share={row.share}
                        relative={row.total / biggestAccount}
                        onPress={
                          row.account
                            ? () =>
                                openExpenses({
                                  payment_account_id: String(row.account?.id),
                                  title: row.account?.name ?? 'Gastos',
                                })
                            : undefined
                        }
                      />
                    </Fragment>
                  ))}
                </Card>

                <Card title="Los más grandes">
                  {data.largest.map((expense, index) => (
                    <Fragment key={expense.id}>
                      {index > 0 ? <Divider /> : null}
                      <ExpenseRow
                        expense={expense}
                        showWhen
                        showPayer={payer === 'all'}
                        onPress={() =>
                          router.push({
                            pathname: '/expenses/edit',
                            params: { id: String(expense.id) },
                          })
                        }
                      />
                    </Fragment>
                  ))}
                </Card>
              </>
            )}

            {data.other_currencies.length > 0 ? (
              <Text className="px-4 text-sm text-muted">
                {`Aparte, en otras monedas: ${data.other_currencies
                  .map((entry) => formatMoney(entry.total, entry.currency))
                  .join(', ')}. No se suman al total.`}
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>
    </>
  );
}
