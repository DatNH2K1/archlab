import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType } from '@/game/types';

const serverless = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'api', type: ComponentType.ApiGateway, x: 300, y: 240 },
    { id: 'fn', type: ComponentType.Lambda, x: 520, y: 240 },
    { id: 'links', type: ComponentType.DynamoDb, x: 740, y: 240 },
  ],
  [
    ['users', 'api'],
    ['api', 'fn'],
    ['fn', 'links'],
  ],
);

const edge = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 260, y: 240, config: { cacheApi: true } },
    { id: 'api', type: ComponentType.ApiGateway, x: 460, y: 240 },
    { id: 'fn', type: ComponentType.Lambda, x: 660, y: 240 },
    { id: 'links', type: ComponentType.DynamoDb, x: 860, y: 240 },
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'api'],
    ['api', 'fn'],
    ['fn', 'links'],
  ],
);

const accelerated = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 260, y: 240, config: { cacheApi: true } },
    { id: 'ga', type: ComponentType.GlobalAccelerator, x: 440, y: 240 },
    { id: 'api', type: ComponentType.ApiGateway, x: 620, y: 240 },
    { id: 'fn', type: ComponentType.Lambda, x: 800, y: 240 },
    { id: 'links', type: ComponentType.DynamoDb, x: 980, y: 240 },
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'ga'],
    ['ga', 'api'],
    ['api', 'fn'],
    ['fn', 'links'],
  ],
);

const shielded = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'shield', type: ComponentType.Waf, x: 240, y: 240 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 400, y: 240, config: { cacheApi: true } },
    { id: 'ga', type: ComponentType.GlobalAccelerator, x: 560, y: 240 },
    { id: 'api', type: ComponentType.ApiGateway, x: 720, y: 240 },
    { id: 'fn', type: ComponentType.Lambda, x: 880, y: 240 },
    { id: 'links', type: ComponentType.DynamoDb, x: 1060, y: 240 },
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'ga'],
    ['ga', 'api'],
    ['api', 'fn'],
    ['fn', 'links'],
  ],
);

export const urlShortener: Track = {
  id: 'url-shortener',
  difficulty: 'easy',
  rounds: [
    {
      id: 'short-mvp',
      scenario: { traffic: 30, mix: { read: 0.9, write: 0.1 }, audience: { 'us-east-1': 1 }, latencyTarget: 300, budget: 15, requirements: [] },
      unlocks: [],
      lessons: [LessonSlug.ServerlessWorkflows, LessonSlug.NoSqlCaching],
      solution: serverless,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 360, y: 240 },
          { id: 'db', type: ComponentType.Rds, x: 640, y: 240 },
        ],
        [
          ['users', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'short-viral',
      scenario: { traffic: 1200, mix: { read: 0.97, write: 0.03 }, audience: { 'us-east-1': 1 }, latencyTarget: 200, budget: 110, requirements: [] },
      unlocks: [],
      lessons: [LessonSlug.EdgeNetworking, LessonSlug.CostComputeServerlessContainers],
      solution: edge,
      naive: serverless,
    },
    {
      id: 'short-global',
      scenario: { traffic: 1500, mix: { read: 0.97, write: 0.03 }, audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 }, latencyTarget: 100, budget: 160, requirements: [] },
      unlocks: [],
      lessons: [LessonSlug.EdgeNetworking, LessonSlug.Route53Routing],
      solution: accelerated,
      naive: edge,
    },
    {
      id: 'short-spam',
      scenario: {
        traffic: 1500,
        mix: { read: 0.97, write: 0.03 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: 'ddos',
        latencyTarget: 120,
        budget: 160,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.ThreatDetectionWafShield],
      solution: shielded,
      naive: accelerated,
    },
  ],
};
