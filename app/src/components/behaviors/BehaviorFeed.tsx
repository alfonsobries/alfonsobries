import { Image } from 'expo-image';
import { ClockCounterClockwise, HandPalm } from 'phosphor-react-native';
import { Alert, Pressable, Text, View } from 'react-native';

import type { BehaviorLogEntry } from '@/api/behaviors';
import { getPerson } from '@/api/family';
import { AvatarCircle } from '@/components/family/AvatarCircle';
import { useThemeColor } from '@/hooks/use-theme-color';

type BehaviorFeedProperties = {
  entries: BehaviorLogEntry[];
  /** Hide the kid's name when the feed is already scoped to one kid. */
  showKid?: boolean;
  onUndo?: (entry: BehaviorLogEntry) => void;
};

// The history of logged behaviors, newest first. The behavior's illustration
// leads each row; the parent who logged it floats on it as a small avatar,
// with a sad face when it hit their mood. Long-press a row to undo an
// accidental tap.
export function BehaviorFeed({ entries, showKid = false, onUndo }: BehaviorFeedProperties) {
  const muted = useThemeColor('muted');

  if (entries.length === 0) {
    return (
      <View className="items-center gap-2 rounded-3xl bg-surface p-6">
        <ClockCounterClockwise size={24} color={muted} />
        <Text className="text-center text-sm text-muted">Nothing logged yet.</Text>
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-3xl bg-surface">
      {entries.map((entry, index) => (
        <FeedRow
          key={entry.id}
          entry={entry}
          showKid={showKid}
          divider={index > 0}
          onUndo={onUndo}
        />
      ))}
    </View>
  );
}

function FeedRow({
  entry,
  showKid,
  divider,
  onUndo,
}: {
  entry: BehaviorLogEntry;
  showKid: boolean;
  divider: boolean;
  onUndo?: (entry: BehaviorLogEntry) => void;
}) {
  const accent = useThemeColor('primary-emphasis');

  const kidName = getPerson(entry.family_member)?.name ?? entry.family_member;
  const logger = getPerson(entry.logged_by.family_member ?? undefined);
  const title = showKid ? `${kidName} — ${entry.behavior.name}` : entry.behavior.name;

  function handleLongPress(): void {
    if (!onUndo) {
      return;
    }

    Alert.alert('Undo this entry?', 'The log is removed and any mood points are given back.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Undo', style: 'destructive', onPress: () => onUndo(entry) },
    ]);
  }

  return (
    <Pressable
      accessibilityLabel={title}
      onLongPress={onUndo ? handleLongPress : undefined}
      className={`flex-row items-center gap-3 p-3 active:opacity-70 ${
        divider ? 'border-t border-border' : ''
      }`}
    >
      {/* The illustration is the story; the parent who logged it floats on
          its corner, with a sad face when it hit their mood. */}
      <View className="relative">
        <View className="size-16 items-center justify-center overflow-hidden rounded-xl bg-surface-selected">
          {entry.behavior.image_url ? (
            <Image
              source={{ uri: entry.behavior.image_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <HandPalm size={26} color={accent} weight="fill" />
          )}
        </View>
        {logger ? (
          <View className="absolute -bottom-1.5 -right-1.5 flex-row items-center">
            <View className="rounded-full border-2 border-surface">
              <AvatarCircle person={logger.key} size={24} />
            </View>
            {entry.affected_mood ? <Text className="-ml-1.5 text-sm">😢</Text> : null}
          </View>
        ) : null}
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="text-base font-medium text-foreground" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-sm text-muted" numberOfLines={1}>
          {timeAgo(entry.created_at)}
        </Text>
      </View>
    </Pressable>
  );
}

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));

  if (seconds < 60) {
    return 'just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(iso).toLocaleDateString();
}
