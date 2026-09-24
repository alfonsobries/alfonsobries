import { ArrowCounterClockwise } from 'phosphor-react-native';
import { Fragment } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { HomeMessage } from '@/api/home';
import { useThemeColor } from '@/hooks/use-theme-color';

import { ExpenseRow } from './ExpenseRow';

type ExpenseCardsProperties = {
  expenses: HomeMessage['expenses'];
  onOpen: (expenseId: number) => void;
  onRestore: (expenseId: number) => void;
};

const ACTION_LABELS = {
  created: 'Registrado',
  updated: 'Actualizado',
  deleted: 'Eliminado',
} as const;

/**
 * The expenses an answer touched, as a grouped card under the bubble. Each
 * row opens the expense; a removed one offers to bring it back.
 */
export function ExpenseCards({ expenses, onOpen, onRestore }: ExpenseCardsProperties) {
  const tint = useThemeColor('primary-emphasis');
  const actions = new Set(expenses.map((expense) => expense.action));
  const label = actions.size === 1 ? ACTION_LABELS[expenses[0].action] : 'Cambios';

  return (
    <View className="w-full overflow-hidden rounded-3xl border border-border bg-surface">
      <Text className="px-4 pb-0.5 pt-3 text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </Text>
      {expenses.map((expense, index) => (
        <Fragment key={`${expense.id}-${expense.action}`}>
          {index > 0 ? <View className="ml-[68px] h-px bg-border" /> : null}
          <ExpenseRow
            expense={expense}
            onPress={expense.deleted ? undefined : () => onOpen(expense.id)}
          />
          {expense.deleted ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Deshacer, recuperar ${expense.description}`}
              onPress={() => onRestore(expense.id)}
              hitSlop={6}
              className="mb-2 ml-[68px] flex-row items-center gap-1.5 self-start rounded-full px-1 py-1 active:opacity-60"
            >
              <ArrowCounterClockwise size={14} color={tint} weight="bold" />
              <Text className="text-sm font-medium text-primary-emphasis">Deshacer</Text>
            </Pressable>
          ) : null}
        </Fragment>
      ))}
    </View>
  );
}
