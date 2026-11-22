import type { Track } from '@/game/rounds';
import { bankingPortal } from './banking-portal';
import { documentVault } from './document-vault';
import { healthRecords } from './health-records';
import { paymentApi } from './payment-api';

/** Design problems about secure architectures (SAA-C03 domain 1). */
export const SECURE_TRACKS: Track[] = [documentVault, healthRecords, paymentApi, bankingPortal];
