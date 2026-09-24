import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pause, Play } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { formatDuration } from '@/lib/line-time';

type VoiceNotePlayerProperties = {
  url: string;
  /** Milliseconds, known before the file loads. */
  duration: number | null;
  /** Draws on the primary fill (the person's own bubble). */
  onPrimary?: boolean;
};

const BARS = 28;

/**
 * A voice note in a bubble: play/pause, progress over a static waveform, and
 * the time left. Loads lazily on first play.
 */
export function VoiceNotePlayer({ url, duration, onPrimary = false }: VoiceNotePlayerProperties) {
  const player = useAudioPlayer(url, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);
  const foreground = useThemeColor(onPrimary ? 'primary-foreground' : 'foreground');

  const total = status.duration > 0 ? status.duration : (duration ?? 0) / 1000;
  const progress = total > 0 ? Math.min(1, status.currentTime / total) : 0;
  const remaining = status.playing || status.currentTime > 0 ? total - status.currentTime : total;

  const handleToggle = () => {
    if (status.playing) {
      player.pause();
      return;
    }

    if (status.didJustFinish || (total > 0 && status.currentTime >= total - 0.05)) {
      void player.seekTo(0);
    }

    player.play();
  };

  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={status.playing ? 'Pausar nota de voz' : 'Reproducir nota de voz'}
        onPress={handleToggle}
        hitSlop={8}
        className={`h-9 w-9 items-center justify-center rounded-full active:opacity-70 ${
          onPrimary ? 'bg-primary-foreground/10' : 'bg-surface-selected'
        }`}
      >
        {status.playing ? (
          <Pause size={16} weight="fill" color={foreground} />
        ) : (
          <Play size={16} weight="fill" color={foreground} />
        )}
      </Pressable>

      <View className="h-7 flex-1 flex-row items-center gap-[3px]" importantForAccessibility="no">
        {Array.from({ length: BARS }, (_, index) => {
          // A fixed, voice-like silhouette: deterministic so it never jumps.
          const height =
            6 + Math.round(Math.abs(Math.sin(index * 1.7) * Math.cos(index * 0.6)) * 18);
          const played = index / BARS < progress;

          return (
            <View
              key={index}
              style={{ height, backgroundColor: foreground, opacity: played ? 0.9 : 0.3 }}
              className="w-[3px] rounded-full"
            />
          );
        })}
      </View>

      <Text
        className={`w-10 text-right text-xs tabular-nums ${
          onPrimary ? 'text-primary-foreground' : 'text-muted'
        }`}
      >
        {formatDuration(remaining)}
      </Text>
    </View>
  );
}
