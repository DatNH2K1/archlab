import { makeBoard } from '../board';
import type { Track } from '../rounds';

const cdnOnly = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 280, 240],
    ['files', 's3', 500, 240],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
  ],
);

const withApi = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 280, 240],
    ['files', 's3', 500, 100],
    ['api', 'apiGateway', 500, 320],
    ['fn', 'lambda', 700, 320],
    ['table', 'dynamodb', 900, 320],
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
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 280, 240, { cacheApi: true }],
    ['files', 's3', 500, 100],
    ['api', 'apiGateway', 500, 320],
    ['fn', 'lambda', 700, 320],
    ['table', 'dynamodb', 900, 320],
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
      ['users', 'users', 80, 240],
      ['shield', 'waf', 260, 240],
      ['cdn', 'cloudfront', 440, 240, { cacheApi: true }],
      ['files', 's3', 660, 100],
      ['api', 'apiGateway', 660, 320],
      ['fn', 'lambda', 860, 320],
      ['table', 'dynamodb', 1060, 320, table],
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
      lessons: ['edge-networking', 's3-storage-classes'],
      solution: cdnOnly,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['web', 'ec2', 320, 240],
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
      lessons: ['serverless-workflows', 'nosql-caching'],
      solution: withApi,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['cdn', 'cloudfront', 280, 240],
          ['files', 's3', 500, 100],
          ['web', 'ec2', 500, 320],
          ['db', 'rds', 700, 320],
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
      lessons: ['edge-networking'],
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
      lessons: ['threat-detection-waf-shield'],
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
      lessons: ['data-encryption-kms'],
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
      lessons: ['cost-database-storage-choices', 'nosql-caching'],
      solution: shielded({ encrypted: true, provisioned: true }),
      naive: shielded({ encrypted: true }),
    },
  ],
};
