import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType } from '@/game/types';

const cdnOnly = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 280, y: 240 },
    { id: 'files', type: ComponentType.S3, x: 500, y: 240 },
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
  ],
);

const withApi = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 280, y: 240 },
    { id: 'files', type: ComponentType.S3, x: 500, y: 100 },
    { id: 'api', type: ComponentType.ApiGateway, x: 500, y: 320 },
    { id: 'fn', type: ComponentType.Lambda, x: 700, y: 320 },
    { id: 'table', type: ComponentType.DynamoDb, x: 900, y: 320 },
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'api'],
    ['api', 'fn'],
    ['fn', 'table'],
  ],
);

const cachedApi = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 280, y: 240, config: { cacheApi: true } },
    { id: 'files', type: ComponentType.S3, x: 500, y: 100 },
    { id: 'api', type: ComponentType.ApiGateway, x: 500, y: 320 },
    { id: 'fn', type: ComponentType.Lambda, x: 700, y: 320 },
    { id: 'table', type: ComponentType.DynamoDb, x: 900, y: 320 },
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'api'],
    ['api', 'fn'],
    ['fn', 'table'],
  ],
);

const shielded = (table: { encrypted?: boolean; provisioned?: boolean } = {}) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'shield', type: ComponentType.Waf, x: 260, y: 240 },
      { id: 'cdn', type: ComponentType.CloudFront, x: 440, y: 240, config: { cacheApi: true } },
      { id: 'files', type: ComponentType.S3, x: 660, y: 100 },
      { id: 'api', type: ComponentType.ApiGateway, x: 660, y: 320 },
      { id: 'fn', type: ComponentType.Lambda, x: 860, y: 320 },
      { id: 'table', type: ComponentType.DynamoDb, x: 1060, y: 320, config: table },
    ],
    [
      ['users', 'shield'],
      ['shield', 'cdn'],
      ['cdn', 'files'],
      ['cdn', 'api'],
      ['api', 'fn'],
      ['fn', 'table'],
    ],
  );

export const staticWebsite: Track = {
  id: 'static-website',
  difficulty: 'easy',
  rounds: [
    {
      id: 'site-1-launch',
      scenario: { traffic: 300, mix: { static: 1 }, audience: { 'us-east-1': 0.7, 'eu-west-1': 0.3 }, latencyTarget: 60, budget: 8, requirements: [] },
      unlocks: [],
      lessons: [LessonSlug.EdgeNetworking, LessonSlug.S3StorageClasses],
      solution: cdnOnly,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 320, y: 240 },
        ],
        [['users', 'web']],
      ),
    },
    {
      id: 'site-2-contact',
      scenario: {
        traffic: 400,
        mix: { static: 0.8, read: 0.15, write: 0.05 },
        audience: { 'us-east-1': 0.7, 'eu-west-1': 0.3 },
        latencyTarget: 80,
        budget: 24,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.ServerlessWorkflows, LessonSlug.NoSqlCaching],
      solution: withApi,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'cdn', type: ComponentType.CloudFront, x: 280, y: 240 },
          { id: 'files', type: ComponentType.S3, x: 500, y: 100 },
          { id: 'web', type: ComponentType.Ec2, x: 500, y: 320 },
          { id: 'db', type: ComponentType.Rds, x: 700, y: 320 },
        ],
        [
          ['users', 'cdn'],
          ['cdn', 'files'],
          ['cdn', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'site-3-global',
      scenario: {
        traffic: 800,
        mix: { static: 0.75, read: 0.2, write: 0.05 },
        audience: { 'us-east-1': 0.3, 'eu-west-1': 0.7 },
        latencyTarget: 55,
        budget: 36,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.EdgeNetworking],
      solution: cachedApi,
      naive: withApi,
    },
    {
      id: 'site-4-bots',
      scenario: {
        traffic: 800,
        mix: { static: 0.75, read: 0.2, write: 0.05 },
        audience: { 'us-east-1': 0.3, 'eu-west-1': 0.7 },
        twist: 'ddos',
        latencyTarget: 60,
        budget: 45,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.ThreatDetectionWafShield],
      solution: shielded(),
      naive: cachedApi,
    },
    {
      id: 'site-5-encrypt',
      scenario: {
        traffic: 1000,
        mix: { static: 0.75, read: 0.2, write: 0.05 },
        audience: { 'us-east-1': 0.3, 'eu-west-1': 0.7 },
        latencyTarget: 60,
        budget: 45,
        requirements: ['encryptData', 'privateData'],
      },
      unlocks: [],
      lessons: [LessonSlug.DataEncryptionKms],
      solution: shielded({ encrypted: true }),
      naive: shielded(),
    },
    {
      id: 'site-6-squeeze',
      scenario: {
        traffic: 1600,
        mix: { static: 0.7, read: 0.22, write: 0.08 },
        audience: { 'us-east-1': 0.3, 'eu-west-1': 0.7 },
        latencyTarget: 65,
        budget: 68,
        requirements: ['encryptData', 'privateData'],
      },
      unlocks: [],
      lessons: [LessonSlug.CostDatabaseStorageChoices, LessonSlug.NoSqlCaching],
      solution: shielded({ encrypted: true, provisioned: true }),
      naive: shielded({ encrypted: true }),
    },
  ],
};
