import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';

const origin = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 300, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 500, y: 240, config: { size: 'large' } },
    { id: 'files', type: ComponentType.S3, x: 700, y: 100 },
    { id: 'db', type: ComponentType.Rds, x: 700, y: 300, config: { size: 'medium' } },
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
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 260, y: 240 },
    { id: 'files', type: ComponentType.S3, x: 460, y: 100 },
    { id: 'lb', type: ComponentType.Alb, x: 460, y: 300 },
    { id: 'web', type: ComponentType.Ec2, x: 660, y: 300, config: { size: 'medium' } },
    { id: 'db', type: ComponentType.Rds, x: 860, y: 300, config: { size: 'medium' } },
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
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'cdn', type: ComponentType.CloudFront, x: 260, y: 240 },
      { id: 'files', type: ComponentType.S3, x: 460, y: 100 },
      { id: 'lb', type: ComponentType.Alb, x: 460, y: 300 },
      { id: 'web', type: ComponentType.Ec2, x: 660, y: 300, config: { size: 'medium' } },
      { id: 'db', type: ComponentType.Rds, x: 860, y: 300, config: { size: 'medium' } },
      { id: 'queue', type: ComponentType.Sqs, x: 660, y: 460 },
      { id: 'worker', type: ComponentType.Ec2, x: 860, y: 460, config: worker },
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
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 260, y: 240, config: { cacheApi: true } },
    { id: 'files', type: ComponentType.S3, x: 460, y: 100 },
    { id: 'lb', type: ComponentType.Alb, x: 460, y: 300 },
    { id: 'web', type: ComponentType.Ec2, x: 660, y: 300, config: webs },
    { id: 'cache', type: ComponentType.ElastiCache, x: 860, y: 160 },
    { id: 'db', type: ComponentType.Rds, x: 860, y: 300, config: { size: 'medium' } },
    { id: 'queue', type: ComponentType.Sqs, x: 660, y: 460 },
    { id: 'worker', type: ComponentType.Ec2, x: 860, y: 460, config: { size: 'large', pricing: 'spot' } },
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
      { id: 'users', type: ComponentType.Users, x: 80, y: 340 },
      { id: 'cdn', type: ComponentType.CloudFront, x: 240, y: 340, config: { cacheApi: true } },
      { id: 'dns', type: ComponentType.Route53, x: 400, y: 340 },
      { id: 'files', type: ComponentType.S3, x: 600, y: 60 },
      { id: 'lb', type: ComponentType.Alb, x: 600, y: 200 },
      { id: 'web', type: ComponentType.Ec2, x: 800, y: 200, config: web },
      { id: 'cache', type: ComponentType.ElastiCache, x: 1000, y: 100 },
      // Aurora Global Database: one cluster with a managed copy in eu-west-1.
      { id: 'db', type: ComponentType.Aurora, x: 1000, y: 240, config: { size: 'small', globalDb: true } },
      { id: 'queue', type: ComponentType.Sqs, x: 800, y: 360 },
      { id: 'worker', type: ComponentType.Ec2, x: 1000, y: 380, config: { size: 'large', pricing: 'spot' } },
      { id: 'files2', type: ComponentType.S3, x: 600, y: 500, config: { region: 'eu-west-1' } },
      { id: 'lb2', type: ComponentType.Alb, x: 600, y: 640, config: { region: 'eu-west-1' } },
      { id: 'web2', type: ComponentType.Ec2, x: 800, y: 640, config: { ...web2, region: 'eu-west-1' } },
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
      lessons: [LessonSlug.EdgeNetworking, LessonSlug.S3Performance],
      solution: cdn,
      naive: origin,
    },
    {
      id: 'vid-2-transcode',
      scenario: { traffic: 2500, mix: { static: 0.8, read: 0.12, write: 0.03, job: 0.05 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, latencyTarget: 110, budget: 150, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: [LessonSlug.DecouplingMessaging],
      solution: transcode,
      naive: cdn,
    },
    {
      id: 'vid-3-spot',
      scenario: { traffic: 2500, mix: { static: 0.8, read: 0.12, write: 0.03, job: 0.05 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, twist: Twist.SpotInterruption, latencyTarget: 110, budget: 135, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: [LessonSlug.Ec2PricingModels],
      solution: spot,
      naive: queued({ size: 'medium', pricing: 'spot' }),
    },
    {
      id: 'vid-4-catalog',
      scenario: { traffic: 4000, mix: { static: 0.72, read: 0.2, write: 0.03, job: 0.05 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, latencyTarget: 100, budget: 200, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: [LessonSlug.NoSqlCaching, LessonSlug.EdgeNetworking],
      solution: browse,
      naive: catalog({ size: 'large', count: 2 }),
    },
    {
      id: 'vid-5-region',
      scenario: { traffic: 4000, mix: { static: 0.72, read: 0.2, write: 0.03, job: 0.05 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, twist: Twist.RegionOutage, latencyTarget: 120, budget: 330, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: [LessonSlug.DisasterRecovery, LessonSlug.Route53Routing],
      solution: failover,
      naive: browse,
    },
    {
      id: 'vid-6-sale',
      scenario: { traffic: 4000, mix: { static: 0.72, read: 0.2, write: 0.03, job: 0.05 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, twist: Twist.FlashSale, latencyTarget: 120, budget: 440, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: [LessonSlug.AutoScaling],
      solution: sale,
      naive: failover,
    },
  ],
};
