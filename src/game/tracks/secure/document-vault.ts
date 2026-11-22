import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import type { NodeConfig, RequirementId } from '@/game/types';

/** Rules for company documents that hold in every round. */
const RULES: RequirementId[] = ['encryptData', 'privateData', 'privateBucket'];

const DB = { encrypted: true } satisfies Partial<NodeConfig>;

const shared = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 280, 240],
    ['files', 's3', 480, 80],
    ['api', 'apiGateway', 480, 240],
    ['fn', 'lambda', 680, 240],
    ['db', 'dynamodb', 880, 240, DB],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'api'],
    ['api', 'fn'],
    ['fn', 'db'],
  ],
);

const scanned = (o: { waf: boolean; queue: Partial<NodeConfig> }) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ...(o.waf ? [['shield', 'waf', 220, 240] as const] : []),
      ['cdn', 'cloudfront', 380, 240],
      ['files', 's3', 580, 80],
      ['api', 'apiGateway', 580, 240],
      ['fn', 'lambda', 780, 240],
      ['db', 'dynamodb', 980, 240, DB],
      ['queue', 'sqs', 780, 420, o.queue],
      ['scanner', 'lambda', 980, 420],
    ] as Parameters<typeof makeBoard>[0],
    [
      ...(o.waf
        ? ([
            ['users', 'shield'],
            ['shield', 'cdn'],
          ] as [string, string][])
        : ([['users', 'cdn']] as [string, string][])),
      ['cdn', 'files'],
      ['cdn', 'api'],
      ['api', 'fn'],
      ['fn', 'db'],
      ['fn', 'queue'],
      ['queue', 'scanner'],
    ],
  );

const twoRegions = (o: { replicaBucket: Partial<NodeConfig> }) =>
  makeBoard(
    [
      ['users', 'users', 80, 300],
      ['shield', 'waf', 220, 300],
      ['cdn', 'cloudfront', 380, 300],
      ['files', 's3', 580, 40],
      ['files2', 's3', 580, 560, { ...o.replicaBucket, region: 'eu-west-1' }],
      ['dns', 'route53', 560, 300],
      ['api', 'apiGateway', 740, 180],
      ['fn', 'lambda', 920, 180],
      ['api2', 'apiGateway', 740, 420, { region: 'eu-west-1' }],
      ['fn2', 'lambda', 920, 420, { region: 'eu-west-1' }],
      // DynamoDB global table: one table with a managed copy in eu-west-1.
      ['db', 'dynamodb', 1120, 300, { ...DB, globalDb: true }],
      ['queue', 'sqs', 1120, 120, { encrypted: true }],
      ['scanner', 'lambda', 1300, 120],
      ['queue2', 'sqs', 1120, 480, { encrypted: true, region: 'eu-west-1' }],
      ['scanner2', 'lambda', 1300, 480, { region: 'eu-west-1' }],
    ],
    [
      ['users', 'shield'],
      ['shield', 'cdn'],
      ['cdn', 'files'],
      ['cdn', 'files2'],
      ['cdn', 'dns'],
      ['dns', 'api'],
      ['dns', 'api2'],
      ['api', 'fn'],
      ['fn', 'db'],
      ['fn', 'queue'],
      ['queue', 'scanner'],
      ['api2', 'fn2'],
      ['fn2', 'db'],
      ['fn2', 'queue2'],
      ['queue2', 'scanner2'],
    ],
  );

export const documentVault: Track = {
  id: 'document-vault',
  difficulty: 'easy',
  rounds: [
    {
      id: 'vault-share',
      scenario: {
        traffic: 400,
        mix: { static: 0.7, read: 0.2, write: 0.1 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 80,
        budget: 35,
        requirements: RULES,
      },
      unlocks: [],
      lessons: ['identity-federation-cognito', 'edge-networking'],
      solution: shared,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['files', 's3', 280, 80],
          ['api', 'apiGateway', 280, 240],
          ['fn', 'lambda', 480, 240],
          ['db', 'dynamodb', 680, 240, DB],
        ],
        [
          ['users', 'files'],
          ['users', 'api'],
          ['api', 'fn'],
          ['fn', 'db'],
        ],
      ),
    },
    {
      id: 'vault-scan',
      scenario: {
        traffic: 400,
        mix: { static: 0.6, read: 0.15, write: 0.1, job: 0.15 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 80,
        budget: 45,
        requirements: [...RULES, 'drainQueue'],
      },
      unlocks: [],
      lessons: ['decoupling-messaging', 'threat-detection-waf-shield'],
      solution: scanned({ waf: false, queue: { encrypted: true } }),
      naive: scanned({ waf: false, queue: {} }),
    },
    {
      id: 'vault-scrape',
      scenario: {
        traffic: 400,
        mix: { static: 0.6, read: 0.15, write: 0.1, job: 0.15 },
        audience: { 'us-east-1': 1 },
        twist: 'ddos',
        latencyTarget: 80,
        budget: 55,
        requirements: [...RULES, 'drainQueue', 'webFirewall'],
      },
      unlocks: [],
      lessons: ['threat-detection-waf-shield'],
      solution: scanned({ waf: true, queue: { encrypted: true } }),
      naive: scanned({ waf: false, queue: { encrypted: true } }),
    },
    {
      id: 'vault-region',
      scenario: {
        traffic: 400,
        mix: { static: 0.6, read: 0.15, write: 0.1, job: 0.15 },
        audience: { 'us-east-1': 0.6, 'eu-west-1': 0.4 },
        twist: 'regionOutage',
        outageRegion: 'us-east-1',
        latencyTarget: 80,
        budget: 70,
        requirements: [...RULES, 'drainQueue', 'webFirewall'],
      },
      unlocks: [],
      lessons: ['disaster-recovery', 'data-encryption-kms'],
      solution: twoRegions({ replicaBucket: {} }),
      naive: twoRegions({ replicaBucket: { encrypted: false } }),
    },
  ],
};
