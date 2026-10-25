import type { Track } from '../rounds';
import { iotTelemetry } from './iot-telemetry';
import { saasDr } from './saas-dr';
import { videoStreaming } from './video-streaming';

/** Design problems written for group C. */
export const GROUP_C: Track[] = [videoStreaming, saasDr, iotTelemetry];
