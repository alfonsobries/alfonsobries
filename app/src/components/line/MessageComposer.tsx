import { Image } from 'expo-image';
import { Clock, PaperPlaneTilt, Plus, X } from 'phosphor-react-native';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { useImageUpload, type UploadedImage } from '@/hooks/use-image-upload';
import { useThemeColor } from '@/hooks/use-theme-color';
import { smsSegments } from '@/lib/line-time';
import { useIsOnline } from '@/offline/connectivity';

type MessageComposerProperties = {
  sending: boolean;
  onSend: (
    body: string,
    attachments: UploadedImage[],
    scheduledAt: string | null,
  ) => Promise<boolean>;
};

const MAX_ATTACHMENTS = 5;

function tomorrowNine(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);

  return date.toISOString();
}

function inOneHour(): string {
  return new Date(Date.now() + 60 * 60 * 1000).toISOString();
}

export function MessageComposer({ sending, onSend }: MessageComposerProperties) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<UploadedImage[]>([]);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const { isUploading, pickAndUpload } = useImageUpload({ allowsEditing: false });
  const muted = useThemeColor('muted');
  const foreground = useThemeColor('foreground');
  const sendTint = useThemeColor('primary-foreground');
  const background = useThemeColor('background');
  const online = useIsOnline();
  const segments = smsSegments(text);
  const canSend = !sending && !isUploading && (text.trim().length > 0 || attachments.length > 0);

  const handleAttach = async () => {
    if (attachments.length >= MAX_ATTACHMENTS) {
      return;
    }

    try {
      const uploaded = await pickAndUpload();
      if (uploaded) {
        setAttachments((current) => [...current, uploaded].slice(0, MAX_ATTACHMENTS));
      }
    } catch {
      Alert.alert('Could not attach the photo', 'Please try again.');
    }
  };

  const handleSchedule = () => {
    Alert.alert('Send when?', undefined, [
      { text: 'Now', onPress: () => setScheduledAt(null) },
      { text: 'In 1 hour', onPress: () => setScheduledAt(inOneHour()) },
      { text: 'Tomorrow 9:00', onPress: () => setScheduledAt(tomorrowNine()) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSend = async () => {
    if (!canSend) {
      return;
    }

    const delivered = await onSend(text.trim(), attachments, scheduledAt);

    if (delivered) {
      setText('');
      setAttachments([]);
      setScheduledAt(null);
    }
  };

  return (
    <View className="gap-1.5 px-4 pb-2 pt-2">
      {attachments.length > 0 ? (
        <View className="flex-row gap-2">
          {attachments.map((attachment) => (
            <View key={attachment.key}>
              <Image
                source={{ uri: attachment.localUri }}
                contentFit="cover"
                style={{ width: 64, height: 64, borderRadius: 12 }}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove attachment"
                onPress={() =>
                  setAttachments((current) => current.filter((item) => item.key !== attachment.key))
                }
                className="absolute -right-1.5 -top-1.5 h-5 w-5 items-center justify-center rounded-full bg-foreground"
                hitSlop={8}
              >
                <X size={11} weight="bold" color={background} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      {scheduledAt ? (
        <Text className="px-1 text-xs text-muted">
          Scheduled {new Date(scheduledAt).toLocaleString()}
        </Text>
      ) : null}
      <View className="flex-row items-end gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Attach photo"
          onPress={() => {
            void handleAttach();
          }}
          className="size-12 items-center justify-center rounded-full bg-surface-selected"
        >
          <Plus size={20} color={foreground} weight="bold" />
        </Pressable>
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
          accessibilityLabel="Schedule"
          onPress={handleSchedule}
          className="size-12 items-center justify-center rounded-full bg-surface-selected"
        >
          <Clock size={18} color={scheduledAt ? foreground : muted} />
        </Pressable>
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
