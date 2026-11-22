import type { Track } from '@/game/rounds';
import { bankingPortal } from './banking-portal';
import { documentVault } from './document-vault';
import { edgeFirewall } from './edge-firewall';
import { fintechEu } from './fintech-eu';
import { healthRecords } from './health-records';
import { hrPortal } from './hr-portal';
import { partnerApi } from './partner-api';
import { paymentApi } from './payment-api';

/** Design problems about secure architectures (SAA-C03 domain 1). */
export const SECURE_TRACKS: Track[] = [documentVault, healthRecords, paymentApi, bankingPortal, hrPortal, partnerApi, edgeFirewall, fintechEu];
