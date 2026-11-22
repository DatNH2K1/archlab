import type { Track } from '@/game/rounds';
import { clickstream } from './clickstream';
import { ecommerce } from './ecommerce';
import { notifications } from './notifications';
import { renderFarm } from './render-farm';
import { saasDr } from './saas-dr';
import { ticketing } from './ticketing';

/** Design problems about resilient, loosely coupled architectures (SAA-C03 domain 2). */
export const RESILIENT_TRACKS: Track[] = [notifications, ecommerce, ticketing, saasDr, renderFarm, clickstream];
