import { router, Stack } from 'expo-router';
import { Plus } from 'phosphor-react-native';
import { Fragment } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { ACCOUNT_KINDS, type PaymentAccount } from '@/api/expenses';
import { ManageRow } from '@/components/home/ManageRow';
import { usePaymentAccounts } from '@/hooks/use-expense-options';
import { useThemeColor } from '@/hooks/use-theme-color';

const OWNER_NAMES = { alfonso: 'de Alfonso', saida: 'de Saida' } as const;

function describe(account: PaymentAccount): string {
  const kind = ACCOUNT_KINDS.find((entry) => entry.value === account.kind)?.label ?? '';
  const owner = account.owner ? OWNER_NAMES[account.owner] : 'compartida';

  return [kind, account.last4 ? `•${account.last4}` : null, owner].filter(Boolean).join(' · ');
}

function openEditor(account?: PaymentAccount) {
  router.push({
    pathname: '/expenses/account',
    params: account
      ? {
          id: String(account.id),
          name: account.name,
          emoji: account.emoji,
          kind: account.kind,
          last4: account.last4 ?? '',
          owner: account.owner ?? '',
          archived: account.archived ? '1' : '0',
        }
      : {},
  });
}

/**
 * The cards and accounts the household pays with. The assistant matches "con
 * mi amex" against these, and adds a new one when it hears about it.
 */
export default function PaymentAccountsScreen() {
  const accounts = usePaymentAccounts();
  const tint = useThemeColor('foreground');
  const muted = useThemeColor('muted');

  const groups = [
    { title: undefined, rows: accounts.data?.filter((account) => !account.archived) ?? [] },
    { title: 'Archivadas', rows: accounts.data?.filter((account) => account.archived) ?? [] },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Cuentas y tarjetas',
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Nueva cuenta"
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
        {accounts.data === null ? (
          <View className="items-center py-16">
            {accounts.status === 'error' ? (
              <Text className="text-base text-muted">
                No se pudieron cargar. Revisa tu conexión.
              </Text>
            ) : (
              <ActivityIndicator color={muted} />
            )}
          </View>
        ) : (
          <>
            {groups.map((group) =>
              group.rows.length === 0 ? null : (
                <View key={group.title ?? 'active'} className="gap-2">
                  {group.title ? (
                    <Text className="px-4 text-xs font-medium uppercase tracking-wide text-muted">
                      {group.title}
                    </Text>
                  ) : null}
                  <View className="overflow-hidden rounded-2xl bg-surface">
                    {group.rows.map((account, index) => (
                      <Fragment key={account.id}>
                        {index > 0 ? <View className="ml-[68px] h-px bg-border" /> : null}
                        <ManageRow
                          emoji={account.emoji}
                          title={account.name}
                          subtitle={describe(account)}
                          dimmed={account.archived}
                          onPress={() => openEditor(account)}
                        />
                      </Fragment>
                    ))}
                  </View>
                </View>
              ),
            )}
            <Text className="px-4 text-sm text-muted">
              {
                'Di "con mi amex" o "con la de débito de Saida" y el asistente lo liga a la cuenta correcta. Si mencionas una nueva, la agrega solo.'
              }
            </Text>
          </>
        )}
      </ScrollView>
    </>
  );
}
