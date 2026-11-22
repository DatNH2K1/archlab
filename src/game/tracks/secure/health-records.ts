import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';
import type { RequirementId } from '@/game/types';

/** Patient-data rules that hold in every round. */
const RULES: RequirementId[] = ['encryptData', 'privateData', 'noPublicServers'];

const locked = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium' } },
    { id: 'db', type: ComponentType.Rds, x: 680, y: 240, config: { size: 'medium', encrypted: true } },
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const scans = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 260, y: 240 },
    { id: 'files', type: ComponentType.S3, x: 460, y: 80 },
    { id: 'lb', type: ComponentType.Alb, x: 460, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 660, y: 240, config: { size: 'medium' } },
    { id: 'db', type: ComponentType.Rds, x: 860, y: 240, config: { size: 'medium', encrypted: true } },
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
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 260, y: 240 },
    { id: 'files', type: ComponentType.S3, x: 460, y: 80 },
    { id: 'lb', type: ComponentType.Alb, x: 460, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 660, y: 240, config: { size: 'medium', count: 2, az: 'spread' } },
    { id: 'cache', type: ComponentType.ElastiCache, x: 880, y: 140, config: { encrypted: true } },
    { id: 'db', type: ComponentType.Rds, x: 880, y: 320, config: { size: 'medium', encrypted: true } },
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
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'shield', type: ComponentType.Waf, x: 220, y: 240 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 380, y: 240 },
    { id: 'files', type: ComponentType.S3, x: 560, y: 80 },
    { id: 'lb', type: ComponentType.Alb, x: 560, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 760, y: 240, config: { size: 'medium', count: 2, az: 'spread' } },
    { id: 'cache', type: ComponentType.ElastiCache, x: 980, y: 140, config: { encrypted: true } },
    { id: 'db', type: ComponentType.Rds, x: 980, y: 320, config: { size: 'medium', encrypted: true } },
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
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'shield', type: ComponentType.Waf, x: 220, y: 240 },
      { id: 'cdn', type: ComponentType.CloudFront, x: 380, y: 240 },
      { id: 'files', type: ComponentType.S3, x: 560, y: 80 },
      { id: 'lb', type: ComponentType.Alb, x: 560, y: 240 },
      { id: 'web', type: ComponentType.Ec2, x: 760, y: 240, config: { size: 'medium', count: 2, az: 'spread' } },
      { id: 'cache', type: ComponentType.ElastiCache, x: 980, y: 140, config: { encrypted: true } },
      { id: 'db', type: ComponentType.Rds, x: 980, y: 320, config: { size: 'medium', encrypted: true } },
      { id: 'queue', type: ComponentType.Sqs, x: 760, y: 440, config: queue },
      { id: 'worker', type: ComponentType.Ec2, x: 980, y: 480, config: { size: 'medium' } },
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
      lessons: [LessonSlug.VpcNetworkingSecurity, LessonSlug.DataEncryptionKms],
      solution: locked,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 320, y: 240, config: { size: 'medium' } },
          { id: 'db', type: ComponentType.Rds, x: 560, y: 240, config: { size: 'medium' } },
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
      lessons: [LessonSlug.EdgeNetworking, LessonSlug.SecretsCertificates],
      solution: scans,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'files', type: ComponentType.S3, x: 280, y: 80 },
          { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium' } },
          { id: 'db', type: ComponentType.Rds, x: 680, y: 240, config: { size: 'medium', encrypted: true } },
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
      lessons: [LessonSlug.NoSqlCaching, LessonSlug.DataEncryptionKms],
      solution: cached,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'cdn', type: ComponentType.CloudFront, x: 260, y: 240 },
          { id: 'files', type: ComponentType.S3, x: 460, y: 80 },
          { id: 'lb', type: ComponentType.Alb, x: 460, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 660, y: 240, config: { size: 'medium', count: 2, az: 'spread' } },
          { id: 'cache', type: ComponentType.ElastiCache, x: 880, y: 140 },
          { id: 'db', type: ComponentType.Rds, x: 880, y: 320, config: { size: 'medium', encrypted: true } },
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
        twist: Twist.Ddos,
        latencyTarget: 80,
        budget: 150,
        requirements: [...RULES, 'privateBucket', 'webFirewall'],
      },
      unlocks: [],
      lessons: [LessonSlug.ThreatDetectionWafShield],
      solution: shielded,
      naive: cached,
    },
    {
      id: 'ehr-audit',
      scenario: {
        traffic: 900,
        mix: { static: 0.3, read: 0.45, write: 0.1, job: 0.15 },
        audience: { 'us-east-1': 1 },
        twist: Twist.Ddos,
        latencyTarget: 80,
        budget: 185,
        requirements: [...RULES, 'privateBucket', 'webFirewall', 'drainQueue'],
      },
      unlocks: [],
      lessons: [LessonSlug.DecouplingMessaging, LessonSlug.ThreatDetectionWafShield],
      solution: audited({ encrypted: true }),
      naive: audited({ encrypted: false }),
    },
  ],
};
