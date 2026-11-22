import type { Track } from '../rounds';
import { documentVault } from './document-vault';
import { healthRecords } from './health-records';
import { paymentApi } from './payment-api';

/** Design problems focused on secure architectures. */
export const GROUP_E: Track[] = [documentVault, healthRecords, paymentApi];
