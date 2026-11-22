import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';

const cached = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
    { id: 'game', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'large', count: 3, az: 'spread' } },
    { id: 'board', type: ComponentType.ElastiCache, x: 700, y: 140 },
    { id: 'scores', type: ComponentType.DynamoDb, x: 700, y: 320, config: { provisioned: true, size: 'medium' } },
  ],
  [
    ['users', 'lb'],
    ['lb', 'game'],
    ['game', 'board'],
    ['game', 'scores'],
  ],
);

const global = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 260, y: 240, config: { cacheApi: true } },
    { id: 'ga', type: ComponentType.GlobalAccelerator, x: 440, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 620, y: 240 },
    { id: 'game', type: ComponentType.Ec2, x: 800, y: 240, config: { size: 'large', count: 2, az: 'spread' } },
    { id: 'board', type: ComponentType.ElastiCache, x: 1020, y: 140 },
    { id: 'scores', type: ComponentType.DynamoDb, x: 1020, y: 320, config: { provisioned: true, size: 'medium' } },
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'ga'],
    ['ga', 'lb'],
    ['lb', 'game'],
    ['game', 'board'],
    ['game', 'scores'],
  ],
);

const shielded = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'shield', type: ComponentType.Waf, x: 240, y: 240 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 400, y: 240, config: { cacheApi: true } },
    { id: 'ga', type: ComponentType.GlobalAccelerator, x: 560, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 720, y: 240 },
    { id: 'game', type: ComponentType.Ec2, x: 900, y: 240, config: { size: 'large', count: 2, az: 'spread' } },
    { id: 'board', type: ComponentType.ElastiCache, x: 1120, y: 140 },
    { id: 'scores', type: ComponentType.DynamoDb, x: 1120, y: 320, config: { provisioned: true, size: 'medium' } },
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'ga'],
    ['ga', 'lb'],
    ['lb', 'game'],
    ['game', 'board'],
    ['game', 'scores'],
  ],
);

const replicated = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'shield', type: ComponentType.Waf, x: 240, y: 240 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 400, y: 240, config: { cacheApi: true } },
    { id: 'ga', type: ComponentType.GlobalAccelerator, x: 560, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 720, y: 240 },
    { id: 'game', type: ComponentType.Ec2, x: 900, y: 240, config: { size: 'large', count: 3, az: 'spread' } },
    { id: 'board', type: ComponentType.ElastiCache, x: 1120, y: 140, config: { multiAz: true } },
    { id: 'scores', type: ComponentType.DynamoDb, x: 1120, y: 320, config: { provisioned: true, size: 'medium' } },
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'ga'],
    ['ga', 'lb'],
    ['lb', 'game'],
    ['game', 'board'],
    ['game', 'scores'],
  ],
);

const twoRegions = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 300 },
    { id: 'shield', type: ComponentType.Waf, x: 220, y: 300 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 360, y: 300, config: { cacheApi: true } },
    { id: 'ga', type: ComponentType.GlobalAccelerator, x: 500, y: 300 },
    { id: 'dns', type: ComponentType.Route53, x: 640, y: 300 },
    { id: 'lb1', type: ComponentType.Alb, x: 800, y: 140 },
    { id: 'game1', type: ComponentType.Ec2, x: 980, y: 140, config: { size: 'large', count: 2, az: 'spread' } },
    { id: 'board1', type: ComponentType.ElastiCache, x: 1180, y: 60, config: { multiAz: true } },
    // DynamoDB global table: one table with a copy in each Region, both taking writes.
    { id: 'scores', type: ComponentType.DynamoDb, x: 1180, y: 300, config: { provisioned: true, size: 'medium', globalDb: true } },
    { id: 'lb2', type: ComponentType.Alb, x: 800, y: 460, config: { region: 'eu-west-1' } },
    { id: 'game2', type: ComponentType.Ec2, x: 980, y: 460, config: { size: 'large', count: 2, az: 'spread', region: 'eu-west-1' } },
    { id: 'board2', type: ComponentType.ElastiCache, x: 1180, y: 380, config: { multiAz: true, region: 'eu-west-1' } },
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'ga'],
    ['ga', 'dns'],
    ['dns', 'lb1'],
    ['dns', 'lb2'],
    ['lb1', 'game1'],
    ['game1', 'board1'],
    ['game1', 'scores'],
    ['lb2', 'game2'],
    ['game2', 'board2'],
    ['game2', 'scores'],
  ],
);

const finals = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 300 },
    { id: 'shield', type: ComponentType.Waf, x: 220, y: 300 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 360, y: 300, config: { cacheApi: true } },
    { id: 'ga', type: ComponentType.GlobalAccelerator, x: 500, y: 300 },
    { id: 'dns', type: ComponentType.Route53, x: 640, y: 300 },
    { id: 'lb1', type: ComponentType.Alb, x: 800, y: 140 },
    { id: 'game1', type: ComponentType.Ec2, x: 980, y: 140, config: { size: 'large', count: 2, az: 'spread', autoScaling: true, maxCount: 5 } },
    { id: 'board1', type: ComponentType.ElastiCache, x: 1180, y: 60, config: { multiAz: true } },
    // DynamoDB global table: one table with a copy in each Region, both taking writes.
    { id: 'scores', type: ComponentType.DynamoDb, x: 1180, y: 300, config: { provisioned: true, size: 'medium', globalDb: true } },
    { id: 'lb2', type: ComponentType.Alb, x: 800, y: 460, config: { region: 'eu-west-1' } },
    { id: 'game2', type: ComponentType.Ec2, x: 980, y: 460, config: {
        size: 'large',
        count: 2,
        az: 'spread',
        region: 'eu-west-1',
        autoScaling: true,
        maxCount: 6,
      } },
    { id: 'board2', type: ComponentType.ElastiCache, x: 1180, y: 380, config: { multiAz: true, region: 'eu-west-1' } },
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'ga'],
    ['ga', 'dns'],
    ['dns', 'lb1'],
    ['dns', 'lb2'],
    ['lb1', 'game1'],
    ['game1', 'board1'],
    ['game1', 'scores'],
    ['lb2', 'game2'],
    ['game2', 'board2'],
    ['game2', 'scores'],
  ],
);

export const gameLeaderboard: Track = {
  id: 'game-leaderboard',
  difficulty: 'hard',
  rounds: [
    {
      id: 'lb-hot',
      scenario: {
        traffic: 2500,
        mix: { read: 0.92, write: 0.08 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 150,
        budget: 260,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.NoSqlCaching, LessonSlug.CostDatabaseStorageChoices],
      solution: cached,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
          { id: 'game', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'large', count: 3, az: 'spread' } },
          { id: 'scores', type: ComponentType.DynamoDb, x: 700, y: 240 },
        ],
        [
          ['users', 'lb'],
          ['lb', 'game'],
          ['game', 'scores'],
        ],
      ),
    },
    {
      id: 'lb-global',
      scenario: {
        traffic: 2500,
        mix: { read: 0.92, write: 0.08 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        latencyTarget: 80,
        budget: 260,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.EdgeNetworking],
      solution: global,
      naive: cached,
    },
    {
      id: 'lb-ddos',
      scenario: {
        traffic: 2500,
        mix: { read: 0.92, write: 0.08 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: Twist.Ddos,
        latencyTarget: 80,
        budget: 260,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.ThreatDetectionWafShield],
      solution: shielded,
      naive: global,
    },
    {
      id: 'lb-cachecrash',
      scenario: {
        traffic: 3600,
        mix: { read: 0.92, write: 0.08 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: Twist.CacheCrash,
        latencyTarget: 80,
        budget: 340,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.NoSqlCaching, LessonSlug.HighAvailabilityMultiAz],
      solution: replicated,
      naive: shielded,
    },
    {
      id: 'lb-region',
      scenario: {
        traffic: 3600,
        mix: { read: 0.92, write: 0.08 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: Twist.RegionOutage,
        latencyTarget: 85,
        budget: 480,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.DisasterRecovery, LessonSlug.Route53Routing, LessonSlug.BackupReplication],
      solution: twoRegions,
      naive: replicated,
    },
    {
      id: 'lb-finals',
      scenario: {
        traffic: 3600,
        mix: { read: 0.92, write: 0.08 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: Twist.FlashSale,
        latencyTarget: 85,
        budget: 650,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.AutoScaling],
      solution: finals,
      naive: twoRegions,
    },
  ],
};
