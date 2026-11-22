import { makeBoard } from '../board';
import type { Track } from '../rounds';

const serverless = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['api', 'apiGateway', 300, 240],
    ['fn', 'lambda', 520, 240],
    ['links', 'dynamodb', 740, 240],
  ],
  [
    ['users', 'api'],
    ['api', 'fn'],
    ['fn', 'links'],
  ],
);

const edge = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 260, 240, { cacheApi: true }],
    ['api', 'apiGateway', 460, 240],
    ['fn', 'lambda', 660, 240],
    ['links', 'dynamodb', 860, 240],
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
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 260, 240, { cacheApi: true }],
    ['ga', 'globalAccelerator', 440, 240],
    ['api', 'apiGateway', 620, 240],
    ['fn', 'lambda', 800, 240],
    ['links', 'dynamodb', 980, 240],
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
    ['users', 'users', 80, 240],
    ['shield', 'waf', 240, 240],
    ['cdn', 'cloudfront', 400, 240, { cacheApi: true }],
    ['ga', 'globalAccelerator', 560, 240],
    ['api', 'apiGateway', 720, 240],
    ['fn', 'lambda', 880, 240],
    ['links', 'dynamodb', 1060, 240],
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
      lessons: ['serverless-workflows', 'nosql-caching'],
      solution: serverless,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['web', 'ec2', 360, 240],
          ['db', 'rds', 640, 240],
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
      lessons: ['edge-networking', 'cost-compute-serverless-containers'],
      solution: edge,
      naive: serverless,
    },
    {
      id: 'short-global',
      scenario: { traffic: 1500, mix: { read: 0.97, write: 0.03 }, audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 }, latencyTarget: 100, budget: 160, requirements: [] },
      unlocks: [],
      lessons: ['edge-networking', 'route53-routing'],
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
      lessons: ['threat-detection-waf-shield'],
      solution: shielded,
      naive: accelerated,
    },
  ],
};
