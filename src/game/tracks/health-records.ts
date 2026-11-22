import { makeBoard } from '../board';
import type { Track } from '../rounds';
import type { RequirementId } from '../types';

/** Patient-data rules that hold in every round. */
const RULES: RequirementId[] = ['encryptData', 'privateData', 'noPublicServers'];

const locked = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'medium' }],
    ['db', 'rds', 680, 240, { size: 'medium', encrypted: true }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const scans = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 260, 240],
    ['files', 's3', 460, 80],
    ['lb', 'alb', 460, 240],
    ['web', 'ec2', 660, 240, { size: 'medium' }],
    ['db', 'rds', 860, 240, { size: 'medium', encrypted: true }],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const cached = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 260, 240],
    ['files', 's3', 460, 80],
    ['lb', 'alb', 460, 240],
    ['web', 'ec2', 660, 240, { size: 'medium', count: 2, az: 'spread' }],
    ['cache', 'elasticache', 880, 140, { encrypted: true }],
    ['db', 'rds', 880, 320, { size: 'medium', encrypted: true }],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
  ],
);

const shielded = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['shield', 'waf', 220, 240],
    ['cdn', 'cloudfront', 380, 240],
    ['files', 's3', 560, 80],
    ['lb', 'alb', 560, 240],
    ['web', 'ec2', 760, 240, { size: 'medium', count: 2, az: 'spread' }],
    ['cache', 'elasticache', 980, 140, { encrypted: true }],
    ['db', 'rds', 980, 320, { size: 'medium', encrypted: true }],
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
  ],
);

const audited = (queue: { encrypted: boolean }) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ['shield', 'waf', 220, 240],
      ['cdn', 'cloudfront', 380, 240],
      ['files', 's3', 560, 80],
      ['lb', 'alb', 560, 240],
      ['web', 'ec2', 760, 240, { size: 'medium', count: 2, az: 'spread' }],
      ['cache', 'elasticache', 980, 140, { encrypted: true }],
      ['db', 'rds', 980, 320, { size: 'medium', encrypted: true }],
      ['queue', 'sqs', 760, 440, queue],
      ['worker', 'ec2', 980, 480, { size: 'medium' }],
    ],
    [
      ['users', 'shield'],
      ['shield', 'cdn'],
      ['cdn', 'files'],
      ['cdn', 'lb'],
      ['lb', 'web'],
      ['web', 'cache'],
      ['web', 'db'],
      ['web', 'queue'],
      ['queue', 'worker'],
    ],
  );

export const healthRecords: Track = {
  id: 'health-records',
  difficulty: 'medium',
  rounds: [
    {
      id: 'ehr-private',
      scenario: {
        traffic: 300,
        mix: { read: 0.7, write: 0.3 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 200,
        budget: 90,
        requirements: RULES,
      },
      unlocks: [],
      lessons: ['vpc-networking-security', 'data-encryption-kms'],
      solution: locked,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['web', 'ec2', 320, 240, { size: 'medium' }],
          ['db', 'rds', 560, 240, { size: 'medium' }],
        ],
        [
          ['users', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'ehr-scans',
      scenario: {
        traffic: 700,
        mix: { static: 0.45, read: 0.4, write: 0.15 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 200,
        budget: 100,
        requirements: [...RULES, 'privateBucket'],
      },
      unlocks: [],
      lessons: ['edge-networking', 'secrets-certificates'],
      solution: scans,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['files', 's3', 280, 80],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, { size: 'medium' }],
          ['db', 'rds', 680, 240, { size: 'medium', encrypted: true }],
        ],
        [
          ['users', 'files'],
          ['users', 'lb'],
          ['lb', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'ehr-cache',
      scenario: {
        traffic: 900,
        mix: { static: 0.3, read: 0.6, write: 0.1 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 70,
        budget: 140,
        requirements: [...RULES, 'privateBucket'],
      },
      unlocks: [],
      lessons: ['nosql-caching', 'data-encryption-kms'],
      solution: cached,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['cdn', 'cloudfront', 260, 240],
          ['files', 's3', 460, 80],
          ['lb', 'alb', 460, 240],
          ['web', 'ec2', 660, 240, { size: 'medium', count: 2, az: 'spread' }],
          ['cache', 'elasticache', 880, 140],
          ['db', 'rds', 880, 320, { size: 'medium', encrypted: true }],
        ],
        [
          ['users', 'cdn'],
          ['cdn', 'files'],
          ['cdn', 'lb'],
          ['lb', 'web'],
          ['web', 'cache'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'ehr-stuffing',
      scenario: {
        traffic: 900,
        mix: { static: 0.3, read: 0.6, write: 0.1 },
        audience: { 'us-east-1': 1 },
        twist: 'ddos',
        latencyTarget: 80,
        budget: 150,
        requirements: [...RULES, 'privateBucket', 'webFirewall'],
      },
      unlocks: [],
      lessons: ['threat-detection-waf-shield'],
      solution: shielded,
      naive: cached,
    },
    {
      id: 'ehr-audit',
      scenario: {
        traffic: 900,
        mix: { static: 0.3, read: 0.45, write: 0.1, job: 0.15 },
        audience: { 'us-east-1': 1 },
        twist: 'ddos',
        latencyTarget: 80,
        budget: 185,
        requirements: [...RULES, 'privateBucket', 'webFirewall', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['decoupling-messaging', 'threat-detection-waf-shield'],
      solution: audited({ encrypted: true }),
      naive: audited({ encrypted: false }),
    },
  ],
};
