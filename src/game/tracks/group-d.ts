import type { Track } from '../rounds';
import { bankingPortal } from './banking-portal';
import { gameLeaderboard } from './game-leaderboard';
import { startupApi } from './startup-api';

/** Design problems written for group D. */
export const GROUP_D: Track[] = [gameLeaderboard, startupApi, bankingPortal];
