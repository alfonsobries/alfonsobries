import TrackPlayer from 'react-native-track-player';

import { rosaryPlaybackService } from './src/lib/rosary-playback-service';
// Registers the home geofence task before the router, for background launches.
import './src/lib/home-presence';

import 'expo-router/entry';

// TrackPlayer's service must be registered at the app entry, outside React.
TrackPlayer.registerPlaybackService(() => rosaryPlaybackService);
