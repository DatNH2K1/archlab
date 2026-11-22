import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType } from '@/game/types';
import type { NodeConfig, RequirementId } from '@/game/types';

/** Rules for company documents that hold in every round. */
const RULES: RequirementId[] = ['encryptData', 'privateData', 'privateBucket'];

const DB = { encrypted: true } satisfies Partial<NodeConfig>;

const shared = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 280, y: 240 },
    { id: 'files', type: ComponentType.S3, x: 480, y: 80 },
    { id: 'api', type: ComponentType.ApiGateway, x: 480, y: 240 },
    { id: 'fn', type: ComponentType.Lambda, x: 680, y: 240 },
    { id: 'db', type: ComponentType.DynamoDb, x: 880, y: 240, config: DB },
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
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      ...(o.waf ? [{ id: 'shield', type: ComponentType.Waf, x: 220, y: 240 } as const] : []),
      { id: 'cdn', type: ComponentType.CloudFront, x: 380, y: 240 },
      { id: 'files', type: ComponentType.S3, x: 580, y: 80 },
      { id: 'api', type: ComponentType.ApiGateway, x: 580, y: 240 },
      { id: 'fn', type: ComponentType.Lambda, x: 780, y: 240 },
      { id: 'db', type: ComponentType.DynamoDb, x: 980, y: 240, config: DB },
      { id: 'queue', type: ComponentType.Sqs, x: 780, y: 420, config: o.queue },
      { id: 'scanner', type: ComponentType.Lambda, x: 980, y: 420 },
    ],
    [
      ...(o.waf
        ? [
            ['users', 'shield'],
            ['shield', 'cdn'],
          ] as const
        : [['users', 'cdn']] as const),
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
      { id: 'users', type: ComponentType.Users, x: 80, y: 300 },
      { id: 'shield', type: ComponentType.Waf, x: 220, y: 300 },
      { id: 'cdn', type: ComponentType.CloudFront, x: 380, y: 300 },
      { id: 'files', type: ComponentType.S3, x: 580, y: 40 },
      { id: 'files2', type: ComponentType.S3, x: 580, y: 560, config: { ...o.replicaBucket, region: 'eu-west-1' } },
      { id: 'dns', type: ComponentType.Route53, x: 560, y: 300 },
      { id: 'api', type: ComponentType.ApiGateway, x: 740, y: 180 },
      { id: 'fn', type: ComponentType.Lambda, x: 920, y: 180 },
      { id: 'api2', type: ComponentType.ApiGateway, x: 740, y: 420, config: { region: 'eu-west-1' } },
      { id: 'fn2', type: ComponentType.Lambda, x: 920, y: 420, config: { region: 'eu-west-1' } },
      // DynamoDB global table: one table with a managed copy in eu-west-1.
      { id: 'db', type: ComponentType.DynamoDb, x: 1120, y: 300, config: { ...DB, globalDb: true } },
      { id: 'queue', type: ComponentType.Sqs, x: 1120, y: 120, config: { encrypted: true } },
      { id: 'scanner', type: ComponentType.Lambda, x: 1300, y: 120 },
      { id: 'queue2', type: ComponentType.Sqs, x: 1120, y: 480, config: { encrypted: true, region: 'eu-west-1' } },
      { id: 'scanner2', type: ComponentType.Lambda, x: 1300, y: 480, config: { region: 'eu-west-1' } },
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
      lessons: [LessonSlug.IdentityFederationCognito, LessonSlug.EdgeNetworking],
      solution: shared,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'files', type: ComponentType.S3, x: 280, y: 80 },
          { id: 'api', type: ComponentType.ApiGateway, x: 280, y: 240 },
          { id: 'fn', type: ComponentType.Lambda, x: 480, y: 240 },
          { id: 'db', type: ComponentType.DynamoDb, x: 680, y: 240, config: DB },
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
      lessons: [LessonSlug.DecouplingMessaging, LessonSlug.ThreatDetectionWafShield],
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
      lessons: [LessonSlug.ThreatDetectionWafShield],
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
      lessons: [LessonSlug.DisasterRecovery, LessonSlug.DataEncryptionKms],
      solution: twoRegions({ replicaBucket: {} }),
      naive: twoRegions({ replicaBucket: { encrypted: false } }),
    },
  ],
};
