import TrackPlayer, { Event } from 'react-native-track-player';

/**
 * Remote-control handlers for audio played through TrackPlayer (voicemails):
 * lock screen, control center and headphone buttons all land here.
 */
export async function playbackService(): Promise<void> {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteDuck, (event) => {
    // A call or navigation prompt pauses playback; resume when it ends.
    if (event.paused) {
      void TrackPlayer.pause();
    } else if (!event.permanent) {
      void TrackPlayer.play();
    }
  });
}
