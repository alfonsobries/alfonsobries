import { Image } from 'expo-image';
import { router } from 'expo-router';
import { WarningCircle } from 'phosphor-react-native';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { HomeMessage } from '@/api/home';
import { useThemeColor } from '@/hooks/use-theme-color';

import { ExpenseCards } from './ExpenseCards';
import { TypingIndicator } from './TypingIndicator';
import { VoiceNotePlayer } from './VoiceNotePlayer';

type HomeMessageRowProperties = {
  message: HomeMessage;
  onRetry: (message: HomeMessage) => void;
  onDiscard: (message: HomeMessage) => void;
  onOpenExpense: (expenseId: number) => void;
  onRestoreExpense: (expenseId: number) => void;
};

function openPhoto(url: string) {
  router.push({ pathname: '/photo', params: { url } });
}

function UserMessage({
  message,
  onRetry,
  onDiscard,
}: Pick<HomeMessageRowProperties, 'message' | 'onRetry' | 'onDiscard'>) {
  const danger = useThemeColor('danger');
  const unsent = message.status === 'unsent';
  const sending = message.status === 'sending';

  return (
    <View className="items-end">
      <View className={`max-w-[85%] items-end gap-1.5 ${sending ? 'opacity-70' : ''}`}>
        {message.images.length > 0 ? (
          <View className="flex-row flex-wrap justify-end gap-1.5">
            {message.images.map((image) => (
              <Pressable
                key={image.id}
                accessibilityRole="imagebutton"
                accessibilityLabel="Ver foto"
                onPress={() => openPhoto(image.url)}
              >
                <Image
                  source={{ uri: image.url }}
                  contentFit="cover"
                  transition={150}
                  style={{ width: 128, height: 160, borderRadius: 18 }}
                />
              </Pressable>
            ))}
          </View>
        ) : null}

        {message.audio ? (
          <View className="w-64 rounded-3xl rounded-br-lg bg-primary px-3 py-2.5">
            <VoiceNotePlayer url={message.audio.url} duration={message.audio.duration} onPrimary />
          </View>
        ) : null}

        {message.transcript ? (
          <Text selectable className="px-2 text-sm italic leading-5 text-muted">
            {`"${message.transcript}"`}
          </Text>
        ) : null}

        {message.content ? (
          <View className="rounded-3xl rounded-br-lg bg-primary px-4 py-2.5">
            <Text selectable className="text-[16px] leading-6 text-primary-foreground">
              {message.content}
            </Text>
          </View>
        ) : null}

        {message.source === 'telegram' ? (
          <Text className="px-2 text-xs text-muted">vía Telegram</Text>
        ) : null}

        {unsent ? (
          <Pressable
            accessibilityRole="button"
            accessibilityHint="Mantén presionado para descartarlo"
            onPress={() => onRetry(message)}
            onLongPress={() => onDiscard(message)}
            className="flex-row items-center gap-1.5 px-1 py-1 active:opacity-60"
          >
            <WarningCircle size={16} color={danger} weight="fill" />
            <Text className="text-sm text-danger">{message.error}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function AssistantMessage({
  message,
  onOpenExpense,
  onRestoreExpense,
}: Pick<HomeMessageRowProperties, 'message' | 'onOpenExpense' | 'onRestoreExpense'>) {
  if (message.status === 'pending') {
    return <TypingIndicator />;
  }

  if (message.status === 'failed') {
    return (
      <View className="items-start">
        <View className="max-w-[85%] rounded-3xl rounded-bl-lg border border-danger/40 bg-surface px-4 py-2.5">
          <Text className="text-[16px] leading-6 text-danger">
            No pude responder a eso. Intenta de nuevo en un momento.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="items-start gap-2">
      {message.content ? (
        <View className="max-w-[85%] rounded-3xl rounded-bl-lg bg-surface px-4 py-2.5">
          <Text selectable className="text-[16px] leading-6 text-foreground">
            {message.content}
          </Text>
        </View>
      ) : null}
      {message.expenses.length > 0 ? (
        <ExpenseCards
          expenses={message.expenses}
          onOpen={onOpenExpense}
          onRestore={onRestoreExpense}
        />
      ) : null}
    </View>
  );
}

/** One turn of the home chat, either side. */
export const HomeMessageRow = memo(function HomeMessageRow({
  message,
  onRetry,
  onDiscard,
  onOpenExpense,
  onRestoreExpense,
}: HomeMessageRowProperties) {
  return (
    <Animated.View entering={FadeInDown.duration(220)}>
      {message.role === 'user' ? (
        <UserMessage message={message} onRetry={onRetry} onDiscard={onDiscard} />
      ) : (
        <AssistantMessage
          message={message}
          onOpenExpense={onOpenExpense}
          onRestoreExpense={onRestoreExpense}
        />
      )}
    </Animated.View>
  );
});
