import type { Track } from '@/game/rounds';
import { ecommerce } from './ecommerce';
import { notifications } from './notifications';
import { saasDr } from './saas-dr';
import { ticketing } from './ticketing';

/** Design problems about resilient, loosely coupled architectures (SAA-C03 domain 2). */
export const RESILIENT_TRACKS: Track[] = [notifications, ecommerce, ticketing, saasDr];
