export const COMPONENT_TYPES = [
  'users',
  'route53',
  'globalAccelerator',
  'waf',
  'cloudfront',
  'alb',
  'apiGateway',
  'ec2',
  'lambda',
  'elasticache',
  'rds',
  'aurora',
  'readReplica',
  'dynamodb',
  's3',
  'sqs',
  'sns',
] as const;

export type ComponentType = (typeof COMPONENT_TYPES)[number];

export type Size = 'small' | 'medium' | 'large' | 'xlarge';

/** Where the instances of a zonal component live. */
export type Az = 'a' | 'b' | 'spread';

/** AWS Regions on the board. They are peers: none is primary by nature. */
export const REGIONS = ['us-east-1', 'eu-west-1'] as const;

export type Region = (typeof REGIONS)[number];

export type Pricing = 'onDemand' | 'reserved' | 'spot';

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
};

export type BoardNode = {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  config: NodeConfig;
};

export type BoardEdge = { id: string; from: string; to: string };

export type Board = { nodes: BoardNode[]; edges: BoardEdge[] };

export type TrafficClass = 'read' | 'write' | 'static' | 'job';

export type RequestClass = TrafficClass | 'attack';

export const TWISTS = [
  'azOutage',
  'regionOutage',
  'spotInterruption',
  'flashSale',
  'ddos',
  'cacheCrash',
  'viral',
] as const;

export type TwistId = (typeof TWISTS)[number];

export const REQUIREMENTS = [
  'encryptData',
  'privateData',
  'noPublicServers',
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
  twist?: TwistId;
  /** Region taken down by the `regionOutage` twist. */
  outageRegion?: Region;
  /** Highest allowed average response time in ms. */
  latencyTarget: number;
  /** Highest allowed monthly cost in $. No budget in the sandbox. */
  budget?: number;
  requirements: RequirementId[];
};

export const ISSUE_CODES = [
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
  'stale_data',
  'queue_no_consumer',
  'down',
  'overloaded',
  'unencrypted',
  'public_data',
  'public_server',
  'no_fan_out',
  'backlog',
  'slow',
  'cold_start',
  'over_budget',
] as const;

export type IssueCode = (typeof ISSUE_CODES)[number];

export type Issue = { code: IssueCode; nodeId?: string; count: number };

/** Replication role of a database: the writable primary, a read-only copy, or an old primary cut off by failover. */
export type DbRole = 'primary' | 'replica' | 'stale';

export type NodeTick = {
  util: number;
  alive: boolean;
  instances?: number;
  backlog?: number;
  /** Database role, set only once failover changed it. */
  dbRole?: DbRole;
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
};
