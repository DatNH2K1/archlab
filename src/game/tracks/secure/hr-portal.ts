import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';
import type { NodeConfig, Region, RequirementId } from '@/game/types';

/** Staff data rules that hold in every round. */
const RULES: RequirementId[] = ['userAuth', 'encryptData', 'privateData'];

const signin = (o: { cognito: boolean }) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'api', type: ComponentType.ApiGateway, x: 300, y: 240 },
      ...(o.cognito ? [{ id: 'auth', type: ComponentType.Cognito, x: 300, y: 420 } as const] : []),
      { id: 'fn', type: ComponentType.Lambda, x: 520, y: 240 },
      { id: 'db', type: ComponentType.DynamoDb, x: 740, y: 240, config: { encrypted: true } },
    ],
    [['users', 'api'], ['api', 'fn'], ['fn', 'db'], ...(o.cognito ? [['api', 'auth'] as const] : [])],
  );

const portal = (o: {
  waf?: boolean;
  region?: Region;
  bucketRegion?: Region;
  backup?: boolean;
  bucket?: Partial<NodeConfig>;
  publicBucket?: boolean;
}) => {
  const region = o.region ?? 'us-east-1';
  const backup = o.backup ?? false;

  return makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      ...(o.waf ? [{ id: 'shield', type: ComponentType.Waf, x: 220, y: 240 } as const] : []),
      { id: 'cdn', type: ComponentType.CloudFront, x: 380, y: 240 },
      {
        id: 'files',
        type: ComponentType.S3,
        x: 580,
        y: 60,
        config: { region: o.bucketRegion ?? region, backup, ...o.bucket },
      },
      { id: 'api', type: ComponentType.ApiGateway, x: 580, y: 240, config: { region } },
      { id: 'auth', type: ComponentType.Cognito, x: 580, y: 420 },
      { id: 'fn', type: ComponentType.Lambda, x: 780, y: 240, config: { region } },
      { id: 'db', type: ComponentType.DynamoDb, x: 980, y: 240, config: { encrypted: true, region, backup } },
    ],
    [
      ...(o.waf
        ? [
            ['users', 'shield'],
            ['shield', 'cdn'],
          ] as const
        : [['users', 'cdn']] as const),
      ...(o.publicBucket ? [['users', 'files'] as const] : [['cdn', 'files'] as const]),
      ['cdn', 'api'],
      ['api', 'auth'],
      ['api', 'fn'],
      ['fn', 'db'],
    ],
  );
};

const EU = { 'us-east-1': 0.1, 'eu-west-1': 0.9 } as const;

export const hrPortal: Track = {
  id: 'hr-portal',
  difficulty: 'medium',
  rounds: [
    {
      id: 'hr-signin',
      scenario: {
        traffic: 200,
        mix: { read: 0.7, write: 0.3 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 200,
        budget: 45,
        requirements: RULES,
      },
      unlocks: [],
      lessons: [LessonSlug.IdentityFederationCognito, LessonSlug.SecurityLayersOverview],
      solution: signin({ cognito: true }),
      naive: signin({ cognito: false }),
    },
    {
      id: 'hr-payslips',
      scenario: {
        traffic: 800,
        mix: { static: 0.6, read: 0.3, write: 0.1 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 200,
        budget: 80,
        requirements: [...RULES, 'privateBucket'],
      },
      unlocks: [],
      lessons: [LessonSlug.S3Performance, LessonSlug.EdgeNetworking],
      solution: portal({}),
      naive: portal({ publicBucket: true }),
    },
    {
      id: 'hr-ransom',
      scenario: {
        traffic: 800,
        mix: { static: 0.6, read: 0.3, write: 0.1 },
        audience: { 'us-east-1': 1 },
        twist: Twist.DataLoss,
        latencyTarget: 200,
        budget: 85,
        requirements: [...RULES, 'privateBucket'],
      },
      unlocks: [],
      lessons: [LessonSlug.BackupReplication, LessonSlug.DataEncryptionKms],
      solution: portal({ backup: true }),
      naive: portal({ bucket: { backup: true } }),
    },
    {
      id: 'hr-eu',
      scenario: {
        traffic: 800,
        mix: { static: 0.6, read: 0.3, write: 0.1 },
        audience: EU,
        twist: Twist.DataLoss,
        latencyTarget: 200,
        budget: 85,
        requirements: [...RULES, 'privateBucket', 'dataResidency'],
      },
      unlocks: [],
      lessons: [LessonSlug.IamOrganizationsScp, LessonSlug.SecurityLayersOverview],
      solution: portal({ backup: true, region: 'eu-west-1' }),
      naive: portal({ backup: true, region: 'eu-west-1', bucketRegion: 'us-east-1' }),
    },
    {
      id: 'hr-bots',
      scenario: {
        traffic: 800,
        mix: { static: 0.6, read: 0.3, write: 0.1 },
        audience: EU,
        twist: Twist.Ddos,
        latencyTarget: 200,
        budget: 95,
        requirements: [...RULES, 'privateBucket', 'dataResidency', 'webFirewall'],
      },
      unlocks: [],
      lessons: [LessonSlug.ThreatDetectionWafShield, LessonSlug.IdentityFederationCognito],
      solution: portal({ backup: true, region: 'eu-west-1', waf: true }),
      naive: portal({ backup: true, region: 'eu-west-1' }),
    },
  ],
};
