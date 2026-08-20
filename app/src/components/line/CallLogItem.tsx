import { Phone, PhoneIncoming, PhoneOutgoing, PhoneX } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import type { LineCall } from '@/api/line';
import { contactLabel } from '@/api/line';
import { Card } from '@/components/ui/Card';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatDuration, formatLineTime } from '@/lib/line-time';
import { formatPhone } from '@/lib/phone';

type CallLogItemProperties = {
  call: LineCall;
  onPress?: () => void;
};

function callTitle(call: LineCall): string {
  if (call.status === 'missed') {
    return 'Missed call';
  }

  if (call.answered_by === 'ai') {
    return 'Answered by AI';
  }

  if (call.answered_by === 'voicemail') {
    return 'Voicemail';
  }

  return call.direction === 'out' ? 'Outgoing' : 'Incoming';
}

export function CallLogItem({ call, onPress }: CallLogItemProperties) {
  const missed = call.status === 'missed';
  const danger = useThemeColor('danger');
  const foreground = useThemeColor('foreground');
  const iconColor = missed ? danger : foreground;
  const contact = call.contact;
  const name = contact ? contactLabel(contact) : 'Unknown';
  const Glyph =
    call.status === 'missed'
      ? PhoneX
      : call.direction === 'out'
        ? PhoneOutgoing
        : call.direction === 'in'
          ? PhoneIncoming
          : Phone;

  const body = (
    <View className="flex-row items-center gap-3">
      <View className="size-11 items-center justify-center rounded-full bg-surface-selected">
        <Glyph size={20} color={iconColor} weight="bold" />
      </View>
      <View className="min-w-0 flex-1">
        <Text
          numberOfLines={1}
          className={`text-base font-medium ${missed ? 'text-danger' : 'text-foreground'}`}
        >
          {name}
        </Text>
        <Text className="text-sm text-muted">
          {callTitle(call)}
          {call.duration_sec > 0 ? ` · ${formatDuration(call.duration_sec)}` : ''}
        </Text>
        {contact && contact.name ? (
          <Text className="text-xs text-muted">{formatPhone(contact.e164)}</Text>
        ) : null}
      </View>
      <Text className="text-xs text-muted">{formatLineTime(call.started_at)}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Card onPress={onPress} accessibilityLabel={`${callTitle(call)} from ${name}`}>
        {body}
      </Card>
    );
  }

  return <View className="rounded-3xl bg-surface p-4">{body}</View>;
}
