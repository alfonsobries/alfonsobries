import { Pressable, Text, View } from 'react-native';

import type { Expense } from '@/api/expenses';
import { formatWhen } from '@/lib/expense-dates';
import { formatMoney } from '@/lib/money';

type ExpenseRowProperties = {
  expense: Expense;
  onPress?: () => void;
  /** Show when it happened (lists); chat cards leave it out. */
  showWhen?: boolean;
  /** Show who paid; leave it out where the list is already one person's. */
  showPayer?: boolean;
};

const PAYER_NAMES = { alfonso: 'Alfonso', saida: 'Saida' } as const;

/**
 * One expense as a row: its emoji on a soft tile, what it was, where it's
 * filed, and the amount. Shared by the chat cards and every list.
 */
export function ExpenseRow({
  expense,
  onPress,
  showWhen = false,
  showPayer = true,
}: ExpenseRowProperties) {
  const details = [
    expense.category?.name,
    expense.account
      ? `${expense.account.name}${expense.account.last4 ? ` •${expense.account.last4}` : ''}`
      : null,
    showPayer ? PAYER_NAMES[expense.paid_by] : null,
    showWhen ? formatWhen(expense.spent_at) : null,
  ].filter(Boolean);

  const amount = formatMoney(expense.amount, expense.currency);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${expense.description}, ${amount}${expense.deleted ? ', eliminado' : ''}`}
      accessibilityHint={onPress ? 'Abre el gasto para editarlo' : undefined}
      disabled={!onPress}
      onPress={onPress}
      className="flex-row items-center gap-3 px-3 py-2.5 active:bg-surface-selected"
    >
      <View
        className={`h-11 w-11 items-center justify-center rounded-2xl bg-surface-selected ${
          expense.deleted ? 'opacity-40' : ''
        }`}
      >
        <Text className="text-2xl" allowFontScaling={false}>
          {expense.emoji ?? '🪙'}
        </Text>
      </View>

      <View className="flex-1">
        <Text
          numberOfLines={1}
          className={`text-base font-medium ${expense.deleted ? 'text-muted line-through' : 'text-foreground'}`}
        >
          {expense.description}
        </Text>
        {details.length > 0 ? (
          <Text numberOfLines={1} className="mt-0.5 text-sm text-muted">
            {details.join(' · ')}
          </Text>
        ) : null}
      </View>

      <Text
        className={`text-base font-semibold tabular-nums ${expense.deleted ? 'text-muted line-through' : 'text-foreground'}`}
      >
        {amount}
      </Text>
    </Pressable>
  );
}
