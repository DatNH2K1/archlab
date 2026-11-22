/**
 * Components a player can place on the board. Values are the ids used in saved boards and in the `Components` messages.
 */
export const ComponentType = {
  Users: 'users',
  Route53: 'route53',
  GlobalAccelerator: 'globalAccelerator',
  Waf: 'waf',
  CloudFront: 'cloudfront',
  Alb: 'alb',
  ApiGateway: 'apiGateway',
  Ec2: 'ec2',
  Lambda: 'lambda',
  ElastiCache: 'elasticache',
  Rds: 'rds',
  Aurora: 'aurora',
  ReadReplica: 'readReplica',
  DynamoDb: 'dynamodb',
  S3: 's3',
  Sqs: 'sqs',
  Sns: 'sns',
} as const;

export type ComponentType = (typeof ComponentType)[keyof typeof ComponentType];

export type Size = 'small' | 'medium' | 'large' | 'xlarge';

/** Where the instances of a zonal component live. */
type Az = 'a' | 'b' | 'spread';

/** AWS Regions on the board. They are peers: none is primary by nature. */
export const REGIONS = ['us-east-1', 'eu-west-1'] as const;

export type Region = (typeof REGIONS)[number];

type Pricing = 'onDemand' | 'reserved' | 'spot';

export type NodeConfig = {
  size: Size;
  count: number;
  az: Az;
  region: Region;
  pricing: Pricing;
  autoScaling: boolean;
  maxCount: number;
  multiAz: boolean;
  encrypted: boolean;
  /** Lambda provisioned concurrency, or DynamoDB provisioned capacity mode. */
  provisioned: boolean;
  /** CloudFront also caches API reads. */
  cacheApi: boolean;
  /** Aurora Global Database or a DynamoDB global table: a managed copy in the other Region. */
  globalDb: boolean;
};

export type BoardNode = {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  config: NodeConfig;
};

type BoardEdge = { id: string; from: string; to: string };

export type Board = { nodes: BoardNode[]; edges: BoardEdge[] };

export type TrafficClass = 'read' | 'write' | 'static' | 'job';

export type RequestClass = TrafficClass | 'attack';

/**
 * Incidents that can hit a round mid-run. Values are the keys of their texts in `Twists`.
 */
export const Twist = {
  AzOutage: 'azOutage',
  RegionOutage: 'regionOutage',
  SpotInterruption: 'spotInterruption',
  FlashSale: 'flashSale',
  Ddos: 'ddos',
  CacheCrash: 'cacheCrash',
  Viral: 'viral',
} as const;

export type Twist = (typeof Twist)[keyof typeof Twist];

export const REQUIREMENTS = [
  'encryptData',
  'privateData',
  'noPublicServers',
  'privateBucket',
  'webFirewall',
  'fanOut',
  'drainQueue',
] as const;

export type RequirementId = (typeof REQUIREMENTS)[number];

export type Scenario = {
  /** Average requests per second sent by users. */
  traffic: number;
  /** Share of each kind of request, summing to 1. */
  mix: Partial<Record<TrafficClass, number>>;
  /** Share of users closest to each Region, summing to 1. */
  audience: Partial<Record<Region, number>>;
  twist?: Twist;
  /** Highest allowed average response time in ms. */
  latencyTarget: number;
  /** Highest allowed monthly cost in $. No budget in the sandbox. */
  budget?: number;
  requirements: RequirementId[];
};

const ISSUE_CODES = [
  'users_unconnected',
  'loop',
  'nowhere_read',
  'nowhere_write',
  'nowhere_static',
  'nowhere_job',
  'alb_target',
  'no_balancer',
  'replica_write',
  'data_split',
  'db_region_down',
  'queue_no_consumer',
  'down',
  'overloaded',
  'unencrypted',
  'public_data',
  'public_server',
  'public_bucket',
  'no_firewall',
  'no_fan_out',
  'backlog',
  'slow',
  'cold_start',
  'over_budget',
] as const;

export type IssueCode = (typeof ISSUE_CODES)[number];

export type Issue = { code: IssueCode; nodeId?: string; count: number };

export type NodeTick = {
  util: number;
  /** Work units per second on the node; a database write or a background job costs more than a read. */
  load: number;
  /** Work units per second the node can take; absent when it has no limit. */
  capacity?: number;
  alive: boolean;
  instances?: number;
  backlog?: number;
  /** Region an Aurora Global Database writes in, set only once failover moved it. */
  primaryRegion?: Region;
};

export type TickSample = {
  t: number;
  traffic: number;
  answered: number;
  latency: number;
  twistActive: boolean;
  nodes: Record<string, NodeTick>;
};

export type SimResult = {
  ticks: TickSample[];
  answered: number;
  avgLatency: number;
  cost: number;
  costByNode: Record<string, number>;
  issues: Issue[];
  checks: {
    answered: boolean;
    latency: boolean;
    cost: boolean;
    /** Every write lands in one dataset. */
    integrity: boolean;
    requirements: { id: RequirementId; ok: boolean }[];
  };
  passed: boolean;
  /** Region taken down by the `regionOutage` twist. */
  outageRegion?: Region;
};
