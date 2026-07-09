import { Illustration } from '@/components/ui/Illustration';
import { Check, CircleDashed, HourglassMedium, Star, X } from 'phosphor-react-native';
import { Alert, Pressable, Text, View } from 'react-native';

import type { Chore } from '@/api/chores';
import { useThemeColor } from '@/hooks/use-theme-color';

type ChoreChecklistProperties = {
  chores: Chore[];
  onCheck: (chore: Chore) => void;
  onUncheck: (chore: Chore) => void;
};

// Today's routine as a kid-friendly checklist: tap a chore when it's done,
// a parent approves it in the evening. Each state has its own clear mark so
// the kids can read progress at a glance.
export function ChoreChecklist({ chores, onCheck, onUncheck }: ChoreChecklistProperties) {
  return (
    <View className="overflow-hidden rounded-3xl bg-surface">
      {chores.map((chore, index) => (
        <ChoreRow
          key={chore.id}
          chore={chore}
          divider={index > 0}
          onCheck={onCheck}
          onUncheck={onUncheck}
        />
      ))}
    </View>
  );
}

function ChoreRow({
  chore,
  divider,
  onCheck,
  onUncheck,
}: {
  chore: Chore;
  divider: boolean;
  onCheck: (chore: Chore) => void;
  onUncheck: (chore: Chore) => void;
}) {
  const accent = useThemeColor('primary-emphasis');
  const muted = useThemeColor('muted');
  const success = useThemeColor('success');
  const danger = useThemeColor('danger');

  const status = chore.today?.status ?? null;

  function handlePress(): void {
    if (status === null) {
      onCheck(chore);
      return;
    }

    if (status === 'done') {
      Alert.alert('Uncheck this?', `"${chore.name}" goes back to not done.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Uncheck', onPress: () => onUncheck(chore) },
      ]);
    }
    // Reviewed rows are settled for the day.
  }

  const subtitle =
    status === 'done'
      ? 'Waiting for review'
      : status === 'approved'
        ? `+${chore.points} point${chore.points === 1 ? '' : 's'}!`
        : status === 'rejected'
          ? 'Not this time'
          : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={chore.name}
      accessibilityState={{ checked: status !== null }}
      onPress={handlePress}
      className={`flex-row items-center gap-3 p-3 active:opacity-70 ${
        divider ? 'border-t border-border' : ''
      } ${status === 'rejected' ? 'opacity-60' : ''}`}
    >
      <View className="size-14 items-center justify-center overflow-hidden rounded-xl bg-surface-selected">
        {chore.image_url ? (
          <Illustration source={{ uri: chore.image_url }} />
        ) : (
          <Star size={24} color={accent} weight="fill" />
        )}
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
          {chore.name}
        </Text>
        {subtitle ? (
          <Text
            className={`text-sm ${status === 'approved' ? 'text-success' : 'text-muted'}`}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {status === null ? (
        <CircleDashed size={28} color={muted} />
      ) : status === 'done' ? (
        <HourglassMedium size={26} color={accent} weight="fill" />
      ) : status === 'approved' ? (
        <Check size={28} color={success} weight="bold" />
      ) : (
        <X size={26} color={danger} />
      )}
    </Pressable>
  );
}
