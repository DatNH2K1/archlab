import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';
import type { NodeConfig, RequirementId } from '@/game/types';

/** Card-data rules that hold in every round. */
const RULES: RequirementId[] = ['encryptData', 'privateData'];

const DB = { encrypted: true } satisfies Partial<NodeConfig>;

const core = (o: { waf: boolean; db: Partial<NodeConfig> }) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      ...(o.waf ? [{ id: 'shield', type: ComponentType.Waf, x: 240, y: 240 } as const] : []),
      { id: 'api', type: ComponentType.ApiGateway, x: 400, y: 240 },
      { id: 'fn', type: ComponentType.Lambda, x: 600, y: 240 },
      { id: 'db', type: ComponentType.DynamoDb, x: 800, y: 240, config: o.db },
    ],
    [
      ...(o.waf
        ? [
            ['users', 'shield'],
            ['shield', 'api'],
          ] as const
        : [['users', 'api']] as const),
      ['api', 'fn'],
      ['fn', 'db'],
    ],
  );

const fraud = (queue: Partial<NodeConfig>) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'shield', type: ComponentType.Waf, x: 240, y: 240 },
      { id: 'api', type: ComponentType.ApiGateway, x: 400, y: 240 },
      { id: 'fn', type: ComponentType.Lambda, x: 600, y: 240 },
      { id: 'db', type: ComponentType.DynamoDb, x: 800, y: 240, config: DB },
      { id: 'queue', type: ComponentType.Sqs, x: 600, y: 420, config: queue },
      { id: 'scorer', type: ComponentType.Lambda, x: 800, y: 420 },
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
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'shield', type: ComponentType.Waf, x: 240, y: 240 },
      { id: 'api', type: ComponentType.ApiGateway, x: 400, y: 240 },
      { id: 'fn', type: ComponentType.Lambda, x: 600, y: 240 },
      { id: 'db', type: ComponentType.DynamoDb, x: 800, y: 240, config: DB },
      { id: 'topic', type: ComponentType.Sns, x: 600, y: 420 },
      { id: 'queue', type: ComponentType.Sqs, x: 800, y: 380, config: { encrypted: true } },
      { id: 'scorer', type: ComponentType.Lambda, x: 1000, y: 380 },
      { id: 'queue2', type: ComponentType.Sqs, x: 800, y: 520, config: mailQueue },
      { id: 'mailer', type: ComponentType.Lambda, x: 1000, y: 520 },
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
      lessons: [LessonSlug.IamFundamentals, LessonSlug.DataEncryptionKms],
      solution: core({ waf: false, db: DB }),
      naive: core({ waf: false, db: {} }),
    },
    {
      id: 'pay-card-testing',
      scenario: {
        traffic: 300,
        mix: { read: 0.5, write: 0.5 },
        audience: { 'us-east-1': 1 },
        twist: Twist.Ddos,
        latencyTarget: 150,
        budget: 80,
        requirements: [...RULES, 'webFirewall'],
      },
      unlocks: [],
      lessons: [LessonSlug.ThreatDetectionWafShield, LessonSlug.ServerlessWorkflows],
      solution: core({ waf: true, db: DB }),
      naive: core({ waf: false, db: DB }),
    },
    {
      id: 'pay-fraud',
      scenario: {
        traffic: 300,
        mix: { read: 0.4, write: 0.4, job: 0.2 },
        audience: { 'us-east-1': 1 },
        twist: Twist.Ddos,
        latencyTarget: 150,
        budget: 90,
        requirements: [...RULES, 'webFirewall', 'drainQueue'],
      },
      unlocks: [],
      lessons: [LessonSlug.DecouplingMessaging, LessonSlug.DataEncryptionKms],
      solution: fraud({ encrypted: true }),
      naive: fraud({}),
    },
    {
      id: 'pay-receipts',
      scenario: {
        traffic: 300,
        mix: { read: 0.4, write: 0.4, job: 0.2 },
        audience: { 'us-east-1': 1 },
        twist: Twist.Ddos,
        latencyTarget: 150,
        budget: 100,
        requirements: [...RULES, 'webFirewall', 'drainQueue', 'fanOut'],
      },
      unlocks: [],
      lessons: [LessonSlug.ApplicationIntegration, LessonSlug.DecouplingMessaging],
      solution: fanOut({ encrypted: true }),
      naive: fanOut({}),
    },
  ],
};
