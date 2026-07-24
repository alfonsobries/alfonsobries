import TrackPlayer, { Event } from 'react-native-track-player';

/**
 * Remote-control handlers for the rosary autoplayer: lock screen, control
 * center, car and headphone buttons all land here, so the rosary keeps
 * flowing without touching the phone.
 */
export async function rosaryPlaybackService(): Promise<void> {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteDuck, (event) => {
    // A call or navigation prompt pauses the prayer; resume when it ends.
    if (event.paused) {
      void TrackPlayer.pause();
    } else if (!event.permanent) {
      void TrackPlayer.play();
    }
  });
}
