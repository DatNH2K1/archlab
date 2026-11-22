import { makeBoard } from '../board';
import type { Track } from '../rounds';

const cached = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['game', 'ec2', 480, 240, { size: 'large', count: 3, az: 'spread' }],
    ['board', 'elasticache', 700, 140],
    ['scores', 'dynamodb', 700, 320, { provisioned: true, size: 'medium' }],
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
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 260, 240, { cacheApi: true }],
    ['ga', 'globalAccelerator', 440, 240],
    ['lb', 'alb', 620, 240],
    ['game', 'ec2', 800, 240, { size: 'large', count: 2, az: 'spread' }],
    ['board', 'elasticache', 1020, 140],
    ['scores', 'dynamodb', 1020, 320, { provisioned: true, size: 'medium' }],
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
    ['users', 'users', 80, 240],
    ['shield', 'waf', 240, 240],
    ['cdn', 'cloudfront', 400, 240, { cacheApi: true }],
    ['ga', 'globalAccelerator', 560, 240],
    ['lb', 'alb', 720, 240],
    ['game', 'ec2', 900, 240, { size: 'large', count: 2, az: 'spread' }],
    ['board', 'elasticache', 1120, 140],
    ['scores', 'dynamodb', 1120, 320, { provisioned: true, size: 'medium' }],
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
    ['users', 'users', 80, 240],
    ['shield', 'waf', 240, 240],
    ['cdn', 'cloudfront', 400, 240, { cacheApi: true }],
    ['ga', 'globalAccelerator', 560, 240],
    ['lb', 'alb', 720, 240],
    ['game', 'ec2', 900, 240, { size: 'large', count: 3, az: 'spread' }],
    ['board', 'elasticache', 1120, 140, { multiAz: true }],
    ['scores', 'dynamodb', 1120, 320, { provisioned: true, size: 'medium' }],
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
    ['users', 'users', 80, 300],
    ['shield', 'waf', 220, 300],
    ['cdn', 'cloudfront', 360, 300, { cacheApi: true }],
    ['ga', 'globalAccelerator', 500, 300],
    ['dns', 'route53', 640, 300],
    ['lb1', 'alb', 800, 140],
    ['game1', 'ec2', 980, 140, { size: 'large', count: 2, az: 'spread' }],
    ['board1', 'elasticache', 1180, 60, { multiAz: true }],
    // DynamoDB global table: one table with a copy in each Region, both taking writes.
    ['scores', 'dynamodb', 1180, 300, { provisioned: true, size: 'medium', globalDb: true }],
    ['lb2', 'alb', 800, 460, { region: 'eu-west-1' }],
    ['game2', 'ec2', 980, 460, { size: 'large', count: 2, az: 'spread', region: 'eu-west-1' }],
    ['board2', 'elasticache', 1180, 380, { multiAz: true, region: 'eu-west-1' }],
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
    ['users', 'users', 80, 300],
    ['shield', 'waf', 220, 300],
    ['cdn', 'cloudfront', 360, 300, { cacheApi: true }],
    ['ga', 'globalAccelerator', 500, 300],
    ['dns', 'route53', 640, 300],
    ['lb1', 'alb', 800, 140],
    ['game1', 'ec2', 980, 140, { size: 'large', count: 2, az: 'spread', autoScaling: true, maxCount: 5 }],
    ['board1', 'elasticache', 1180, 60, { multiAz: true }],
    // DynamoDB global table: one table with a copy in each Region, both taking writes.
    ['scores', 'dynamodb', 1180, 300, { provisioned: true, size: 'medium', globalDb: true }],
    ['lb2', 'alb', 800, 460, { region: 'eu-west-1' }],
    [
      'game2',
      'ec2',
      980,
      460,
      {
        size: 'large',
        count: 2,
        az: 'spread',
        region: 'eu-west-1',
        autoScaling: true,
        maxCount: 6,
      },
    ],
    ['board2', 'elasticache', 1180, 380, { multiAz: true, region: 'eu-west-1' }],
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
      lessons: ['nosql-caching', 'cost-database-storage-choices'],
      solution: cached,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['game', 'ec2', 480, 240, { size: 'large', count: 3, az: 'spread' }],
          ['scores', 'dynamodb', 700, 240],
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
      lessons: ['edge-networking'],
      solution: global,
      naive: cached,
    },
    {
      id: 'lb-ddos',
      scenario: {
        traffic: 2500,
        mix: { read: 0.92, write: 0.08 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: 'ddos',
        latencyTarget: 80,
        budget: 260,
        requirements: [],
      },
      unlocks: [],
      lessons: ['threat-detection-waf-shield'],
      solution: shielded,
      naive: global,
    },
    {
      id: 'lb-cachecrash',
      scenario: {
        traffic: 3600,
        mix: { read: 0.92, write: 0.08 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: 'cacheCrash',
        latencyTarget: 80,
        budget: 340,
        requirements: [],
      },
      unlocks: [],
      lessons: ['nosql-caching', 'high-availability-multi-az'],
      solution: replicated,
      naive: shielded,
    },
    {
      id: 'lb-region',
      scenario: {
        traffic: 3600,
        mix: { read: 0.92, write: 0.08 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: 'regionOutage',
        outageRegion: 'us-east-1',
        latencyTarget: 85,
        budget: 480,
        requirements: [],
      },
      unlocks: [],
      lessons: ['disaster-recovery', 'route53-routing', 'backup-replication'],
      solution: twoRegions,
      naive: replicated,
    },
    {
      id: 'lb-finals',
      scenario: {
        traffic: 3600,
        mix: { read: 0.92, write: 0.08 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: 'flashSale',
        latencyTarget: 85,
        budget: 650,
        requirements: [],
      },
      unlocks: [],
      lessons: ['auto-scaling'],
      solution: finals,
      naive: twoRegions,
    },
  ],
};
