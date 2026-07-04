import { Image } from 'expo-image';
import { ArrowsClockwise, ImageSquare, Sparkle } from 'phosphor-react-native';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { generateIllustration } from '@/api/behaviors';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useThemeColor } from '@/hooks/use-theme-color';

export type IllustrationValue = {
  /** The temp-storage path the API attaches on save. */
  path: string;
  /** Whatever we can show right now: the generated URL or a local file. */
  previewUri: string | null;
};

export type IllustrationFieldHandle = {
  /** Kick off a generation if there is no image yet (name-blur hook). */
  generateIfEmpty: () => void;
};

type IllustrationFieldProperties = {
  /** The behavior name the illustration is generated from. */
  name: string;
  value: IllustrationValue | null;
  onChange: (value: IllustrationValue | null) => void;
  /** Shown when editing a behavior that already has an illustration. */
  currentUrl?: string | null;
  onBusyChange?: (busy: boolean) => void;
};

// The behavior illustration field. It generates an AI image from the behavior
// name (with a busy state while the API works), can regenerate, or accepts a
// photo of your own uploaded straight to S3.
export const IllustrationField = forwardRef<IllustrationFieldHandle, IllustrationFieldProperties>(
  function IllustrationField({ name, value, onChange, currentUrl, onBusyChange }, ref) {
    const route = useApiRouter();
    const accent = useThemeColor('primary-emphasis');
    const { isUploading, pickAndUpload } = useImageUpload();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const busy = isGenerating || isUploading;
    const previewUri = value?.previewUri ?? currentUrl ?? null;
    const canGenerate = name.trim().length > 0 && !busy;

    function setBusy(generating: boolean): void {
      setIsGenerating(generating);
      onBusyChange?.(generating);
    }

    async function handleGenerate(): Promise<void> {
      if (!canGenerate) {
        return;
      }

      setError(null);
      setBusy(true);
      try {
        const illustration = await generateIllustration(route, name.trim());
        if (illustration.path) {
          onChange({ path: illustration.path, previewUri: illustration.url });
        }
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : 'The illustration could not be generated.',
        );
      } finally {
        setBusy(false);
      }
    }

    useImperativeHandle(ref, () => ({
      generateIfEmpty: () => {
        if (!value && !currentUrl && canGenerate) {
          void handleGenerate();
        }
      },
    }));

    async function handleUpload(): Promise<void> {
      if (busy) {
        return;
      }

      setError(null);
      try {
        const uploaded = await pickAndUpload();
        if (uploaded) {
          onChange({ path: uploaded.key, previewUri: uploaded.localUri });
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'The image could not be uploaded.');
      }
    }

    return (
      <View className="w-full gap-3">
        <Text className="px-4 text-sm font-medium text-foreground">Illustration</Text>

        <View
          className="items-center justify-center overflow-hidden rounded-2xl bg-surface"
          style={{ aspectRatio: 1 }}
        >
          {busy ? (
            <View className="items-center gap-3">
              <ActivityIndicator color={accent} />
              <Text className="text-sm text-muted">
                {isUploading ? 'Uploading…' : 'Drawing the illustration…'}
              </Text>
            </View>
          ) : previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View className="items-center gap-2 px-6">
              <Sparkle size={28} color={accent} weight="fill" />
              <Text className="text-center text-sm text-muted">
                An illustration is drawn automatically from the name.
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowsClockwise}
            disabled={!canGenerate}
            onPress={() => void handleGenerate()}
            className="flex-1"
          >
            {previewUri ? 'Regenerate' : 'Generate'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={ImageSquare}
            disabled={busy}
            onPress={() => void handleUpload()}
            className="flex-1"
          >
            Use my own
          </Button>
        </View>

        {error ? <Text className="px-4 text-sm text-danger">{error}</Text> : null}
      </View>
    );
  },
);
