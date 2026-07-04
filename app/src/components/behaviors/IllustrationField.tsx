import { Image } from 'expo-image';
import { ArrowsClockwise, ImageSquare, Sparkle } from 'phosphor-react-native';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import {
  fetchIllustration,
  isSettled,
  requestIllustration,
  type BehaviorIllustration,
  type KidMember,
} from '@/api/behaviors';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { useIllustrationChannel } from '@/hooks/use-illustration-channel';
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
  /** The kid the behavior belongs to — picks the character that gets drawn. */
  member: KidMember;
  /** The behavior name the illustration is generated from. */
  name: string;
  value: IllustrationValue | null;
  onChange: (value: IllustrationValue | null) => void;
  /** Shown when editing a behavior that already has an illustration. */
  currentUrl?: string | null;
  onBusyChange?: (busy: boolean) => void;
};

// While a generation is pending, the illustration's Reverb channel delivers
// the result; this slow poll only covers a dropped socket.
const FALLBACK_POLL_MS = 10_000;
const GENERATION_TIMEOUT_MS = 3 * 60 * 1000;

// The behavior illustration field. It generates an AI image from the behavior
// name (with a busy state while the API works), can regenerate, or accepts a
// photo of your own uploaded straight to S3.
export const IllustrationField = forwardRef<IllustrationFieldHandle, IllustrationFieldProperties>(
  function IllustrationField({ member, name, value, onChange, currentUrl, onBusyChange }, ref) {
    const route = useApiRouter();
    const accent = useThemeColor('primary-emphasis');
    const { isUploading, pickAndUpload } = useImageUpload();
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const busy = pendingId !== null || isUploading;
    const previewUri = value?.previewUri ?? currentUrl ?? null;
    const canGenerate = name.trim().length > 0 && !busy;

    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const onBusyChangeRef = useRef(onBusyChange);
    onBusyChangeRef.current = onBusyChange;

    useEffect(() => {
      onBusyChangeRef.current?.(busy);
    }, [busy]);

    function settle(illustration: BehaviorIllustration): void {
      if (!isSettled(illustration)) {
        return;
      }

      setPendingId(null);

      if (illustration.status === 'completed' && illustration.path) {
        onChangeRef.current({ path: illustration.path, previewUri: illustration.url });
      } else {
        setError(illustration.error ?? 'The illustration could not be generated.');
      }
    }

    // Primary signal: the illustration settles on its private channel.
    useIllustrationChannel(pendingId, settle);

    // Fallback: slow polling plus a hard stop, in case the socket drops.
    useEffect(() => {
      if (pendingId === null) {
        return;
      }

      const startedAt = Date.now();
      const interval = setInterval(() => {
        if (Date.now() - startedAt > GENERATION_TIMEOUT_MS) {
          setPendingId(null);
          setError('The illustration is taking too long. Try again.');
          return;
        }

        fetchIllustration(route, pendingId)
          .then(settle)
          .catch(() => {
            // Transient poll errors are fine; the next tick retries.
          });
      }, FALLBACK_POLL_MS);

      return () => clearInterval(interval);
    }, [pendingId, route]);

    async function handleGenerate(): Promise<void> {
      if (!canGenerate) {
        return;
      }

      setError(null);
      try {
        const illustration = await requestIllustration(route, member, name.trim());

        // On a sync queue the API already finished the work in the request.
        if (isSettled(illustration)) {
          settle(illustration);
        } else {
          setPendingId(illustration.id);
        }
      } catch {
        setError('The illustration could not be generated.');
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
