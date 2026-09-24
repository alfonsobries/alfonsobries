import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { VoiceNote } from './use-home-chat';

/** Long enough for a rambling list of purchases, short enough to transcribe fast. */
const MAX_DURATION_MS = 3 * 60 * 1000;

/** How many level samples the live waveform keeps. */
const LEVEL_SAMPLES = 40;

const SAMPLE_INTERVAL_MS = 80;

const VOICE_PRESET = {
  ...RecordingPresets.HIGH_QUALITY,
  numberOfChannels: 1,
  bitRate: 64000,
  isMeteringEnabled: true,
};

export type VoiceRecorderStart = 'started' | 'denied' | 'failed';

type VoiceRecorderOptions = {
  /** Called once when a note reaches the length limit, so it can be sent rather than cut. */
  onLimit?: () => void;
};

/**
 * Records a voice note: m4a, mono, with live levels for a waveform. The audio
 * session only allows recording while a note is being made, so playback
 * elsewhere in the app (the rosary, voicemails) keeps its usual behaviour.
 */
export function useVoiceRecorder({ onLimit }: VoiceRecorderOptions = {}) {
  const recorder = useAudioRecorder(VOICE_PRESET);
  const [active, setActive] = useState(false);
  const [durationMillis, setDurationMillis] = useState(0);
  const [levels, setLevels] = useState<number[]>([]);
  const stopping = useRef(false);
  const onLimitRef = useRef(onLimit);

  useEffect(() => {
    onLimitRef.current = onLimit;
  }, [onLimit]);

  useEffect(() => {
    if (!active) {
      return;
    }

    let limitReported = false;

    const interval = setInterval(() => {
      const status = recorder.getStatus();
      setDurationMillis(status.durationMillis);

      if (status.metering !== undefined) {
        // Metering is dBFS (about -60 silence, 0 loud); map it to 0-1.
        const level = Math.min(1, Math.max(0, (status.metering + 55) / 50));
        setLevels((current) => [...current.slice(-(LEVEL_SAMPLES - 1)), level]);
      }

      if (!limitReported && status.durationMillis >= MAX_DURATION_MS) {
        limitReported = true;
        onLimitRef.current?.();
      }
    }, SAMPLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [active, recorder]);

  const reset = useCallback(async () => {
    setActive(false);
    setLevels([]);
    setDurationMillis(0);
    try {
      await setAudioModeAsync({ allowsRecording: false });
    } catch {
      // The session settles on its own on the next playback.
    }
  }, []);

  const start = useCallback(async (): Promise<VoiceRecorderStart> => {
    const permission = await requestRecordingPermissionsAsync();

    if (!permission.granted) {
      return 'denied';
    }

    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      stopping.current = false;
      setLevels([]);
      setDurationMillis(0);
      setActive(true);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      return 'started';
    } catch {
      await reset();

      return 'failed';
    }
  }, [recorder, reset]);

  const finish = useCallback(async (): Promise<VoiceNote | null> => {
    if (stopping.current) {
      return null;
    }

    stopping.current = true;
    const recorded = recorder.getStatus().durationMillis;

    try {
      await recorder.stop();
    } finally {
      await reset();
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // A tap that ends right away is a slip, not a note.
    if (!recorder.uri || recorded < 600) {
      return null;
    }

    return { uri: recorder.uri, durationMillis: recorded };
  }, [recorder, reset]);

  const cancel = useCallback(async () => {
    if (stopping.current) {
      return;
    }

    stopping.current = true;
    try {
      await recorder.stop();
    } catch {
      // Nothing was recording.
    } finally {
      await reset();
    }
  }, [recorder, reset]);

  return { active, durationMillis, levels, start, finish, cancel };
}
