import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import type { FamilyMember } from '@/api/auth';
import { ACCOUNT_KINDS, deleteAccount, type PaymentAccountKind, saveAccount } from '@/api/expenses';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { pickEmoji } from '@/components/ui/emoji-keyboard';
import { Input } from '@/components/ui/Input';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Select } from '@/components/ui/Select';
import { Sheet } from '@/components/ui/Sheet';
import { isOfflineError } from '@/offline/connectivity';

type Owner = FamilyMember | 'shared';

function errorMessage(error: unknown): string {
  if (isOfflineError(error)) {
    return 'Estás sin conexión.';
  }

  const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;

  return message ?? 'Intenta de nuevo.';
}

/** A card or account: its name, kind, whose it is and its last digits. */
export default function PaymentAccountScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    emoji?: string;
    kind?: PaymentAccountKind;
    last4?: string;
    owner?: string;
    archived?: string;
  }>();
  const route = useApiRouter();
  const id = params.id ? Number(params.id) : undefined;
  const archived = params.archived === '1';

  const [name, setName] = useState(params.name ?? '');
  const [kind, setKind] = useState<PaymentAccountKind>(params.kind ?? 'credit_card');
  const [emoji, setEmoji] = useState(params.emoji ?? '💳');
  const [last4, setLast4] = useState(params.last4 ?? '');
  const [owner, setOwner] = useState<Owner>(
    params.owner === 'alfonso' || params.owner === 'saida' ? params.owner : 'shared',
  );
  const [saving, setSaving] = useState(false);

  const validLast4 = last4 === '' || /^\d{4}$/.test(last4);
  const canSave = name.trim().length > 0 && validLast4 && !saving;

  const handleKind = (value: string) => {
    const next = value as PaymentAccountKind;
    const previousDefault = ACCOUNT_KINDS.find((entry) => entry.value === kind)?.emoji;
    setKind(next);

    // Follow the kind's emoji unless one was picked by hand.
    if (emoji === previousDefault) {
      setEmoji(ACCOUNT_KINDS.find((entry) => entry.value === next)?.emoji ?? emoji);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAccount(
        route,
        {
          name: name.trim(),
          kind,
          emoji,
          last4: last4 || null,
          owner: owner === 'shared' ? null : owner,
        },
        id,
      );
      router.back();
    } catch (error) {
      setSaving(false);
      Alert.alert('No se pudo guardar', errorMessage(error));
    }
  };

  const handleRestore = async () => {
    try {
      await saveAccount(route, { archived: false }, id);
      router.back();
    } catch (error) {
      Alert.alert('No se pudo restaurar', errorMessage(error));
    }
  };

  const handleDelete = () => {
    if (!id) {
      return;
    }

    Alert.alert(
      '¿Quitar esta cuenta?',
      'Si ya tiene gastos, se archiva para no perder su historial.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteAccount(route, id);
                router.back();
              } catch (error) {
                Alert.alert('No se pudo quitar', errorMessage(error));
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <Sheet title={id ? 'Cuenta' : 'Nueva cuenta'} scrollable className="gap-5">
      <View className="items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Emoji: ${emoji}. Toca para cambiarlo`}
          onPress={() => {
            void (async () => {
              const picked = await pickEmoji();
              if (picked) {
                setEmoji(picked);
              }
            })();
          }}
          className="h-20 w-20 items-center justify-center rounded-3xl bg-surface active:opacity-70"
        >
          <Text className="text-5xl" allowFontScaling={false}>
            {emoji}
          </Text>
        </Pressable>
      </View>

      <Input
        label="Nombre"
        placeholder="Amex Platinum"
        value={name}
        onChangeText={setName}
        maxLength={40}
        autoFocus={!id}
      />

      <Select
        label="Tipo"
        value={kind}
        onChange={handleKind}
        options={ACCOUNT_KINDS.map((entry) => ({
          value: entry.value,
          label: `${entry.emoji}  ${entry.label}`,
        }))}
        searchable={false}
      />

      <View className="gap-1.5">
        <Text className="px-4 text-sm font-medium text-foreground">De quién es</Text>
        <SegmentedControl<Owner>
          value={owner}
          onChange={setOwner}
          options={[
            { value: 'shared', label: 'Los dos' },
            { value: 'alfonso', label: 'Alfonso' },
            { value: 'saida', label: 'Saida' },
          ]}
        />
      </View>

      <Input
        label="Últimos 4 dígitos (opcional)"
        placeholder="1005"
        value={last4}
        onChangeText={(value) => setLast4(value.replace(/\D/g, '').slice(0, 4))}
        keyboardType="number-pad"
        maxLength={4}
        error={validLast4 ? undefined : 'Deben ser 4 dígitos.'}
      />

      <View className="gap-3 pt-2">
        <Button fullWidth loading={saving} disabled={!canSave} onPress={() => void handleSave()}>
          Guardar
        </Button>
        {id && archived ? (
          <Button fullWidth variant="secondary" onPress={() => void handleRestore()}>
            Volver a usarla
          </Button>
        ) : null}
        {id && !archived ? (
          <Pressable
            accessibilityRole="button"
            onPress={handleDelete}
            className="h-11 items-center justify-center rounded-full active:bg-surface-selected"
          >
            <Text className="text-base font-medium text-danger">Quitar cuenta</Text>
          </Pressable>
        ) : null}
      </View>
    </Sheet>
  );
}
