import { useCallback, useEffect, useRef, useState } from 'react';
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
  usePlaybackState,
  useTrackPlayerEvents,
} from 'react-native-track-player';

import { type MysterySet, type RosaryStep } from '@/data/rosary';
import { ROSARY_AUDIO } from '@/data/rosary-audio';
import { MYSTERY_ART } from '@/data/rosary-art';

export const PLAYBACK_RATES = [1, 1.25, 1.5, 1.75, 2] as const;

export type PlaybackRate = (typeof PLAYBACK_RATES)[number];

/**
 * Drives the rosary as a continuous audio queue — one track per step, so the
 * lock screen, car and headphone controls move through the same sequence the
 * screen shows. The screen follows the audio, never the other way around.
 */
export function useRosaryAutoplay({
  set,
  steps,
  onStepChange,
  onEnded,
}: {
  set: MysterySet;
  steps: RosaryStep[];
  onStepChange: (index: number) => void;
  onEnded: () => void;
}) {
  const [active, setActive] = useState(false);
  const [rate, setRate] = useState<PlaybackRate>(1);
  const playback = usePlaybackState();
  const ready = useRef<Promise<void> | null>(null);

  const setup = useCallback((): Promise<void> => {
    ready.current ??= (async () => {
      try {
        await TrackPlayer.setupPlayer();
      } catch {
        // Already set up from a previous session of the screen.
      }

      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
      });
    })();

    return ready.current;
  }, []);

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged, Event.PlaybackQueueEnded], (event) => {
    if (!active) {
      return;
    }

    if (event.type === Event.PlaybackActiveTrackChanged && event.index !== undefined) {
      onStepChange(event.index);
    }

    if (event.type === Event.PlaybackQueueEnded) {
      onEnded();
    }
  });

  // Leaving the screen ends the session — the rosary is not ambient music.
  useEffect(() => {
    return () => {
      void TrackPlayer.reset();
    };
  }, []);

  const start = useCallback(
    async (fromIndex: number): Promise<void> => {
      await setup();
      await TrackPlayer.reset();

      await TrackPlayer.add(
        steps.map((step) => {
          const mysteryKey =
            step.mystery?.key ??
            (step.sectionKey.startsWith('misterio-')
              ? set.mysteries[Number(step.sectionKey.slice('misterio-'.length)) - 1]?.key
              : undefined);

          // AddTrack's url/artwork accept require() results at runtime, but the
          // published intersection type collapses them to string.
          return {
            url: ROSARY_AUDIO[step.audio] as unknown as string,
            title: step.title,
            artist: `Santo Rosario · ${set.name}`,
            artwork: MYSTERY_ART[mysteryKey ?? set.mysteries[0].key] as unknown as string,
          };
        }),
      );

      await TrackPlayer.skip(fromIndex);
      await TrackPlayer.setRate(rate);
      await TrackPlayer.play();
      setActive(true);
    },
    [rate, set, setup, steps],
  );

  const stop = useCallback(async (): Promise<void> => {
    setActive(false);
    await TrackPlayer.reset();
  }, []);

  const togglePlayback = useCallback(async (): Promise<void> => {
    if (playback.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }, [playback.state]);

  const cycleRate = useCallback(async (): Promise<void> => {
    const next = PLAYBACK_RATES[(PLAYBACK_RATES.indexOf(rate) + 1) % PLAYBACK_RATES.length];
    setRate(next);
    await TrackPlayer.setRate(next);
  }, [rate]);

  const skipTo = useCallback(
    async (index: number): Promise<void> => {
      if (index >= 0 && index < steps.length) {
        await TrackPlayer.skip(index);
      }
    },
    [steps.length],
  );

  return {
    active,
    playing: playback.state === State.Playing,
    rate,
    start,
    stop,
    togglePlayback,
    cycleRate,
    skipTo,
  };
}
