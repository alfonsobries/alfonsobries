import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { ChatMessage } from '@/api/chat';

import { CopyableReply } from './CopyableReply';

type MessageBubbleProperties = {
  message: ChatMessage;
  /** Render completed assistant replies with the copy-ready treatment. */
  copyableOutput?: boolean;
};

export function MessageBubble({ message, copyableOutput = false }: MessageBubbleProperties) {
  if (message.role === 'user') {
    return (
      <Animated.View entering={FadeInDown.duration(200)} className="items-end">
        <View className="max-w-[85%] gap-2">
          {message.attachments.length > 0 ? (
            <View className="flex-row justify-end gap-1.5">
              {message.attachments.map((attachment) => (
                <Image
                  key={attachment.id}
                  source={{ uri: attachment.url }}
                  contentFit="cover"
                  className="rounded-2xl"
                  style={{ width: 112, height: 112, borderRadius: 16 }}
                />
              ))}
            </View>
          ) : null}
          {message.content ? (
            <View className="self-end rounded-3xl rounded-br-lg bg-primary px-4 py-2.5">
              <Text selectable className="text-[16px] leading-6 text-primary-foreground">
                {message.content}
              </Text>
            </View>
          ) : null}
        </View>
      </Animated.View>
    );
  }

  if (message.status === 'pending') {
    return (
      <Animated.View entering={FadeInDown.duration(200)} className="items-start">
        <View className="animate-pulse rounded-3xl rounded-bl-lg bg-surface px-4 py-3">
          <Text className="text-[16px] leading-6 text-muted">Thinking…</Text>
        </View>
      </Animated.View>
    );
  }

  if (message.status === 'failed') {
    return (
      <View className="items-start">
        <View className="max-w-[85%] rounded-3xl rounded-bl-lg border border-danger/40 bg-surface px-4 py-2.5">
          <Text className="text-[16px] leading-6 text-danger">
            Something went wrong. Try again.
          </Text>
          {message.error ? <Text className="mt-1 text-xs text-muted">{message.error}</Text> : null}
        </View>
      </View>
    );
  }

  if (copyableOutput && message.content) {
    return (
      <Animated.View entering={FadeInDown.duration(200)} className="w-full">
        <CopyableReply content={message.content} />
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(200)} className="items-start">
      <View className="max-w-[85%] rounded-3xl rounded-bl-lg bg-surface px-4 py-2.5">
        <Text selectable className="text-[16px] leading-6 text-foreground">
          {message.content}
        </Text>
      </View>
    </Animated.View>
  );
}
