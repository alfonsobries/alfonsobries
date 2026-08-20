import { ChatTeardropText, PhoneX, Voicemail } from 'phosphor-react-native';
import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { LineCall } from '@/api/line';
import { contactLabel } from '@/api/line';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatPhone } from '@/lib/phone';

type IncomingCallCardProperties = {
  call: LineCall;
  onHangup: () => void;
  onIgnore: () => void;
  onReply: () => void;
};

export function IncomingCallCard({
  call,
  onHangup,
  onIgnore,
  onReply,
}: IncomingCallCardProperties) {
  const contact = call.contact;
  const name = contact ? contactLabel(contact) : 'Unknown';
  const number = contact ? formatPhone(contact.e164) : '';
  const hangupTint = useThemeColor('primary-foreground');
  const ai = call.answered_by === 'ai';
  const ended = call.status === 'completed' || call.status === 'missed' || call.status === 'failed';

  return (
    <View className="flex-1 items-center justify-between px-6 py-10">
      <View className="items-center gap-3 pt-16">
        <Text className="text-sm uppercase tracking-wide text-muted">
          {ai ? 'AI picked up' : ended ? 'Call ended' : 'Incoming call'}
        </Text>
        <View className="size-28 items-center justify-center rounded-full bg-surface-selected">
          <Text className="text-4xl font-semibold text-foreground">
            {name.slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <Text className="text-center text-4xl font-semibold text-foreground">{name}</Text>
        {number && number !== name ? <Text className="text-lg text-muted">{number}</Text> : null}
      </View>

      {ended ? (
        <Text className="text-base text-muted">
          {call.status === 'missed' ? 'They hung up.' : 'The call is over.'}
        </Text>
      ) : (
        <View className="w-full flex-row justify-around pb-8">
          <Action
            label="Decline"
            color="bg-danger"
            icon={<PhoneX size={28} color={hangupTint} weight="fill" />}
            onPress={onHangup}
          />
          <Action
            label="SMS"
            color="bg-surface-selected"
            icon={<ChatTeardropText size={28} color={hangupTint} weight="fill" />}
            onPress={onReply}
          />
          <Action
            label="Voicemail"
            color="bg-surface-selected"
            icon={<Voicemail size={28} color={hangupTint} weight="fill" />}
            onPress={onIgnore}
          />
        </View>
      )}
    </View>
  );
}

function Action({
  label,
  color,
  icon,
  onPress,
}: {
  label: string;
  color: string;
  icon: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="items-center gap-2"
    >
      <View className={`size-16 items-center justify-center rounded-full ${color}`}>{icon}</View>
      <Text className="text-sm font-medium text-foreground">{label}</Text>
    </Pressable>
  );
}
