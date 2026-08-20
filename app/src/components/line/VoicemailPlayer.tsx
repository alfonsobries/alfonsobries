import { Pause, Play } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import TrackPlayer, { State, usePlaybackState } from 'react-native-track-player';

import { useThemeColor } from '@/hooks/use-theme-color';
import { formatDuration } from '@/lib/line-time';

type VoicemailPlayerProperties = {
  url: string | null;
  durationSec: number | null;
  loading: boolean;
};

export function VoicemailPlayer({ url, durationSec, loading }: VoicemailPlayerProperties) {
  const playback = usePlaybackState();
  const [active, setActive] = useState(false);
  const playTint = useThemeColor('primary-foreground');
  const playing = active && playback.state === State.Playing;

  useEffect(() => {
    return () => {
      if (active) {
        void TrackPlayer.reset();
      }
    };
  }, [active]);

  const handleToggle = async () => {
    if (!url) {
      return;
    }

    if (playing) {
      await TrackPlayer.pause();
      return;
    }

    if (active && playback.state === State.Paused) {
      await TrackPlayer.play();
      return;
    }

    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: url,
      url,
      title: 'Voicemail',
      artist: 'Private line',
    });
    setActive(true);
    await TrackPlayer.play();
  };

  if (loading) {
    return (
      <View className="h-12 flex-row items-center gap-3">
        <ActivityIndicator />
        <Text className="text-sm text-muted">Fetching audio…</Text>
      </View>
    );
  }

  if (!url) {
    return <Text className="text-sm text-muted">Audio is still being archived.</Text>;
  }

  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={playing ? 'Pause voicemail' : 'Play voicemail'}
        onPress={() => {
          void handleToggle();
        }}
        className="size-12 items-center justify-center rounded-full bg-primary active:opacity-80"
      >
        {playing ? (
          <Pause size={20} color={playTint} weight="fill" />
        ) : (
          <Play size={20} color={playTint} weight="fill" />
        )}
      </Pressable>
      <Text className="text-sm text-muted">
        {durationSec ? formatDuration(durationSec) : 'Voicemail'}
      </Text>
    </View>
  );
}
