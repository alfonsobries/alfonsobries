import { Text, View } from 'react-native';

import type { LineThread } from '@/api/line';
import { contactLabel } from '@/api/line';
import { Card } from '@/components/ui/Card';
import { formatLineTime } from '@/lib/line-time';
import { formatPhone } from '@/lib/phone';

type ThreadListItemProperties = {
  thread: LineThread;
  onPress: () => void;
};

function preview(thread: LineThread): string {
  if (thread.last_message?.body) {
    return thread.last_message.body;
  }

  if (thread.last_call?.status === 'missed') {
    return 'Missed call';
  }

  if (thread.last_call) {
    return thread.last_call.direction === 'out' ? 'Outgoing call' : 'Incoming call';
  }

  return '';
}

function timestamp(thread: LineThread): string {
  const iso = thread.last_message?.sent_at ?? thread.last_call?.started_at;

  return iso ? formatLineTime(iso) : '';
}

export function ThreadListItem({ thread, onPress }: ThreadListItemProperties) {
  const unread = thread.unread_count > 0;
  const title = contactLabel(thread);
  const subtitle = title === thread.e164 ? null : formatPhone(thread.e164);

  return (
    <Card onPress={onPress} accessibilityLabel={`${title}, ${preview(thread)}`}>
      <View className="flex-row items-center gap-3">
        <View className="size-12 items-center justify-center rounded-full bg-surface-selected">
          <Text className="text-lg font-semibold text-foreground">
            {(thread.name ?? thread.e164).slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <Text
              numberOfLines={1}
              className={`flex-1 text-base ${unread ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}
            >
              {title}
            </Text>
            <Text className="text-xs text-muted">{timestamp(thread)}</Text>
          </View>
          {subtitle ? (
            <Text numberOfLines={1} className="text-xs text-muted">
              {subtitle}
            </Text>
          ) : null}
          <Text
            numberOfLines={1}
            className={`mt-0.5 text-sm ${unread ? 'font-medium text-foreground' : 'text-muted'}`}
          >
            {preview(thread)}
          </Text>
        </View>
        {unread ? (
          <View className="min-w-5 items-center rounded-full bg-primary px-1.5 py-0.5">
            <Text className="text-xs font-semibold text-primary-foreground">
              {thread.unread_count}
            </Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}
