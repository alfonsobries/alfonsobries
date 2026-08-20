import { PaperPlaneTilt } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { smsSegments } from '@/lib/line-time';
import { useIsOnline } from '@/offline/connectivity';

type MessageComposerProperties = {
  sending: boolean;
  onSend: (body: string) => Promise<boolean>;
};

export function MessageComposer({ sending, onSend }: MessageComposerProperties) {
  const [text, setText] = useState('');
  const muted = useThemeColor('muted');
  const foreground = useThemeColor('foreground');
  const sendTint = useThemeColor('primary-foreground');
  const online = useIsOnline();
  const segments = smsSegments(text);
  const canSend = !sending && text.trim().length > 0;

  const handleSend = async () => {
    if (!canSend) {
      return;
    }

    const delivered = await onSend(text.trim());

    if (delivered) {
      setText('');
    }
  };

  return (
    <View className="gap-1.5 px-4 pb-2 pt-2">
      <View className="flex-row items-end gap-2">
        <View className="min-h-12 flex-1 justify-center rounded-3xl border border-border bg-surface px-4 py-2">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={online ? 'Message' : 'Queued until you are back online'}
            placeholderTextColor={muted}
            multiline
            maxLength={1600}
            className="max-h-32 p-0 text-[16px]"
            style={{ color: foreground }}
            editable={!sending}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          disabled={!canSend}
          onPress={() => {
            void handleSend();
          }}
          className={`size-12 items-center justify-center rounded-full ${canSend ? 'bg-primary' : 'bg-surface-selected'}`}
        >
          <PaperPlaneTilt size={18} color={canSend ? sendTint : muted} weight="fill" />
        </Pressable>
      </View>
      {segments > 1 ? (
        <Text className="px-2 text-right text-xs text-muted">{segments} segments</Text>
      ) : null}
    </View>
  );
}
