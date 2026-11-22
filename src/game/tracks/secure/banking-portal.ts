import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';
import type { RequirementId } from '@/game/types';

/** Compliance rules that hold in every round. */
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

const multiAz = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium', count: 2, az: 'spread' } },
    { id: 'db', type: ComponentType.Rds, x: 680, y: 240, config: { size: 'medium', encrypted: true, multiAz: true } },
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const shielded = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'shield', type: ComponentType.Waf, x: 260, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 440, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 640, y: 240, config: { size: 'medium', count: 2, az: 'spread' } },
    { id: 'db', type: ComponentType.Rds, x: 860, y: 240, config: { size: 'medium', encrypted: true, multiAz: true } },
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
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'shield', type: ComponentType.Waf, x: 260, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 440, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 640, y: 240, config: { size: 'medium', count: 2, az: 'spread' } },
    { id: 'db', type: ComponentType.Rds, x: 860, y: 240, config: { size: 'medium', encrypted: true, multiAz: true } },
    { id: 'queue', type: ComponentType.Sqs, x: 640, y: 420, config: { encrypted: true } },
    { id: 'worker', type: ComponentType.Ec2, x: 860, y: 420 },
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
    { id: 'users', type: ComponentType.Users, x: 80, y: 280 },
    { id: 'shield', type: ComponentType.Waf, x: 240, y: 280 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 400, y: 280 },
    { id: 'files', type: ComponentType.S3, x: 580, y: 100 },
    { id: 'ga', type: ComponentType.GlobalAccelerator, x: 580, y: 280 },
    { id: 'lb', type: ComponentType.Alb, x: 760, y: 280 },
    { id: 'web', type: ComponentType.Ec2, x: 940, y: 280, config: { size: 'medium', count: 2, az: 'spread' } },
    { id: 'db', type: ComponentType.Rds, x: 1140, y: 280, config: { size: 'medium', encrypted: true, multiAz: true } },
    { id: 'queue', type: ComponentType.Sqs, x: 940, y: 460, config: { encrypted: true } },
    { id: 'worker', type: ComponentType.Ec2, x: 1140, y: 460 },
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
    { id: 'users', type: ComponentType.Users, x: 80, y: 280 },
    { id: 'shield', type: ComponentType.Waf, x: 240, y: 280 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 400, y: 280 },
    { id: 'files', type: ComponentType.S3, x: 580, y: 100 },
    { id: 'ga', type: ComponentType.GlobalAccelerator, x: 580, y: 280 },
    { id: 'lb', type: ComponentType.Alb, x: 760, y: 280 },
    { id: 'web', type: ComponentType.Ec2, x: 940, y: 280, config: {
        size: 'medium',
        count: 2,
        az: 'spread',
        autoScaling: true,
        maxCount: 6,
      } },
    { id: 'db', type: ComponentType.Rds, x: 1140, y: 280, config: { size: 'large', encrypted: true, multiAz: true } },
    { id: 'queue', type: ComponentType.Sqs, x: 940, y: 460, config: { encrypted: true } },
    { id: 'worker', type: ComponentType.Ec2, x: 1140, y: 460, config: { size: 'medium' } },
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
      id: 'bank-az',
      scenario: {
        traffic: 400,
        mix: { read: 0.7, write: 0.3 },
        audience: { 'us-east-1': 1 },
        twist: Twist.AzOutage,
        latencyTarget: 200,
        budget: 150,
        requirements: RULES,
      },
      unlocks: [],
      lessons: [LessonSlug.HighAvailabilityMultiAz, LessonSlug.RelationalDatabases],
      solution: multiAz,
      naive: locked,
    },
    {
      id: 'bank-attack',
      scenario: {
        traffic: 400,
        mix: { read: 0.7, write: 0.3 },
        audience: { 'us-east-1': 1 },
        twist: Twist.Ddos,
        latencyTarget: 200,
        budget: 155,
        requirements: RULES,
      },
      unlocks: [],
      lessons: [LessonSlug.ThreatDetectionWafShield],
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
      lessons: [LessonSlug.DecouplingMessaging],
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
      lessons: [LessonSlug.EdgeNetworking, LessonSlug.S3Performance],
      solution: global,
      naive: statements,
    },
    {
      id: 'bank-payday',
      scenario: {
        traffic: 600,
        mix: { static: 0.35, read: 0.4, write: 0.15, job: 0.1 },
        audience: { 'us-east-1': 0.6, 'eu-west-1': 0.4 },
        twist: Twist.FlashSale,
        latencyTarget: 90,
        budget: 320,
        requirements: [...RULES, 'drainQueue'],
      },
      unlocks: [],
      lessons: [LessonSlug.AutoScaling, LessonSlug.RelationalDatabases],
      solution: payday,
      naive: global,
    },
  ],
};
