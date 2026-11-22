import type { Track } from '@/game/rounds';
import { gameLeaderboard } from './game-leaderboard';
import { iotTelemetry } from './iot-telemetry';
import { newsFeed } from './news-feed';
import { photoSharing } from './photo-sharing';
import { realtimeGame } from './realtime-game';
import { videoStreaming } from './video-streaming';

/** Design problems about high-performing architectures (SAA-C03 domain 3). */
export const PERFORMANCE_TRACKS: Track[] = [photoSharing, newsFeed, videoStreaming, iotTelemetry, gameLeaderboard, realtimeGame];
