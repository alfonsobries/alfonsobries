import { Illustration } from '@/components/ui/Illustration';
import { ImageSquare } from 'phosphor-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useImageUpload, type UploadedImage } from '@/hooks/use-image-upload';
import { useThemeColor } from '@/hooks/use-theme-color';

type ImageUploadFieldProperties = {
  value: UploadedImage | null;
  onChange: (value: UploadedImage | null) => void;
  label?: string;
  helperText?: string;
  /** Shown when editing a resource that already has an image. */
  currentUrl?: string | null;
  aspectRatio?: number;
  disabled?: boolean;
};

// The standard image-upload field: tap to pick a photo, which is uploaded
// straight to S3; the resulting temp key is handed to `onChange` for the
// caller to attach on save.
export function ImageUploadField({
  value,
  onChange,
  label,
  helperText,
  currentUrl,
  aspectRatio = 1,
  disabled = false,
}: ImageUploadFieldProperties) {
  const accent = useThemeColor('primary-emphasis');
  const muted = useThemeColor('muted');
  const { isUploading, pickAndUpload } = useImageUpload();
  const [error, setError] = useState<string | null>(null);

  const previewUri = value?.localUri ?? currentUrl ?? null;

  async function handlePick(): Promise<void> {
    if (disabled || isUploading) {
      return;
    }

    setError(null);
    try {
      const uploaded = await pickAndUpload();
      if (uploaded) {
        onChange(uploaded);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The image could not be uploaded.');
    }
  }

  return (
    <View className="w-full gap-1.5">
      {label ? <Text className="px-4 text-sm font-medium text-foreground">{label}</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? 'Pick an image'}
        onPress={handlePick}
        className={`overflow-hidden rounded-2xl border border-dashed bg-surface ${
          error ? 'border-danger' : 'border-border'
        } ${disabled ? 'opacity-50' : ''}`}
        style={{ aspectRatio }}
      >
        {isUploading ? (
          <View className="h-full w-full items-center justify-center gap-2">
            <ActivityIndicator color={accent} />
            <Text className="text-sm text-muted">Uploading…</Text>
          </View>
        ) : previewUri ? (
          <Illustration source={{ uri: previewUri }} transition={150} />
        ) : (
          <View className="h-full w-full items-center justify-center gap-2 px-4">
            <ImageSquare size={28} color={muted} />
            <Text className="text-sm font-medium text-muted">Choose an image</Text>
            {helperText ? (
              <Text className="text-center text-xs text-muted">{helperText}</Text>
            ) : null}
          </View>
        )}
      </Pressable>

      {error ? <Text className="px-4 text-sm text-danger">{error}</Text> : null}
    </View>
  );
}
