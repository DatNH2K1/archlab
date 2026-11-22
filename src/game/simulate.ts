import {
  BACKUP_FACTOR,
  BALANCER_TYPES,
  CAPACITY,
  CATALOG,
  COMPUTE_TYPES,
  DATA_STORE_TYPES,
  DATABASE_TYPES,
  FIXED_CAPACITY,
  FLAT_PRICE,
  HEALTH_AWARE_TYPES,
  POLLED_TYPES,
  PRICING_FACTOR,
  PROVISIONED_CONCURRENCY_PRICE,
  QUEUE_TYPES,
  RELATIONAL_TYPES,
  REQUEST_PRICE,
  SERVER_TYPES,
  SIZE_PRICE,
} from './catalog';
import { ComponentType, REGIONS, Twist } from './types';
import type {
  Board,
  BoardNode,
  Issue,
  IssueCode,
  NodeTick,
  Region,
  RequestClass,
  RequirementId,
  Scenario,
  SimResult,
  TickSample,
  TrafficClass,
} from './types';

/** Parents that put a server straight on the internet. */
const PUBLIC_SERVER_PARENTS = new Set<ComponentType>([
  ComponentType.Users,
  ComponentType.Route53,
  ComponentType.GlobalAccelerator,
]);

/** Parents that let users read a bucket without CloudFront. */
const PUBLIC_BUCKET_PARENTS = new Set<ComponentType>([ComponentType.Users, ComponentType.Route53]);

/** Entry points with fixed IP addresses that partners can allow-list. */
const STATIC_IP_TYPES = new Set<ComponentType>([ComponentType.GlobalAccelerator, ComponentType.Nlb]);

/** Components a server may sit behind in a private subnet and still reach a database. */
const PRIVATE_DATA_PARENTS = new Set<ComponentType>([
  ...COMPUTE_TYPES,
  ...DATA_STORE_TYPES,
  ComponentType.RdsProxy,
  ComponentType.VpcEndpoint,
]);

/** Components that hold user data at rest, for data residency. */
const RESIDENT_TYPES = new Set<ComponentType>([...DATA_STORE_TYPES, ComponentType.Sqs, ComponentType.Kinesis]);

export const TICKS = 60;

const BASE_LATENCY = 20;
const FAR_PENALTY = 150;
const CROSS_REGION = 70;
const INLINE_JOB = 400;
const INLINE_BATCH = 2000;
/** Work units a relational database spends per request when each Lambda opens its own connection. */
const CONNECTION_STORM = 3;
/** Traffic share outside business hours in the `dailyCycle` twist. */
const NIGHT_SHARE = 0.3;
const COLD_START = 300;
const CACHE_HIT = 0.85;
const EDGE_STATIC_HIT = 0.95;
const EDGE_API_HIT = 0.5;
const WAF_BLOCK = 0.98;
const SECONDS_PER_MONTH_FACTOR = 1 / 100;

/** Share of the round each twist is active, as [start, end). */
const TWIST_WINDOW: Record<Twist, [number, number]> = {
  [Twist.AzOutage]: [0.35, 0.75],
  [Twist.RegionOutage]: [0.4, 0.8],
  [Twist.SpotInterruption]: [0.3, 0.6],
  [Twist.FlashSale]: [0.4, 0.7],
  [Twist.Ddos]: [0.3, 0.7],
  [Twist.CacheCrash]: [0.4, 0.65],
  [Twist.Viral]: [0, 1],
  [Twist.DataLoss]: [0.45, 0.7],
  [Twist.DailyCycle]: [0.3, 0.75],
};

type Flow = {
  cls: RequestClass;
  rate: number;
  /** Region closest to the users who sent the flow; null for work drained from a queue. */
  origin: Region | null;
  /** Multiplier on the far-user penalty, lowered by the AWS backbone. */
  reach: number;
  region: Region | null;
  fromQueue: boolean;
};

type Outcome = { ok: number; fail: number; lat: number; miss: number };

const EMPTY: Outcome = { ok: 0, fail: 0, lat: 0, miss: 0 };

const sum = (a: Outcome, b: Outcome): Outcome => ({
  ok: a.ok + b.ok,
  fail: a.fail + b.fail,
  lat: a.lat + b.lat,
  miss: a.miss + b.miss,
});

/** Lower ranks are shown to the player first. */
const ISSUE_RANK: Record<IssueCode, number> = {
  users_unconnected: 0,
  loop: 0,
  nowhere_read: 1,
  nowhere_write: 1,
  nowhere_static: 1,
  nowhere_job: 1,
  nowhere_tcp: 1,
  nowhere_batch: 1,
  lambda_timeout: 1,
  replica_write: 1,
  data_split: 1,
  db_region_down: 2,
  queue_no_consumer: 1,
  alb_target: 2,
  no_balancer: 2,
  down: 2,
  overloaded: 2,
  connection_storm: 2,
  data_lost: 2,
  backlog: 3,
  unencrypted: 4,
  public_data: 4,
  public_server: 4,
  public_bucket: 4,
  no_firewall: 4,
  no_fan_out: 4,
  data_outside_region: 4,
  no_static_ip: 4,
  no_inspection: 4,
  no_auth: 4,
  no_secret: 4,
  direct_egress: 4,
  no_replay: 4,
  server_managed: 4,
  cold_start: 5,
  slow: 6,
  over_budget: 7,
};

const NOWHERE: Record<RequestClass, IssueCode | null> = {
  read: 'nowhere_read',
  write: 'nowhere_write',
  static: 'nowhere_static',
  job: 'nowhere_job',
  tcp: 'nowhere_tcp',
  batch: 'nowhere_batch',
  attack: null,
};

type Runtime = {
  instances: { a: number; b: number };
  pending: { az: 'a' | 'b'; readyAt: number }[];
  backlog: number;
  backlogWrite: number;
  backlogBatch: number;
  prevRate: number;
  lastLoad: number;
  coldTick: number;
  util: number;
  drop: number;
  load: number;
  handled: number;
  instanceTicks: number;
  latShare: number;
  coldStarts: number;
  writes: number;
};

const inWindow = (twist: Twist | undefined, id: Twist, t: number) => {
  if (twist !== id) {
    return false;
  }

  const [start, end] = TWIST_WINDOW[id];

  return t >= start * TICKS && t < end * TICKS;
};

/** Fargate places tasks across AZs by itself. */
const azOf = (node: BoardNode) => (node.type === ComponentType.Fargate ? 'spread' : node.config.az);

const initialInstances = (node: BoardNode) => {
  const count = Math.max(1, node.config.count);

  if (!SERVER_TYPES.has(node.type)) {
    return { a: 1, b: 0 };
  }

  if (azOf(node) === 'spread') {
    return { a: Math.ceil(count / 2), b: Math.floor(count / 2) };
  }

  return azOf(node) === 'b' ? { a: 0, b: count } : { a: count, b: 0 };
};

/**
 * Picks the Region a `regionOutage` takes down: the one running the most Regional components users reach, so the
 * player cannot dodge it by guessing. Ties go to the Region with more users, then to the first Region.
 * @param nodes Components users reach.
 * @param audience Share of users closest to each Region.
 * @returns The Region that goes down.
 */
const pickOutageRegion = (nodes: BoardNode[], audience: Scenario['audience']) => {
  const regional = nodes.filter((node) => !CATALOG[node.type].global);
  const count = (region: Region) => regional.filter((node) => node.config.region === region).length;
  const score = (region: Region) => [count(region), audience[region] ?? 0] as const;

  return REGIONS.reduce((best, region) => {
    const [bestCount, bestShare] = score(best);
    const [regionCount, regionShare] = score(region);

    return regionCount > bestCount || (regionCount === bestCount && regionShare > bestShare) ? region : best;
  });
};

/**
 * Runs a round of traffic through a board and scores it.
 * @param board The design to test.
 * @param scenario The traffic, twist and goals of the round.
 * @returns Per-tick samples, totals and the issues found.
 */
export const simulate = (board: Board, scenario: Scenario): SimResult => {
  const byId = new Map(board.nodes.map((node) => [node.id, node]));
  const children = new Map<string, BoardNode[]>();
  const parents = new Map<string, BoardNode[]>();

  for (const node of board.nodes) {
    children.set(node.id, []);
    parents.set(node.id, []);
  }

  for (const edge of board.edges) {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);

    if (from && to && from.id !== to.id) {
      children.get(from.id)?.push(to);
      parents.get(to.id)?.push(from);
    }
  }

  // Only components users can reach take part in the run.
  const users = board.nodes.find((node) => node.type === ComponentType.Users);
  const reached = new Set<string>(users ? [users.id] : []);

  for (const id of reached) {
    for (const child of children.get(id) ?? []) {
      reached.add(child.id);
    }
  }

  /** Aurora Global Database or a DynamoDB global table: a managed copy in the other Region. */
  const isGlobalDb = (node: BoardNode) => (node.type === ComponentType.Aurora || node.type === ComponentType.DynamoDb) && node.config.globalDb;
  /** Region each Aurora Global Database writes in; a managed failover moves it for good. */
  const writeRegion = new Map<string, Region>();
  /** Tick of each Aurora Global Database failover, when writes pause for about a minute. */
  const failoverAt = new Map<string, number>();

  /** Without a load balancer, or a queue polled by workers, every request lands on the same instance. */
  const balanced = (node: BoardNode) =>
    (parents.get(node.id) ?? []).every((parent) => BALANCER_TYPES.has(parent.type));

  const rt = new Map<string, Runtime>(
    board.nodes.map((node) => [
      node.id,
      {
        instances: initialInstances(node),
        pending: [],
        backlog: 0,
        backlogWrite: 0,
        backlogBatch: 0,
        prevRate: -1,
        lastLoad: 0,
        coldTick: -1,
        util: 0,
        drop: 0,
        load: 0,
        handled: 0,
        instanceTicks: 0,
        latShare: 0,
        coldStarts: 0,
        writes: 0,
      },
    ]),
  );
  const state = (id: string) => rt.get(id) as Runtime;

  const issueCounts = new Map<string, Issue>();
  let recording = false;

  const report = (code: IssueCode, nodeId: string | undefined, count: number) => {
    if (!recording || count <= 0) {
      return;
    }

    const key = `${code}:${nodeId ?? ''}`;
    const existing = issueCounts.get(key);

    if (existing) {
      existing.count += count;
    } else {
      issueCounts.set(key, { code, nodeId, count });
    }
  };

  const failed = (
    code: IssueCode | null,
    nodeId: string | undefined,
    rate: number,
    cls: RequestClass,
  ): Outcome => {
    if (cls === 'attack') {
      return EMPTY;
    }

    if (code) {
      report(code, nodeId, rate);
    }

    return { ...EMPTY, fail: rate };
  };

  let t = 0;
  const { twist } = scenario;
  const outageRegion =
    twist === Twist.RegionOutage ? pickOutageRegion(board.nodes.filter((node) => reached.has(node.id)), scenario.audience) : undefined;

  const aliveFraction = (node: BoardNode): number => {
    const spec = CATALOG[node.type];
    const regionDown =
      inWindow(twist, Twist.RegionOutage, t) && !spec.global && !isGlobalDb(node) && node.config.region === outageRegion;

    if (regionDown) {
      return 0;
    }

    // Without backups, deleted or encrypted data stays gone until it is rebuilt.
    if (inWindow(twist, Twist.DataLoss, t) && spec.fields.includes('backup') && !node.config.backup) {
      return 0;
    }

    const azDown = inWindow(twist, Twist.AzOutage, t);

    if (SERVER_TYPES.has(node.type)) {
      if (node.config.pricing === 'spot' && inWindow(twist, Twist.SpotInterruption, t)) {
        return 0;
      }

      const inst = state(node.id).instances;
      const total = inst.a + inst.b;
      const up = azDown ? inst.b : total;

      return total === 0 ? 0 : up / total;
    }

    if (node.type === ComponentType.ElastiCache) {
      const crashed = inWindow(twist, Twist.CacheCrash, t) || (azDown && !node.config.multiAz);

      if (crashed && !node.config.multiAz) {
        return 0;
      }

      return 1;
    }

    if (node.type === ComponentType.Rds) {
      return azDown && !node.config.multiAz ? 0 : 1;
    }

    if (node.type === ComponentType.ReadReplica) {
      return azDown && node.config.az !== 'b' ? 0 : 1;
    }

    return 1;
  };

  const capacity = (node: BoardNode): number => {
    if (SERVER_TYPES.has(node.type)) {
      const inst = state(node.id).instances;
      const per = CAPACITY[node.type]?.[node.config.size] ?? 0;
      const up = (inst.a + inst.b) * aliveFraction(node);

      return per * (balanced(node) ? up : Math.min(up, 1));
    }

    if (node.type === ComponentType.DynamoDb && !node.config.provisioned) {
      return 40_000;
    }

    const sized = CAPACITY[node.type]?.[node.config.size];

    if (sized !== undefined) {
      // A global database serves from a copy in each Region, so it has two Regions' worth until one is lost.
      const copies = isGlobalDb(node) && !inWindow(twist, Twist.RegionOutage, t) ? 2 : 1;

      return sized * copies * aliveFraction(node);
    }

    return (FIXED_CAPACITY[node.type] ?? Number.POSITIVE_INFINITY) * aliveFraction(node);
  };

  const weight = (type: ComponentType, cls: RequestClass) => {
    if (COMPUTE_TYPES.has(type)) {
      return cls === 'static' ? 0.5 : 1;
    }

    if (cls === 'write' && (type === ComponentType.Rds || type === ComponentType.ReadReplica)) {
      return 3;
    }

    if (cls === 'write' && (type === ComponentType.Aurora || type === ComponentType.DynamoDb)) {
      return 2;
    }

    return 1;
  };

  const alive = (node: BoardNode) => aliveFraction(node) > 0;

  /** A global database reads from the copy in the caller's Region; Aurora still writes in one Region. */
  const servingRegion = (node: BoardNode, flow: Flow) => {
    if (!isGlobalDb(node) || !flow.region) {
      return node.config.region;
    }

    if (node.type === ComponentType.Aurora && flow.cls === 'write') {
      return writeRegion.get(node.id) ?? node.config.region;
    }

    return flow.region;
  };

  const farPenalty = (node: BoardNode, flow: Flow) => {
    if (CATALOG[node.type].global) {
      return 0;
    }

    const away = flow.origin !== null && servingRegion(node, flow) !== flow.origin;

    return away ? FAR_PENALTY * flow.reach : 0;
  };

  const served = (node: BoardNode, flow: Flow, rate: number, extra = 0): Outcome => {
    if (flow.cls === 'attack') {
      return EMPTY;
    }

    return { ok: rate, fail: 0, lat: rate * (farPenalty(node, flow) + extra), miss: 0 };
  };

  /** Splits a flow across targets in proportion to their capacity. */
  const spread = (targets: BoardNode[], flow: Flow, path: string[]): Outcome => {
    const caps = targets.map((target) => Math.min(capacity(target), 1e6) || 1);
    const total = caps.reduce((acc, cap) => acc + cap, 0);

    return targets.reduce(
      (acc, target, i) =>
        sum(acc, route(target, { ...flow, rate: (flow.rate * (caps[i] ?? 0)) / total }, path)),
      EMPTY,
    );
  };

  const accepting = (node: BoardNode, cls: RequestClass) =>
    (children.get(node.id) ?? []).filter((child) => CATALOG[child.type].accepts.includes(cls));

  /** Children of a server, seeing through VPC endpoints to the S3 buckets and tables behind them. */
  const targetsOf = (node: BoardNode) =>
    (children.get(node.id) ?? []).flatMap((child) =>
      child.type === ComponentType.VpcEndpoint ? (children.get(child.id) ?? []) : [child],
    );

  const healthy = (node: BoardNode, targets: BoardNode[]) => {
    if (!HEALTH_AWARE_TYPES.has(node.type)) {
      return targets;
    }

    const up = targets.filter(alive);

    return up.length > 0 ? up : targets;
  };

  const forward = (node: BoardNode, flow: Flow, path: string[], targets: BoardNode[]): Outcome => {
    if (flow.rate <= 0) {
      return EMPTY;
    }

    if (targets.length === 0) {
      return failed(NOWHERE[flow.cls], node.id, flow.rate, flow.cls);
    }

    return spread(healthy(node, targets), flow, path);
  };

  const passThrough = (node: BoardNode, flow: Flow, path: string[]): Outcome => {
    let targets = accepting(node, flow.cls);

    if (flow.cls === 'static' && targets.some((target) => target.type === ComponentType.S3)) {
      targets = targets.filter((target) => target.type === ComponentType.S3);
    } else {
      targets = targets.filter((target) => target.type !== ComponentType.S3);
    }

    // Each protocol uses its own endpoint: HTTP skips an NLB when another target can take it.
    const notNlb = targets.filter((target) => target.type !== ComponentType.Nlb);

    if (flow.cls !== 'tcp' && notNlb.length > 0) {
      targets = notNlb;
    }

    // A proxy sends writes to the primary only; Read Replicas take reads.
    if (node.type === ComponentType.RdsProxy && flow.cls === 'write') {
      targets = targets.filter((target) => target.type !== ComponentType.ReadReplica);
    }

    if (node.type === ComponentType.Alb) {
      const compute = targets.filter((target) => COMPUTE_TYPES.has(target.type));

      if (compute.length < targets.length) {
        report('alb_target', node.id, flow.cls === 'attack' ? 0 : flow.rate);
      }

      targets = compute;
    }

    // Latency routing: send users to the closest Region that passes health checks.
    if (node.type === ComponentType.Route53) {
      const near = targets.filter(
        (target) => target.config.region === flow.origin && alive(target),
      );

      if (near.length > 0) {
        targets = near;
      }
    }

    return forward(node, flow, path, targets);
  };

  /** Databases a server can use: healthy ones first, then those in its own Region. Read Replicas take no writes. */
  const databases = (node: BoardNode, cls: 'read' | 'write') => {
    const linked = targetsOf(node).filter(
      (child) =>
        (DATABASE_TYPES.has(child.type) || child.type === ComponentType.RdsProxy) &&
        (cls === 'read' || child.type !== ComponentType.ReadReplica),
    );
    const up = linked.filter(alive);
    const local = up.filter((db) => isGlobalDb(db) || db.config.region === node.config.region);

    return local.length > 0 ? local : up.length > 0 ? up : linked;
  };

  const readFromData = (node: BoardNode, flow: Flow, path: string[]): Outcome => {
    const caches = (children.get(node.id) ?? []).filter(
      (child) => child.type === ComponentType.ElastiCache && alive(child),
    );
    let result = EMPTY;
    let misses = flow.rate;

    if (caches.length > 0) {
      const fromCache = spread(caches, flow, path);

      misses = fromCache.miss;
      result = { ...fromCache, miss: 0 };
    }

    if (misses <= 0) {
      return result;
    }

    const dbs = databases(node, 'read');

    if (dbs.length === 0) {
      return sum(result, failed('nowhere_read', node.id, misses, flow.cls));
    }

    return sum(result, spread(dbs, { ...flow, rate: misses }, path));
  };

  const compute = (node: BoardNode, flow: Flow, path: string[]): Outcome => {
    const own = state(node.id);
    let extra = 0;

    if (recording && node.type === ComponentType.Lambda && !node.config.provisioned && own.prevRate >= 0) {
      const growth = own.lastLoad - own.prevRate;

      if (growth > own.prevRate * 0.25 + 5 && own.lastLoad > 0) {
        extra = (COLD_START * growth) / own.lastLoad;

        if (own.coldTick !== t) {
          own.coldTick = t;
          own.coldStarts += growth;
        }
      }
    }

    const kids = targetsOf(node);
    const queues = kids.filter((child) => QUEUE_TYPES.has(child.type) && CATALOG[child.type].accepts.includes(flow.cls));
    const withCold = (outcome: Outcome) => ({ ...outcome, lat: outcome.lat + extra * outcome.ok });

    switch (flow.cls) {
      case 'attack': {
        return EMPTY;
      }
      case 'static': {
        const buckets = kids.filter((child) => child.type === ComponentType.S3);

        if (buckets.length > 0) {
          return withCold(spread(buckets, flow, path));
        }

        // Files read from the instance's own EBS volume cost more than handing them to S3.
        own.load += flow.rate * 1.5;

        return served(node, flow, flow.rate, 15 + extra);
      }
      case 'read': {
        return withCold(readFromData(node, flow, path));
      }
      case 'write': {
        const dbs = databases(node, 'write');

        // Without a database of its own, the server hands writes to a queue (write-behind).
        if (dbs.length === 0 && queues.length > 0 && !flow.fromQueue) {
          return withCold(spread(queues, flow, path));
        }

        if (dbs.length === 0) {
          const onlyReplicas = kids.some((child) => DATABASE_TYPES.has(child.type) || child.type === ComponentType.RdsProxy);

          return failed(
            onlyReplicas ? 'replica_write' : 'nowhere_write',
            node.id,
            flow.rate,
            flow.cls,
          );
        }

        return withCold(spread(dbs, flow, path));
      }
      case 'job': {
        if (queues.length > 0 && !flow.fromQueue) {
          return withCold(spread(queues, flow, path));
        }

        // Heavy work done in place costs two extra units per job.
        own.load += flow.rate * 2;

        return served(node, flow, flow.rate, (flow.fromQueue ? 0 : INLINE_JOB) + extra);
      }
      case 'batch': {
        if (queues.length > 0 && !flow.fromQueue) {
          return withCold(spread(queues, flow, path));
        }

        // Lambda stops every invocation at 15 minutes.
        if (node.type === ComponentType.Lambda) {
          return failed('lambda_timeout', node.id, flow.rate, flow.cls);
        }

        own.load += flow.rate * 5;

        return served(node, flow, flow.rate, flow.fromQueue ? 0 : INLINE_BATCH);
      }
      case 'tcp': {
        // Game sessions and device connections are held in memory on the server.
        return served(node, flow, flow.rate, 5);
      }
    }
  };

  const enqueue = (node: BoardNode, flow: Flow, path: string[]): Outcome => {
    if (node.type === ComponentType.Sns) {
      const targets = children.get(node.id) ?? [];

      if (targets.length === 0) {
        return failed('queue_no_consumer', node.id, flow.rate, flow.cls);
      }

      const copies = targets.reduce(
        (acc, target) => sum(acc, route(target, { ...flow, fromQueue: true }, path)),
        EMPTY,
      );
      const lost = copies.fail / targets.length;

      return { ok: flow.rate - lost, fail: lost, lat: 0, miss: 0 };
    }

    if (recording) {
      const own = state(node.id);

      own.backlog += flow.rate;

      if (flow.cls === 'write') {
        own.backlogWrite += flow.rate;
      }

      if (flow.cls === 'batch') {
        own.backlogBatch += flow.rate;
      }
    }

    return { ok: flow.rate, fail: 0, lat: 0, miss: 0 };
  };

  const behave = (node: BoardNode, flow: Flow, path: string[]): Outcome => {
    switch (node.type) {
      case ComponentType.Users: {
        return EMPTY;
      }
      case ComponentType.Waf: {
        return passThrough(
          node,
          flow.cls === 'attack' ? { ...flow, rate: flow.rate * (1 - WAF_BLOCK) } : flow,
          path,
        );
      }
      case ComponentType.GlobalAccelerator: {
        return passThrough(node, { ...flow, reach: flow.reach * 0.5 }, path);
      }
      case ComponentType.CloudFront: {
        const hit =
          flow.cls === 'static'
            ? EDGE_STATIC_HIT
            : (flow.cls === 'read' && node.config.cacheApi
              ? EDGE_API_HIT
              : 0);
        const atEdge = served(node, flow, flow.rate * hit);
        const origin = passThrough(
          node,
          { ...flow, rate: flow.rate * (1 - hit), reach: flow.reach * 0.6 },
          path,
        );

        return sum(atEdge, origin);
      }
      case ComponentType.Route53:
      case ComponentType.Alb:
      case ComponentType.Nlb:
      case ComponentType.Gwlb:
      case ComponentType.ApiGateway:
      case ComponentType.VpcEndpoint:
      case ComponentType.RdsProxy: {
        return passThrough(node, flow, path);
      }
      case ComponentType.Ec2:
      case ComponentType.Lambda:
      case ComponentType.Fargate: {
        return compute(node, flow, path);
      }
      case ComponentType.Cognito:
      case ComponentType.SecretsManager: {
        return EMPTY;
      }
      case ComponentType.ElastiCache: {
        const hits = served(node, flow, flow.rate * CACHE_HIT);
        const missRate = flow.rate * (1 - CACHE_HIT);
        const dbs = databases(node, 'read');

        if (dbs.length > 0) {
          return sum(hits, spread(dbs, { ...flow, rate: missRate }, path));
        }

        return { ...hits, miss: missRate };
      }
      case ComponentType.ReadReplica: {
        if (flow.cls === 'write') {
          return failed('replica_write', node.id, flow.rate, flow.cls);
        }

        return served(node, flow, flow.rate);
      }
      case ComponentType.Rds:
      case ComponentType.Aurora:
      case ComponentType.DynamoDb:
      case ComponentType.S3: {
        return served(node, flow, flow.rate);
      }
      case ComponentType.Sqs:
      case ComponentType.Sns:
      case ComponentType.Kinesis: {
        return enqueue(node, flow, path);
      }
    }
  };

  function route(node: BoardNode, flow: Flow, path: string[]): Outcome {
    if (flow.rate <= 0) {
      return EMPTY;
    }

    if (path.includes(node.id)) {
      return failed('loop', node.id, flow.rate, flow.cls);
    }

    if (!alive(node)) {
      const regionDown = inWindow(twist, Twist.RegionOutage, t) && node.config.region === outageRegion;
      const wiped = inWindow(twist, Twist.DataLoss, t) && CATALOG[node.type].fields.includes('backup') && !node.config.backup;
      const code = regionDown && DATABASE_TYPES.has(node.type) ? 'db_region_down' : wiped ? 'data_lost' : 'down';

      return failed(code, node.id, flow.rate, flow.cls);
    }

    // Writes pause for the managed failover; expected, so not a design issue.
    if (flow.cls === 'write' && failoverAt.get(node.id) === t) {
      return failed(null, node.id, flow.rate, flow.cls);
    }

    const own = state(node.id);
    const spec = CATALOG[node.type];
    const region = servingRegion(node, flow);
    const hop = flow.region && !spec.global && region !== flow.region ? CROSS_REGION : 0;

    const caller = byId.get(path.at(-1) ?? '');
    // Every Lambda environment opens its own connection; RDS Proxy pools them.
    const storm = caller?.type === ComponentType.Lambda && RELATIONAL_TYPES.has(node.type);
    const units = weight(node.type, flow.cls) * (storm ? CONNECTION_STORM : 1);

    if (storm && flow.cls !== 'attack') {
      report('connection_storm', node.id, flow.rate);
    }

    own.load += flow.rate * units;

    // Attack traffic is billed too: pay-per-request services charge for every junk request.
    if (recording) {
      own.handled += flow.rate * units;

      if (flow.cls === 'write' && DATABASE_TYPES.has(node.type)) {
        own.writes += flow.rate;
      }
    }

    const dropped = flow.rate * own.drop;
    const lost = dropped > 0 ? failed('overloaded', node.id, dropped, flow.cls) : EMPTY;
    const next: Flow = {
      ...flow,
      rate: flow.rate - dropped,
      region: spec.global ? flow.region : region,
    };
    const result = behave(node, next, [...path, node.id]);
    const delay = spec.latency * (1 + 4 * Math.min(own.util, 1.2) ** 4) + hop;

    if (recording) {
      own.latShare += delay * result.ok;
    }

    return { ...sum(lost, result), lat: result.lat + delay * result.ok };
  }

  const ticks: TickSample[] = [];
  let totalSent = 0;
  let totalOk = 0;
  let totalLat = 0;

  const scaleGroups = () => {
    for (const node of board.nodes) {
      if (!SERVER_TYPES.has(node.type)) {
        continue;
      }

      const own = state(node.id);
      const az = azOf(node);
      const azDown = inWindow(twist, Twist.AzOutage, t);
      const ready = own.pending.filter((p) => p.readyAt <= t);

      own.pending = own.pending.filter((p) => p.readyAt > t);

      for (const p of ready) {
        own.instances[p.az] += 1;
      }

      if (!node.config.autoScaling) {
        continue;
      }

      const total = own.instances.a + own.instances.b + own.pending.length;
      const max = Math.max(node.config.maxCount, node.config.count);
      const healthyCount = azDown ? own.instances.b : own.instances.a + own.instances.b;
      const targetAz = (): 'a' | 'b' => {
        if (azDown || az === 'b') {
          return 'b';
        }

        if (az === 'a') {
          return 'a';
        }

        return own.instances.a <= own.instances.b ? 'a' : 'b';
      };

      // Target tracking: aim for 60% utilization.
      const wanted = Math.min(max, Math.ceil((own.util * Math.max(healthyCount, 1)) / 0.6));

      if (
        azDown &&
        az === 'spread' &&
        healthyCount + own.pending.length < node.config.count
      ) {
        // Replace lost capacity in the healthy AZ.
        own.pending.push({ az: 'b', readyAt: t + 2 });
      } else if (own.util > 0.6 && total < max) {
        for (let i = total; i < Math.max(wanted, total + 1); i += 1) {
          own.pending.push({ az: targetAz(), readyAt: t + 2 });
        }
      } else if (
        own.util < 0.3 &&
        own.pending.length === 0 &&
        own.instances.a + own.instances.b > node.config.count
      ) {
        if (own.instances.a > own.instances.b && !azDown) {
          own.instances.a -= 1;
        } else if (own.instances.b > 0) {
          own.instances.b -= 1;
        }
      }
    }
  };

  const drainQueues = () => {
    for (const queue of board.nodes) {
      if (!POLLED_TYPES.has(queue.type) || !alive(queue)) {
        continue;
      }

      const own = state(queue.id);
      const consumers = (children.get(queue.id) ?? []).filter(
        (child) => COMPUTE_TYPES.has(child.type) && alive(child),
      );

      if (consumers.length === 0 || own.backlog <= 0) {
        continue;
      }

      // Writes cost one unit on a consumer, jobs three and long batch jobs six.
      const writeShare = own.backlogWrite / own.backlog;
      const batchShare = own.backlogBatch / own.backlog;
      const jobShare = Math.max(0, 1 - writeShare - batchShare);
      const unitsPerMessage = writeShare + jobShare * 3 + batchShare * 6;
      const free = consumers.map((consumer) =>
        Math.max(0, capacity(consumer) * 0.9 - state(consumer.id).load),
      );
      // A stream hands every record to every consumer; a queue hands each message to one.
      const stream = queue.type === ComponentType.Kinesis;
      const room = stream ? Math.min(...free) : free.reduce((acc, value) => acc + value, 0);
      const amount = Math.min(own.backlog, room / unitsPerMessage);

      if (amount <= 0) {
        continue;
      }

      own.backlog -= amount;
      own.backlogWrite -= amount * writeShare;
      own.backlogBatch -= amount * batchShare;
      let lost = 0;

      consumers.forEach((consumer, i) => {
        const share = stream ? amount : (amount * (free[i] ?? 0)) / room;
        const base = { origin: null, reach: 0, region: queue.config.region, fromQueue: true };
        const sent = (['write', 'job', 'batch'] as const).map((cls) => {
          const rate = share * (cls === 'write' ? writeShare : cls === 'batch' ? batchShare : jobShare);

          return route(consumer, { ...base, cls, rate }, [queue.id]);
        });

        lost += sent.reduce((acc, outcome) => acc + outcome.fail, 0) / (stream ? consumers.length : 1);
      });

      totalOk -= lost;
    }
  };

  const mix = Object.entries(scenario.mix) as [TrafficClass, number][];
  const audience = Object.entries(scenario.audience) as [Region, number][];

  /** Aurora Global Database promotes its copy in the other Region once the primary Region goes down. */
  const failover = () => {
    if (!inWindow(twist, Twist.RegionOutage, t)) {
      return;
    }

    for (const db of board.nodes) {
      const region = writeRegion.get(db.id) ?? db.config.region;

      if (db.type === ComponentType.Aurora && isGlobalDb(db) && region === outageRegion) {
        writeRegion.set(db.id, REGIONS.find((item) => item !== region) ?? region);
        failoverAt.set(db.id, t);
      }
    }
  };

  for (t = 0; t < TICKS; t += 1) {
    scaleGroups();
    failover();

    const wave = 1 + 0.08 * Math.sin(t / 3);
    // The sale ramps up over six ticks, so Auto Scaling has a chance to follow.
    const saleStart = Math.ceil(TWIST_WINDOW[Twist.FlashSale][0] * TICKS);
    const surge = inWindow(twist, Twist.FlashSale, t)
      ? 1 + 2 * Math.min(1, (t - saleStart + 1) / 6)
      : 1;
    const growth = twist === Twist.Viral ? 1 + (3 * t) / TICKS : 1;
    // Business hours ramp up over six ticks from a quiet night.
    const dayStart = Math.ceil(TWIST_WINDOW[Twist.DailyCycle][0] * TICKS);
    const daylight =
      twist === Twist.DailyCycle
        ? inWindow(twist, Twist.DailyCycle, t)
          ? NIGHT_SHARE + (1 - NIGHT_SHARE) * Math.min(1, (t - dayStart + 1) / 6)
          : NIGHT_SHARE
        : 1;
    const traffic = scenario.traffic * wave * surge * growth * daylight;
    const attack = inWindow(twist, Twist.Ddos, t) ? scenario.traffic * 6 : 0;
    let tickOk = 0;
    let tickLat = 0;
    let tickSent = 0;

    for (let pass = 0; pass < 3; pass += 1) {
      recording = pass === 2;

      for (const node of board.nodes) {
        state(node.id).load = 0;
      }

      tickOk = 0;
      tickLat = 0;
      tickSent = 0;

      const entries = users ? (children.get(users.id) ?? []) : [];
      const send = (cls: RequestClass, rate: number, origin: Region | null) => {
        const targets = entries.filter((entry) => CATALOG[entry.type].accepts.includes(cls));
        const flow: Flow = { cls, rate, origin, reach: 1, region: null, fromQueue: false };

        if (cls !== 'attack') {
          tickSent += rate;
        }

        if (targets.length === 0) {
          if (cls !== 'attack') {
            report(
              entries.length === 0 ? 'users_unconnected' : (NOWHERE[cls] ?? 'users_unconnected'),
              users?.id,
              rate,
            );
          }

          return;
        }

        const outcome = spread(targets, flow, users ? [users.id] : []);

        tickOk += outcome.ok;
        tickLat += outcome.lat;
      };

      for (const [cls, share] of mix) {
        const rate = traffic * share;

        for (const [origin, share] of audience) {
          send(cls, rate * share, origin);
        }
      }

      send('attack', attack, null);

      const okBeforeDrain = totalOk;

      if (recording) {
        drainQueues();
        tickOk += totalOk - okBeforeDrain;
        totalOk = okBeforeDrain;
      }

      for (const node of board.nodes) {
        const own = state(node.id);
        const cap = capacity(node);

        own.lastLoad = own.load;
        own.util =
          cap === Number.POSITIVE_INFINITY ? 0 : cap <= 0 ? (own.load > 0 ? 2 : 0) : own.load / cap;
        own.drop = own.util > 1 ? 1 - 1 / own.util : 0;
      }
    }

    const nodes: Record<string, NodeTick> = {};

    for (const node of board.nodes) {
      const own = state(node.id);
      const instances = own.instances.a + own.instances.b;

      // Idle components are still billed, but they show no live state.
      if (SERVER_TYPES.has(node.type)) {
        own.instanceTicks += instances + own.pending.length;
      }

      if (node.type === ComponentType.Lambda) {
        own.prevRate = own.load;
      }

      if (!reached.has(node.id)) {
        continue;
      }

      const cap = capacity(node);

      nodes[node.id] = {
        util: Math.min(own.util, 2),
        load: own.load,
        capacity: cap === Number.POSITIVE_INFINITY ? undefined : cap,
        alive: alive(node),
        instances: SERVER_TYPES.has(node.type) ? Math.round(instances * aliveFraction(node)) : undefined,
        backlog: POLLED_TYPES.has(node.type) ? own.backlog : undefined,
        primaryRegion: writeRegion.get(node.id),
      };
    }

    totalSent += tickSent;
    totalOk += tickOk;
    totalLat += tickLat;
    ticks.push({
      t,
      traffic: tickSent,
      answered: tickSent > 0 ? Math.max(0, tickOk) / tickSent : 1,
      latency: tickOk > 0 ? BASE_LATENCY + tickLat / tickOk : 0,
      twistActive: twist ? inWindow(twist, twist, t) && twist !== Twist.Viral : false,
      nodes,
    });
  }

  recording = true;

  for (const node of board.nodes) {
    const group = node.config.count > 1 || node.config.autoScaling;

    if (SERVER_TYPES.has(node.type) && group && state(node.id).handled > 0 && !balanced(node)) {
      report('no_balancer', node.id, 1);
    }
  }

  // Leftover backlog: jobs nobody processed.
  const queued = board.nodes.filter((node) => POLLED_TYPES.has(node.type));

  for (const queue of queued) {
    const own = state(queue.id);
    const enqueued = own.handled;
    const consumers = (children.get(queue.id) ?? []).filter((child) =>
      COMPUTE_TYPES.has(child.type),
    );

    recording = true;

    if (consumers.length === 0 && enqueued > 0) {
      report('queue_no_consumer', queue.id, enqueued);
      totalOk -= enqueued;
    } else if (enqueued > 0 && own.backlog > enqueued * 0.05) {
      report('backlog', queue.id, own.backlog);

      if (scenario.requirements.includes('drainQueue')) {
        totalOk -= own.backlog;
      }
    }
  }

  // Cost
  const costByNode: Record<string, number> = {};
  let cost = 0;

  for (const node of board.nodes) {
    const own = state(node.id);
    const avgHandled = own.handled / TICKS;
    let price = FLAT_PRICE[node.type] ?? 0;

    price += (REQUEST_PRICE[node.type] ?? 0) * avgHandled * SECONDS_PER_MONTH_FACTOR;

    const sized = SIZE_PRICE[node.type]?.[node.config.size] ?? 0;

    if (SERVER_TYPES.has(node.type)) {
      const avgInstances = own.instanceTicks / TICKS;
      const base = Math.min(avgInstances, node.config.count);
      const extraInstances = Math.max(0, avgInstances - base);
      const factor = PRICING_FACTOR[node.config.pricing];
      const burstFactor = node.config.pricing === 'reserved' ? 1 : factor;

      price += sized * (base * factor + extraInstances * burstFactor);
    } else if (node.type === ComponentType.DynamoDb) {
      price = node.config.provisioned ? sized : price;
    } else if (node.type === ComponentType.Rds || node.type === ComponentType.ElastiCache) {
      price += sized * (node.config.multiAz ? 2 : 1);
    } else {
      price += sized;
    }

    if (node.type === ComponentType.Lambda && node.config.provisioned) {
      price += PROVISIONED_CONCURRENCY_PRICE;
    }

    // A global database pays for its copy in the other Region.
    if (isGlobalDb(node)) {
      price *= 2;
    }

    if (node.config.backup && CATALOG[node.type].fields.includes('backup')) {
      price += Math.max(1, price * BACKUP_FACTOR);
    }

    costByNode[node.id] = Math.round(price * 100) / 100;
    cost += price;
  }

  cost = Math.round(cost * 100) / 100;

  // Requirements
  recording = true;
  const requirementChecks = scenario.requirements.map((id) => ({ id, ok: checkRequirement(id) }));

  function checkRequirement(id: RequirementId): boolean {
    switch (id) {
      case 'encryptData': {
        const open = board.nodes.filter(
          (node) => CATALOG[node.type].fields.includes('encrypted') && !node.config.encrypted,
        );

        for (const node of open) {
          report('unencrypted', node.id, 1);
        }

        return open.length === 0;
      }
      case 'privateData': {
        const exposed = board.nodes.filter(
          (node) =>
            (DATABASE_TYPES.has(node.type) || node.type === ComponentType.ElastiCache) &&
            (parents.get(node.id) ?? []).some((parent) => !PRIVATE_DATA_PARENTS.has(parent.type)),
        );

        for (const node of exposed) {
          report('public_data', node.id, 1);
        }

        return exposed.length === 0;
      }
      case 'noPublicServers': {
        const exposed = board.nodes.filter(
          (node) =>
            SERVER_TYPES.has(node.type) &&
            (parents.get(node.id) ?? []).some((parent) =>
              PUBLIC_SERVER_PARENTS.has(parent.type),
            ),
        );

        for (const node of exposed) {
          report('public_server', node.id, 1);
        }

        return exposed.length === 0;
      }
      case 'privateBucket': {
        const exposed = board.nodes.filter(
          (node) =>
            node.type === ComponentType.S3 &&
            (parents.get(node.id) ?? []).some((parent) => PUBLIC_BUCKET_PARENTS.has(parent.type)),
        );

        for (const node of exposed) {
          report('public_bucket', node.id, 1);
        }

        return exposed.length === 0;
      }
      case 'webFirewall': {
        // Walk from the users without crossing a WAF; the first servers reached this way are unprotected.
        return flag(unguarded(ComponentType.Waf), 'no_firewall');
      }
      case 'fanOut': {
        const ok = board.nodes.some(
          (node) =>
            node.type === ComponentType.Sns &&
            (children.get(node.id) ?? []).filter(
              (child) =>
                child.type === ComponentType.Sqs &&
                (children.get(child.id) ?? []).some((consumer) => COMPUTE_TYPES.has(consumer.type)),
            ).length >= 2,
        );

        if (!ok) {
          report('no_fan_out', board.nodes.find((node) => node.type === ComponentType.Sns)?.id, 1);
        }

        return ok;
      }
      case 'drainQueue': {
        return !queued.some((queue) => {
          const own = state(queue.id);

          return own.handled > 0 && own.backlog > own.handled * 0.05;
        });
      }
      case 'dataResidency': {
        const away = board.nodes.filter(
          (node) =>
            reached.has(node.id) &&
            RESIDENT_TYPES.has(node.type) &&
            (node.config.region !== 'eu-west-1' || isGlobalDb(node)),
        );

        return flag(away, 'data_outside_region');
      }
      case 'staticIp': {
        const entries = (users ? (children.get(users.id) ?? []) : []).flatMap((entry) =>
          entry.type === ComponentType.Route53 ? (children.get(entry.id) ?? []) : [entry],
        );

        return flag(
          entries.filter((entry) => !STATIC_IP_TYPES.has(entry.type)),
          'no_static_ip',
        );
      }
      case 'inspectTraffic': {
        return flag(unguarded(ComponentType.Gwlb), 'no_inspection');
      }
      case 'userAuth': {
        const open = board.nodes.filter(
          (node) =>
            reached.has(node.id) &&
            (node.type === ComponentType.ApiGateway || node.type === ComponentType.Alb) &&
            !(children.get(node.id) ?? []).some((child) => child.type === ComponentType.Cognito),
        );

        return flag(open, 'no_auth');
      }
      case 'rotateSecrets': {
        const open = board.nodes.filter(
          (node) =>
            (COMPUTE_TYPES.has(node.type) || node.type === ComponentType.RdsProxy) &&
            (children.get(node.id) ?? []).some((child) => RELATIONAL_TYPES.has(child.type)) &&
            !(children.get(node.id) ?? []).some((child) => child.type === ComponentType.SecretsManager),
        );

        return flag(open, 'no_secret');
      }
      case 'privateEgress': {
        const open = board.nodes.filter(
          (node) =>
            SERVER_TYPES.has(node.type) &&
            (children.get(node.id) ?? []).some(
              (child) => child.type === ComponentType.S3 || child.type === ComponentType.DynamoDb,
            ),
        );

        return flag(open, 'direct_egress');
      }
      case 'replayStream': {
        const ok = board.nodes.some(
          (node) =>
            node.type === ComponentType.Kinesis &&
            (children.get(node.id) ?? []).filter((child) => COMPUTE_TYPES.has(child.type)).length >= 2,
        );

        if (!ok) {
          report('no_replay', board.nodes.find((node) => node.type === ComponentType.Kinesis)?.id, 1);
        }

        return ok;
      }
      case 'noServers': {
        return flag(
          board.nodes.filter((node) => reached.has(node.id) && node.type === ComponentType.Ec2),
          'server_managed',
        );
      }
    }
  }

  /** Reports every node that breaks a rule. */
  function flag(nodes: BoardNode[], code: IssueCode) {
    for (const node of nodes) {
      report(code, node.id, 1);
    }

    return nodes.length === 0;
  }

  /** Servers users reach without crossing a component of the given type. */
  function unguarded(guard: ComponentType) {
    const open = new Set<string>();
    const stack = board.nodes.filter((node) => node.type === ComponentType.Users);

    for (let node = stack.pop(); node; node = stack.pop()) {
      for (const child of children.get(node.id) ?? []) {
        if (child.type !== guard && !open.has(child.id)) {
          open.add(child.id);

          if (!COMPUTE_TYPES.has(child.type)) {
            stack.push(child);
          }
        }
      }
    }

    return board.nodes.filter((node) => open.has(node.id) && COMPUTE_TYPES.has(node.type));
  }

  const integrityOk = checkIntegrity();

  /** Writes must all land in one database; a global database keeps its own copies in sync. */
  function checkIntegrity() {
    const written = board.nodes.filter((node) => state(node.id).writes > 0);

    if (written.length <= 1) {
      return true;
    }

    const least = written.reduce((a, b) => (state(b.id).writes < state(a.id).writes ? b : a));

    report('data_split', least.id, state(least.id).writes);

    return false;
  }

  const answered = totalSent > 0 ? Math.max(0, Math.min(1, totalOk / totalSent)) : 0;
  const avgLatency = totalOk > 0 ? Math.round(BASE_LATENCY + totalLat / Math.max(totalOk, 1)) : 0;
  const latencyOk = totalOk > 0 && avgLatency <= scenario.latencyTarget;
  const costOk = scenario.budget === undefined || cost <= scenario.budget;

  if (!latencyOk) {
    const cold = board.nodes.filter((node) => state(node.id).coldStarts > 0);

    for (const node of cold) {
      report('cold_start', node.id, state(node.id).coldStarts);
    }

    const slowest = board.nodes.reduce<BoardNode | undefined>(
      (best, node) => (!best || state(node.id).latShare > state(best.id).latShare ? node : best),
      undefined,
    );

    report('slow', slowest?.id, totalSent);
  }

  if (!costOk) {
    const priciest = board.nodes.reduce<BoardNode | undefined>(
      (best, node) =>
        !best || (costByNode[node.id] ?? 0) > (costByNode[best.id] ?? 0) ? node : best,
      undefined,
    );

    report('over_budget', priciest?.id, 1);
  }

  const answeredOk = answered >= 0.99;
  const issues = [...issueCounts.values()].sort(
    (a, b) => ISSUE_RANK[a.code] - ISSUE_RANK[b.code] || b.count - a.count,
  );

  return {
    ticks,
    answered,
    avgLatency,
    cost,
    costByNode,
    issues,
    checks: {
      answered: answeredOk,
      latency: latencyOk,
      cost: costOk,
      integrity: integrityOk,
      requirements: requirementChecks,
    },
    passed:
      answeredOk &&
      latencyOk &&
      costOk &&
      integrityOk &&
      requirementChecks.every((check) => check.ok),
    outageRegion,
  };
};
