import { router, Stack } from 'expo-router';
import { Plus } from 'phosphor-react-native';
import { Fragment } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import type { ExpenseCategory } from '@/api/expenses';
import { ManageRow } from '@/components/home/ManageRow';
import { useExpenseCategories } from '@/hooks/use-expense-options';
import { useThemeColor } from '@/hooks/use-theme-color';

function openEditor(category?: ExpenseCategory) {
  router.push({
    pathname: '/expenses/category',
    params: category
      ? {
          id: String(category.id),
          name: category.name,
          emoji: category.emoji,
          archived: category.archived ? '1' : '0',
        }
      : {},
  });
}

function Section({ title, categories }: { title?: string; categories: ExpenseCategory[] }) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <View className="gap-2">
      {title ? (
        <Text className="px-4 text-xs font-medium uppercase tracking-wide text-muted">{title}</Text>
      ) : null}
      <View className="overflow-hidden rounded-2xl bg-surface">
        {categories.map((category, index) => (
          <Fragment key={category.id}>
            {index > 0 ? <View className="ml-[68px] h-px bg-border" /> : null}
            <ManageRow
              emoji={category.emoji}
              title={category.name}
              dimmed={category.archived}
              onPress={() => openEditor(category)}
            />
          </Fragment>
        ))}
      </View>
    </View>
  );
}

/**
 * The categories the assistant files expenses into. Archived ones keep their
 * history but stop being offered.
 */
export default function ExpenseCategoriesScreen() {
  const categories = useExpenseCategories();
  const tint = useThemeColor('foreground');
  const muted = useThemeColor('muted');

  const active = categories.data?.filter((category) => !category.archived) ?? [];
  const archived = categories.data?.filter((category) => category.archived) ?? [];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Categorías',
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Nueva categoría"
              hitSlop={8}
              onPress={() => openEditor()}
              className="h-11 w-11 items-center justify-center active:opacity-60"
            >
              <Plus size={22} color={tint} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-7 px-4 pb-16 pt-4"
      >
        {categories.data === null ? (
          <View className="items-center py-16">
            {categories.status === 'error' ? (
              <Text className="text-base text-muted">
                No se pudieron cargar. Revisa tu conexión.
              </Text>
            ) : (
              <ActivityIndicator color={muted} />
            )}
          </View>
        ) : (
          <>
            <Section categories={active} />
            <Section title="Archivadas" categories={archived} />
            <Text className="px-4 text-sm text-muted">
              El asistente usa estas categorías al anotar cada gasto.
            </Text>
          </>
        )}
      </ScrollView>
    </>
  );
}
