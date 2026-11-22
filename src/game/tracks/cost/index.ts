import type { Track } from '@/game/rounds';
import { legacyCrm } from './legacy-crm';
import { saasBilling } from './saas-billing';
import { startupApi } from './startup-api';
import { staticWebsite } from './static-website';
import { urlShortener } from './url-shortener';

/** Design problems about cost-optimized architectures (SAA-C03 domain 4). */
export const COST_TRACKS: Track[] = [urlShortener, staticWebsite, startupApi, legacyCrm, saasBilling];
