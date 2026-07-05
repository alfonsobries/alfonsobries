import { Image } from 'expo-image';
import { ArrowUp, Plus, X } from 'phosphor-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, TextInput, View } from 'react-native';

import { useImageUpload, type UploadedImage } from '@/hooks/use-image-upload';
import { useThemeColor } from '@/hooks/use-theme-color';

type ComposerProperties = {
  sending: boolean;
  /** Resolve to true when the message went out so the draft can clear. */
  onSend: (content: string, attachments: UploadedImage[]) => Promise<boolean>;
};

const MAX_ATTACHMENTS = 4;

/**
 * The message input bar: a growing text field with photo attachments and a
 * round send button. Clears itself only after a successful send so a failed
 * one keeps the draft.
 */
export function Composer({ sending, onSend }: ComposerProperties) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<UploadedImage[]>([]);
  const { isUploading, pickAndUpload } = useImageUpload({ allowsEditing: false });

  const mutedColor = useThemeColor('muted');
  const foregroundColor = useThemeColor('foreground');
  const backgroundColor = useThemeColor('background');
  const sendTint = useThemeColor('primary-foreground');

  const canSend = !sending && !isUploading && (text.trim().length > 0 || attachments.length > 0);

  const handleAttach = async () => {
    try {
      const uploaded = await pickAndUpload();
      if (uploaded) {
        setAttachments((current) => [...current, uploaded]);
      }
    } catch {
      Alert.alert('Could not attach the photo', 'Please try again.');
    }
  };

  const handleSend = async () => {
    if (!canSend) {
      return;
    }

    const delivered = await onSend(text.trim(), attachments);

    if (delivered) {
      setText('');
      setAttachments([]);
    }
  };

  return (
    <View className="gap-2">
      {attachments.length > 0 ? (
        <View className="flex-row gap-2 px-1">
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
                  setAttachments((current) => current.filter((a) => a.key !== attachment.key))
                }
                className="absolute -right-1.5 -top-1.5 h-5 w-5 items-center justify-center rounded-full bg-foreground"
                hitSlop={8}
              >
                <X size={11} weight="bold" color={backgroundColor} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <View className="flex-row items-end gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Attach a photo"
          onPress={handleAttach}
          disabled={isUploading || attachments.length >= MAX_ATTACHMENTS}
          className={`h-11 w-11 items-center justify-center rounded-full bg-surface ${
            isUploading || attachments.length >= MAX_ATTACHMENTS
              ? 'opacity-40'
              : 'active:opacity-60'
          }`}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={mutedColor} />
          ) : (
            <Plus size={20} weight="bold" color={mutedColor} />
          )}
        </Pressable>

        <View className="max-h-32 min-h-11 flex-1 justify-center rounded-3xl border border-border bg-surface px-4 py-2.5">
          {/* `text-[16px]` sets only font-size: a lineHeight on a TextInput
              mis-positions the text vertically on iOS (RN issue #28012). */}
          <TextInput
            className="p-0 text-[16px]"
            style={{ color: foregroundColor }}
            placeholder="Message"
            placeholderTextColor={mutedColor}
            multiline
            value={text}
            onChangeText={setText}
            editable={!sending}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          onPress={() => void handleSend()}
          disabled={!canSend}
          className={`h-11 w-11 items-center justify-center rounded-full bg-primary ${
            canSend ? 'active:opacity-80' : 'opacity-40'
          }`}
        >
          {sending ? (
            <ActivityIndicator size="small" color={sendTint} />
          ) : (
            <ArrowUp size={20} weight="bold" color={sendTint} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
