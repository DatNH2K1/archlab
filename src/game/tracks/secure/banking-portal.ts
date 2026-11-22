import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import type { RequirementId } from '@/game/types';

/** Compliance rules that hold in every round. */
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

const multiAz = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'medium', count: 2, az: 'spread' }],
    ['db', 'rds', 680, 240, { size: 'medium', encrypted: true, multiAz: true }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const shielded = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['shield', 'waf', 260, 240],
    ['lb', 'alb', 440, 240],
    ['web', 'ec2', 640, 240, { size: 'medium', count: 2, az: 'spread' }],
    ['db', 'rds', 860, 240, { size: 'medium', encrypted: true, multiAz: true }],
  ],
  [
    ['users', 'shield'],
    ['shield', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const statements = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['shield', 'waf', 260, 240],
    ['lb', 'alb', 440, 240],
    ['web', 'ec2', 640, 240, { size: 'medium', count: 2, az: 'spread' }],
    ['db', 'rds', 860, 240, { size: 'medium', encrypted: true, multiAz: true }],
    ['queue', 'sqs', 640, 420, { encrypted: true }],
    ['worker', 'ec2', 860, 420],
  ],
  [
    ['users', 'shield'],
    ['shield', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
    ['web', 'queue'],
    ['queue', 'worker'],
  ],
);

const global = makeBoard(
  [
    ['users', 'users', 80, 280],
    ['shield', 'waf', 240, 280],
    ['cdn', 'cloudfront', 400, 280],
    ['files', 's3', 580, 100],
    ['ga', 'globalAccelerator', 580, 280],
    ['lb', 'alb', 760, 280],
    ['web', 'ec2', 940, 280, { size: 'medium', count: 2, az: 'spread' }],
    ['db', 'rds', 1140, 280, { size: 'medium', encrypted: true, multiAz: true }],
    ['queue', 'sqs', 940, 460, { encrypted: true }],
    ['worker', 'ec2', 1140, 460],
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'ga'],
    ['ga', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
    ['web', 'queue'],
    ['queue', 'worker'],
  ],
);

const payday = makeBoard(
  [
    ['users', 'users', 80, 280],
    ['shield', 'waf', 240, 280],
    ['cdn', 'cloudfront', 400, 280],
    ['files', 's3', 580, 100],
    ['ga', 'globalAccelerator', 580, 280],
    ['lb', 'alb', 760, 280],
    [
      'web',
      'ec2',
      940,
      280,
      {
        size: 'medium',
        count: 2,
        az: 'spread',
        autoScaling: true,
        maxCount: 6,
      },
    ],
    ['db', 'rds', 1140, 280, { size: 'large', encrypted: true, multiAz: true }],
    ['queue', 'sqs', 940, 460, { encrypted: true }],
    ['worker', 'ec2', 1140, 460, { size: 'medium' }],
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'ga'],
    ['ga', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
    ['web', 'queue'],
    ['queue', 'worker'],
  ],
);

export const bankingPortal: Track = {
  id: 'banking-portal',
  difficulty: 'hard',
  rounds: [
    {
      id: 'bank-secure',
      scenario: {
        traffic: 400,
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
      id: 'bank-az',
      scenario: {
        traffic: 400,
        mix: { read: 0.7, write: 0.3 },
        audience: { 'us-east-1': 1 },
        twist: 'azOutage',
        latencyTarget: 200,
        budget: 150,
        requirements: RULES,
      },
      unlocks: [],
      lessons: ['high-availability-multi-az', 'relational-databases'],
      solution: multiAz,
      naive: locked,
    },
    {
      id: 'bank-attack',
      scenario: {
        traffic: 400,
        mix: { read: 0.7, write: 0.3 },
        audience: { 'us-east-1': 1 },
        twist: 'ddos',
        latencyTarget: 200,
        budget: 155,
        requirements: RULES,
      },
      unlocks: [],
      lessons: ['threat-detection-waf-shield'],
      solution: shielded,
      naive: multiAz,
    },
    {
      id: 'bank-statements',
      scenario: {
        traffic: 400,
        mix: { read: 0.6, write: 0.25, job: 0.15 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 120,
        budget: 175,
        requirements: [...RULES, 'drainQueue'],
      },
      unlocks: [],
      lessons: ['decoupling-messaging'],
      solution: statements,
      naive: shielded,
    },
    {
      id: 'bank-far',
      scenario: {
        traffic: 600,
        mix: { static: 0.35, read: 0.4, write: 0.15, job: 0.1 },
        audience: { 'us-east-1': 0.6, 'eu-west-1': 0.4 },
        latencyTarget: 80,
        budget: 210,
        requirements: [...RULES, 'drainQueue'],
      },
      unlocks: [],
      lessons: ['edge-networking', 's3-performance'],
      solution: global,
      naive: statements,
    },
    {
      id: 'bank-payday',
      scenario: {
        traffic: 600,
        mix: { static: 0.35, read: 0.4, write: 0.15, job: 0.1 },
        audience: { 'us-east-1': 0.6, 'eu-west-1': 0.4 },
        twist: 'flashSale',
        latencyTarget: 90,
        budget: 320,
        requirements: [...RULES, 'drainQueue'],
      },
      unlocks: [],
      lessons: ['auto-scaling', 'relational-databases'],
      solution: payday,
      naive: global,
    },
  ],
};
