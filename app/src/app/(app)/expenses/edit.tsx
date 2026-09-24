import { DatePicker, Host } from '@expo/ui/swift-ui';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Trash } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { type FamilyMember, useAuth } from '@/api/auth';
import {
  createExpense,
  deleteExpense,
  type Expense,
  type ExpenseInput,
  fetchExpense,
  updateExpense,
} from '@/api/expenses';
import { useApiRouter } from '@/api/router';
import { pickEmoji } from '@/components/ui/emoji-keyboard';
import { Input } from '@/components/ui/Input';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Select } from '@/components/ui/Select';
import { useExpenseCategories, usePaymentAccounts } from '@/hooks/use-expense-options';
import { useThemeColor } from '@/hooks/use-theme-color';
import { isOfflineError } from '@/offline/connectivity';

const NO_ACCOUNT = 'none';

function parseAmount(text: string): number | null {
  const normalized = text.replace(/[^0-9.]/g, '');
  const amount = Number(normalized);

  return normalized.length > 0 && Number.isFinite(amount) && amount > 0 ? amount : null;
}

/**
 * One expense, to fix what the assistant filed or to add one by hand: amount,
 * what it was, its emoji, category, account, who paid and when.
 */
export default function EditExpenseScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const expenseId = params.id ? Number(params.id) : null;
  const route = useApiRouter();
  const { user } = useAuth();
  const categories = useExpenseCategories();
  const accounts = usePaymentAccounts();
  const muted = useThemeColor('muted');
  const foreground = useThemeColor('foreground');
  const danger = useThemeColor('danger');

  const [loaded, setLoaded] = useState(expenseId === null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('MXN');
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [note, setNote] = useState('');
  const [emoji, setEmoji] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [paidBy, setPaidBy] = useState<FamilyMember>(user?.family_member ?? 'alfonso');
  const [spentAt, setSpentAt] = useState(() => new Date());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expenseId === null) {
      return;
    }

    void (async () => {
      try {
        const expense: Expense = await fetchExpense(route, expenseId);
        setAmount(String(expense.amount));
        setCurrency(expense.currency);
        setDescription(expense.description);
        setMerchant(expense.merchant ?? '');
        setNote(expense.note ?? '');
        setEmoji(expense.emoji);
        setCategoryId(expense.category?.id ?? null);
        setAccountId(expense.account?.id ?? null);
        setPaidBy(expense.paid_by);
        setSpentAt(new Date(expense.spent_at));
        setLoaded(true);
      } catch (error) {
        Alert.alert(
          'No se pudo abrir el gasto',
          isOfflineError(error) ? 'Estás sin conexión.' : 'Puede que ya no exista.',
        );
        router.back();
      }
    })();
  }, [expenseId, route]);

  const selectedCategory = categories.data?.find((category) => category.id === categoryId);
  const parsedAmount = parseAmount(amount);
  const canSave = parsedAmount !== null && description.trim().length > 0 && !saving;

  const categoryOptions = (categories.data ?? [])
    .filter((category) => !category.archived || category.id === categoryId)
    .map((category) => ({
      value: String(category.id),
      label: `${category.emoji}  ${category.name}`,
    }));

  const accountOptions = [
    { value: NO_ACCOUNT, label: 'Sin especificar' },
    ...(accounts.data ?? [])
      .filter((account) => !account.archived || account.id === accountId)
      .map((account) => ({
        value: String(account.id),
        label: `${account.emoji}  ${account.name}${account.last4 ? ` •${account.last4}` : ''}`,
      })),
  ];

  const handlePickEmoji = async () => {
    const picked = await pickEmoji();
    if (picked) {
      setEmoji(picked);
    }
  };

  const handleSave = async () => {
    if (!canSave || parsedAmount === null) {
      return;
    }

    const input: ExpenseInput = {
      amount: parsedAmount,
      currency,
      description: description.trim(),
      merchant: merchant.trim() || null,
      note: note.trim() || null,
      emoji,
      paid_by: paidBy,
      category_id: categoryId,
      payment_account_id: accountId,
      spent_at: spentAt.toISOString(),
    };

    setSaving(true);
    try {
      if (expenseId) {
        await updateExpense(route, expenseId, input);
      } else {
        await createExpense(route, input);
      }
      router.back();
    } catch (error) {
      setSaving(false);
      Alert.alert(
        'No se pudo guardar',
        isOfflineError(error) ? 'Estás sin conexión.' : 'Revisa los datos e intenta de nuevo.',
      );
    }
  };

  const handleDelete = () => {
    if (!expenseId) {
      return;
    }

    Alert.alert('¿Eliminar este gasto?', 'Deja de contar en los totales.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteExpense(route, expenseId);
              router.back();
            } catch (error) {
              Alert.alert(
                'No se pudo eliminar',
                isOfflineError(error) ? 'Estás sin conexión.' : 'Intenta de nuevo.',
              );
            }
          })();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: expenseId ? 'Gasto' : 'Nuevo gasto',
          headerLeft: () => (
            <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.back()}>
              <Text className="text-[17px] text-foreground">Cancelar</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSave }}
              disabled={!canSave}
              hitSlop={8}
              onPress={() => void handleSave()}
            >
              {saving ? (
                <ActivityIndicator color={muted} />
              ) : (
                <Text
                  className={`text-[17px] font-semibold ${canSave ? 'text-primary-emphasis' : 'text-muted'}`}
                >
                  Guardar
                </Text>
              )}
            </Pressable>
          ),
        }}
      />

      {!loaded ? (
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator color={muted} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 bg-background"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-6 px-4 pb-12 pt-4"
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center gap-4 pt-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Emoji: ${emoji ?? selectedCategory?.emoji ?? 'ninguno'}. Toca para cambiarlo`}
              onPress={() => void handlePickEmoji()}
              className="h-20 w-20 items-center justify-center rounded-3xl bg-surface active:opacity-70"
            >
              <Text className="text-5xl" allowFontScaling={false}>
                {emoji ?? selectedCategory?.emoji ?? '🪙'}
              </Text>
            </Pressable>

            <View className="flex-row items-baseline">
              <Text className="text-4xl font-semibold text-muted">$</Text>
              <TextInput
                accessibilityLabel="Monto"
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={muted}
                keyboardType="decimal-pad"
                autoFocus={expenseId === null}
                className="min-w-16 text-[44px] font-semibold"
                style={{ color: foreground }}
              />
              {currency !== 'MXN' ? (
                <Text className="ml-2 text-xl font-medium text-muted">{currency}</Text>
              ) : null}
            </View>
          </View>

          <Input
            label="Qué fue"
            placeholder="Café en Starbucks"
            value={description}
            onChangeText={setDescription}
            maxLength={117}
          />

          <Select
            label="Categoría"
            placeholder="Elige una categoría"
            value={categoryId ? String(categoryId) : null}
            onChange={(value) => setCategoryId(Number(value))}
            options={categoryOptions}
            searchPlaceholder="Buscar categoría"
          />

          <Select
            label="Cómo se pagó"
            value={accountId ? String(accountId) : NO_ACCOUNT}
            onChange={(value) => setAccountId(value === NO_ACCOUNT ? null : Number(value))}
            options={accountOptions}
            searchable={false}
          />

          <View className="gap-1.5">
            <Text className="px-4 text-sm font-medium text-foreground">Quién pagó</Text>
            <SegmentedControl<FamilyMember>
              value={paidBy}
              onChange={setPaidBy}
              options={[
                { value: 'alfonso', label: 'Alfonso' },
                { value: 'saida', label: 'Saida' },
              ]}
            />
          </View>

          <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface px-4 py-2">
            <Text className="text-sm font-medium text-foreground">Cuándo</Text>
            <Host matchContents>
              <DatePicker
                selection={spentAt}
                displayedComponents={['date', 'hourAndMinute']}
                range={{ end: new Date() }}
                onDateChange={setSpentAt}
              />
            </Host>
          </View>

          <Input
            label="Lugar (opcional)"
            placeholder="Starbucks"
            value={merchant}
            onChangeText={setMerchant}
            maxLength={77}
          />

          <Input
            label="Nota (opcional)"
            placeholder="Algo que valga la pena recordar"
            value={note}
            onChangeText={setNote}
            multiline
          />

          {expenseId ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleDelete}
              className="h-12 flex-row items-center justify-center gap-2 rounded-full border border-border active:bg-surface-selected"
            >
              <Trash size={18} color={danger} />
              <Text className="text-base font-medium text-danger">Eliminar gasto</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      )}
    </>
  );
}
