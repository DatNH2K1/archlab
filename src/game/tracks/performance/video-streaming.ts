import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';

const origin = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 300, 240],
    ['web', 'ec2', 500, 240, { size: 'large' }],
    ['files', 's3', 700, 100],
    ['db', 'rds', 700, 300, { size: 'medium' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'files'],
    ['web', 'db'],
  ],
);

const cdn = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 260, 240],
    ['files', 's3', 460, 100],
    ['lb', 'alb', 460, 300],
    ['web', 'ec2', 660, 300, { size: 'medium' }],
    ['db', 'rds', 860, 300, { size: 'medium' }],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const queued = (worker: Record<string, unknown>) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ['cdn', 'cloudfront', 260, 240],
      ['files', 's3', 460, 100],
      ['lb', 'alb', 460, 300],
      ['web', 'ec2', 660, 300, { size: 'medium' }],
      ['db', 'rds', 860, 300, { size: 'medium' }],
      ['queue', 'sqs', 660, 460],
      ['worker', 'ec2', 860, 460, worker],
    ],
    [
      ['users', 'cdn'],
      ['cdn', 'files'],
      ['cdn', 'lb'],
      ['lb', 'web'],
      ['web', 'db'],
      ['web', 'queue'],
      ['queue', 'worker'],
    ],
  );

const transcode = queued({ size: 'medium' });
const spot = queued({ size: 'large', pricing: 'spot' });

const catalog = (webs: Record<string, unknown>) => makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 260, 240, { cacheApi: true }],
    ['files', 's3', 460, 100],
    ['lb', 'alb', 460, 300],
    ['web', 'ec2', 660, 300, webs],
    ['cache', 'elasticache', 860, 160],
    ['db', 'rds', 860, 300, { size: 'medium' }],
    ['queue', 'sqs', 660, 460],
    ['worker', 'ec2', 860, 460, { size: 'large', pricing: 'spot' }],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
    ['web', 'queue'],
    ['queue', 'worker'],
  ],
);
const browse = catalog({ size: 'medium', count: 2 });

const twoRegions = (web: Record<string, unknown>, web2: Record<string, unknown>) =>
  makeBoard(
    [
      ['users', 'users', 80, 340],
      ['cdn', 'cloudfront', 240, 340, { cacheApi: true }],
      ['dns', 'route53', 400, 340],
      ['files', 's3', 600, 60],
      ['lb', 'alb', 600, 200],
      ['web', 'ec2', 800, 200, web],
      ['cache', 'elasticache', 1000, 100],
      // Aurora Global Database: one cluster with a managed copy in eu-west-1.
      ['db', 'aurora', 1000, 240, { size: 'small', globalDb: true }],
      ['queue', 'sqs', 800, 360],
      ['worker', 'ec2', 1000, 380, { size: 'large', pricing: 'spot' }],
      ['files2', 's3', 600, 500, { region: 'eu-west-1' }],
      ['lb2', 'alb', 600, 640, { region: 'eu-west-1' }],
      ['web2', 'ec2', 800, 640, { ...web2, region: 'eu-west-1' }],
    ],
    [
      ['users', 'cdn'],
      ['cdn', 'dns'],
      ['dns', 'files'],
      ['dns', 'lb'],
      ['dns', 'files2'],
      ['dns', 'lb2'],
      ['lb', 'web'],
      ['web', 'cache'],
      ['web', 'db'],
      ['web', 'queue'],
      ['queue', 'worker'],
      ['lb2', 'web2'],
      ['web2', 'db'],
    ],
  );
const failover = twoRegions({ size: 'medium', count: 2 }, { size: 'medium', count: 2 });
const sale = twoRegions({ size: 'medium', count: 2, autoScaling: true, maxCount: 5 }, { size: 'medium', count: 2, autoScaling: true, maxCount: 5 });

export const videoStreaming: Track = {
  id: 'video-streaming',
  difficulty: 'hard',
  rounds: [
    {
      id: 'vid-1-launch',
      scenario: { traffic: 2000, mix: { static: 0.85, read: 0.12, write: 0.03 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, latencyTarget: 110, budget: 115, requirements: [] },
      unlocks: [],
      lessons: ['edge-networking', 's3-performance'],
      solution: cdn,
      naive: origin,
    },
    {
      id: 'vid-2-transcode',
      scenario: { traffic: 2500, mix: { static: 0.8, read: 0.12, write: 0.03, job: 0.05 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, latencyTarget: 110, budget: 150, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['decoupling-messaging'],
      solution: transcode,
      naive: cdn,
    },
    {
      id: 'vid-3-spot',
      scenario: { traffic: 2500, mix: { static: 0.8, read: 0.12, write: 0.03, job: 0.05 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, twist: 'spotInterruption', latencyTarget: 110, budget: 135, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['ec2-pricing-models'],
      solution: spot,
      naive: queued({ size: 'medium', pricing: 'spot' }),
    },
    {
      id: 'vid-4-catalog',
      scenario: { traffic: 4000, mix: { static: 0.72, read: 0.2, write: 0.03, job: 0.05 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, latencyTarget: 100, budget: 200, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['nosql-caching', 'edge-networking'],
      solution: browse,
      naive: catalog({ size: 'large', count: 2 }),
    },
    {
      id: 'vid-5-region',
      scenario: { traffic: 4000, mix: { static: 0.72, read: 0.2, write: 0.03, job: 0.05 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, twist: 'regionOutage', outageRegion: 'us-east-1', latencyTarget: 120, budget: 330, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['disaster-recovery', 'route53-routing'],
      solution: failover,
      naive: browse,
    },
    {
      id: 'vid-6-sale',
      scenario: { traffic: 4000, mix: { static: 0.72, read: 0.2, write: 0.03, job: 0.05 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, twist: 'flashSale', latencyTarget: 120, budget: 440, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['auto-scaling'],
      solution: sale,
      naive: failover,
    },
  ],
};
