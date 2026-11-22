import { makeBoard } from '../board';
import type { Track } from '../rounds';
import type { NodeConfig, RequirementId } from '../types';

/** Card-data rules that hold in every round. */
const RULES: RequirementId[] = ['encryptData', 'privateData'];

const DB = { encrypted: true } satisfies Partial<NodeConfig>;

const core = (o: { waf: boolean; db: Partial<NodeConfig> }) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ...(o.waf ? [['shield', 'waf', 240, 240] as const] : []),
      ['api', 'apiGateway', 400, 240],
      ['fn', 'lambda', 600, 240],
      ['db', 'dynamodb', 800, 240, o.db],
    ] as Parameters<typeof makeBoard>[0],
    [
      ...(o.waf
        ? ([
            ['users', 'shield'],
            ['shield', 'api'],
          ] as [string, string][])
        : ([['users', 'api']] as [string, string][])),
      ['api', 'fn'],
      ['fn', 'db'],
    ],
  );

const fraud = (queue: Partial<NodeConfig>) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ['shield', 'waf', 240, 240],
      ['api', 'apiGateway', 400, 240],
      ['fn', 'lambda', 600, 240],
      ['db', 'dynamodb', 800, 240, DB],
      ['queue', 'sqs', 600, 420, queue],
      ['scorer', 'lambda', 800, 420],
    ],
    [
      ['users', 'shield'],
      ['shield', 'api'],
      ['api', 'fn'],
      ['fn', 'db'],
      ['fn', 'queue'],
      ['queue', 'scorer'],
    ],
  );

const fanOut = (mailQueue: Partial<NodeConfig>) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ['shield', 'waf', 240, 240],
      ['api', 'apiGateway', 400, 240],
      ['fn', 'lambda', 600, 240],
      ['db', 'dynamodb', 800, 240, DB],
      ['topic', 'sns', 600, 420],
      ['queue', 'sqs', 800, 380, { encrypted: true }],
      ['scorer', 'lambda', 1000, 380],
      ['queue2', 'sqs', 800, 520, mailQueue],
      ['mailer', 'lambda', 1000, 520],
    ],
    [
      ['users', 'shield'],
      ['shield', 'api'],
      ['api', 'fn'],
      ['fn', 'db'],
      ['fn', 'topic'],
      ['topic', 'queue'],
      ['queue', 'scorer'],
      ['topic', 'queue2'],
      ['queue2', 'mailer'],
    ],
  );

export const paymentApi: Track = {
  id: 'payment-api',
  difficulty: 'hard',
  rounds: [
    {
      id: 'pay-launch',
      scenario: {
        traffic: 300,
        mix: { read: 0.5, write: 0.5 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 150,
        budget: 70,
        requirements: RULES,
      },
      unlocks: [],
      lessons: ['iam-fundamentals', 'data-encryption-kms'],
      solution: core({ waf: false, db: DB }),
      naive: core({ waf: false, db: {} }),
    },
    {
      id: 'pay-card-testing',
      scenario: {
        traffic: 300,
        mix: { read: 0.5, write: 0.5 },
        audience: { 'us-east-1': 1 },
        twist: 'ddos',
        latencyTarget: 150,
        budget: 80,
        requirements: [...RULES, 'webFirewall'],
      },
      unlocks: [],
      lessons: ['threat-detection-waf-shield', 'serverless-workflows'],
      solution: core({ waf: true, db: DB }),
      naive: core({ waf: false, db: DB }),
    },
    {
      id: 'pay-fraud',
      scenario: {
        traffic: 300,
        mix: { read: 0.4, write: 0.4, job: 0.2 },
        audience: { 'us-east-1': 1 },
        twist: 'ddos',
        latencyTarget: 150,
        budget: 90,
        requirements: [...RULES, 'webFirewall', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['decoupling-messaging', 'data-encryption-kms'],
      solution: fraud({ encrypted: true }),
      naive: fraud({}),
    },
    {
      id: 'pay-receipts',
      scenario: {
        traffic: 300,
        mix: { read: 0.4, write: 0.4, job: 0.2 },
        audience: { 'us-east-1': 1 },
        twist: 'ddos',
        latencyTarget: 150,
        budget: 100,
        requirements: [...RULES, 'webFirewall', 'drainQueue', 'fanOut'],
      },
      unlocks: [],
      lessons: ['application-integration', 'decoupling-messaging'],
      solution: fanOut({ encrypted: true }),
      naive: fanOut({}),
    },
  ],
};
