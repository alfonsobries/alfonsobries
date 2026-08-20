import { Image } from 'expo-image';
import { Check, Clock, WarningCircle } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import type { LineMessage } from '@/api/line';
import { OtpMessage } from '@/components/line/OtpMessage';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatLineTime } from '@/lib/line-time';

type MessageBubbleProperties = {
  message: LineMessage;
  onRetry?: (message: LineMessage) => void;
};

function StatusIcon({ message }: { message: LineMessage }) {
  const muted = useThemeColor('muted');
  const danger = useThemeColor('danger');
  const success = useThemeColor('success');

  if (message.direction === 'in') {
    return null;
  }

  if (message.status === 'queued') {
    return <Clock size={12} color={muted} />;
  }

  if (message.status === 'failed') {
    return <WarningCircle size={12} color={danger} weight="fill" />;
  }

  if (message.status === 'delivered') {
    return <Check size={12} color={success} weight="bold" />;
  }

  return <Check size={12} color={muted} />;
}

export function MessageBubble({ message, onRetry }: MessageBubbleProperties) {
  const inbound = message.direction === 'in';

  if (inbound && message.otp_code) {
    return (
      <View className="items-start gap-1">
        <OtpMessage code={message.otp_code} body={message.body} />
        <Text className="px-1 text-xs text-muted">{formatLineTime(message.sent_at)}</Text>
      </View>
    );
  }

  return (
    <View className={inbound ? 'items-start' : 'items-end'}>
      {message.media_urls.length > 0 ? (
        <View className="mb-1.5 flex-row flex-wrap justify-end gap-1.5">
          {message.media_urls.map((url) => (
            <Image
              key={url}
              source={{ uri: url }}
              contentFit="cover"
              style={{ width: 160, height: 160, borderRadius: 16 }}
            />
          ))}
        </View>
      ) : null}
      {message.body ? (
        <View
          className={`max-w-[85%] rounded-3xl px-4 py-2.5 ${
            inbound ? 'rounded-bl-lg bg-surface' : 'rounded-br-lg bg-primary'
          }`}
        >
          <Text
            selectable
            className={`text-[16px] leading-6 ${inbound ? 'text-foreground' : 'text-primary-foreground'}`}
          >
            {message.body}
          </Text>
        </View>
      ) : null}
      <View className="mt-1 flex-row items-center gap-1 px-1">
        <StatusIcon message={message} />
        <Text className="text-xs text-muted">{formatLineTime(message.sent_at)}</Text>
        {message.status === 'failed' && onRetry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry send"
            onPress={() => onRetry(message)}
            hitSlop={8}
          >
            <Text className="text-xs font-medium text-danger">Retry</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
