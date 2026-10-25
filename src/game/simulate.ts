import {
  CAPACITY,
  CATALOG,
  COMPUTE_TYPES,
  DATABASE_TYPES,
  FIXED_CAPACITY,
  FLAT_PRICE,
  HEALTH_AWARE_TYPES,
  PRICING_FACTOR,
  PROVISIONED_CONCURRENCY_PRICE,
  QUEUE_TYPES,
  REQUEST_PRICE,
  SIZE_PRICE,
} from './catalog';
import type {
  Board,
  BoardNode,
  ComponentType,
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
  TwistId,
} from './types';

export const TICKS = 60;

const BASE_LATENCY = 20;
const FAR_PENALTY = 150;
const CROSS_REGION = 70;
const INLINE_JOB = 400;
const COLD_START = 300;
const CACHE_HIT = 0.85;
const EDGE_STATIC_HIT = 0.95;
const EDGE_API_HIT = 0.5;
const WAF_BLOCK = 0.98;
const SECONDS_PER_MONTH_FACTOR = 1 / 100;

/** Share of the round each twist is active, as [start, end). */
export const TWIST_WINDOW: Record<TwistId, [number, number]> = {
  azOutage: [0.35, 0.75],
  regionOutage: [0.4, 0.8],
  spotInterruption: [0.3, 0.6],
  flashSale: [0.4, 0.7],
  ddos: [0.3, 0.7],
  cacheCrash: [0.4, 0.65],
  viral: [0, 1],
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
  replica_write: 1,
  queue_no_consumer: 1,
  alb_target: 2,
  down: 2,
  overloaded: 2,
  backlog: 3,
  unencrypted: 4,
  public_data: 4,
  public_server: 4,
  no_fan_out: 4,
  cold_start: 5,
  slow: 6,
  over_budget: 7,
};

const NOWHERE: Record<RequestClass, IssueCode | null> = {
  read: 'nowhere_read',
  write: 'nowhere_write',
  static: 'nowhere_static',
  job: 'nowhere_job',
  attack: null,
};

type Runtime = {
  instances: { a: number; b: number };
  pending: { az: 'a' | 'b'; readyAt: number }[];
  backlog: number;
  backlogWrite: number;
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
};

const inWindow = (twist: TwistId | undefined, id: TwistId, t: number) => {
  if (twist !== id) {
    return false;
  }

  const [start, end] = TWIST_WINDOW[id];

  return t >= start * TICKS && t < end * TICKS;
};

const initialInstances = (node: BoardNode) => {
  const count = Math.max(1, node.config.count);

  if (node.type !== 'ec2') {
    return { a: 1, b: 0 };
  }

  if (node.config.az === 'spread') {
    return { a: Math.ceil(count / 2), b: Math.floor(count / 2) };
  }

  return node.config.az === 'b' ? { a: 0, b: count } : { a: count, b: 0 };
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

  const rt = new Map<string, Runtime>(
    board.nodes.map((node) => [
      node.id,
      {
        instances: initialInstances(node),
        pending: [],
        backlog: 0,
        backlogWrite: 0,
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

  const failed = (code: IssueCode | null, nodeId: string | undefined, rate: number, cls: RequestClass): Outcome => {
    if (cls === 'attack') {
      return EMPTY;
    }

    if (code) {
      report(code, nodeId, rate);
    }

    return { ...EMPTY, fail: rate };
  };

  let t = 0;
  const twist = scenario.twist;

  const aliveFraction = (node: BoardNode): number => {
    const spec = CATALOG[node.type];
    const regionDown = inWindow(twist, 'regionOutage', t) && !spec.global && node.config.region === scenario.outageRegion;

    if (regionDown) {
      return 0;
    }

    const azDown = inWindow(twist, 'azOutage', t);

    if (node.type === 'ec2') {
      if (node.config.pricing === 'spot' && inWindow(twist, 'spotInterruption', t)) {
        return 0;
      }

      const inst = state(node.id).instances;
      const total = inst.a + inst.b;
      const up = azDown ? inst.b : total;

      return total === 0 ? 0 : up / total;
    }

    if (node.type === 'elasticache') {
      const crashed = inWindow(twist, 'cacheCrash', t) || (azDown && !node.config.multiAz);

      if (crashed && !node.config.multiAz) {
        return 0;
      }

      return 1;
    }

    if (node.type === 'rds') {
      return azDown && !node.config.multiAz ? 0 : 1;
    }

    if (node.type === 'readReplica') {
      return azDown && node.config.az !== 'b' ? 0 : 1;
    }

    return 1;
  };

  const capacity = (node: BoardNode): number => {
    if (node.type === 'ec2') {
      const inst = state(node.id).instances;
      const per = CAPACITY.ec2?.[node.config.size] ?? 0;

      return per * (inst.a + inst.b) * aliveFraction(node);
    }

    if (node.type === 'dynamodb' && !node.config.provisioned) {
      return 40_000;
    }

    const sized = CAPACITY[node.type]?.[node.config.size];

    if (sized !== undefined) {
      return sized * aliveFraction(node);
    }

    return (FIXED_CAPACITY[node.type] ?? Number.POSITIVE_INFINITY) * aliveFraction(node);
  };

  const weight = (type: ComponentType, cls: RequestClass) => {
    if (COMPUTE_TYPES.has(type)) {
      return cls === 'static' ? 0.5 : 1;
    }

    if (cls === 'write' && (type === 'rds' || type === 'readReplica')) {
      return 3;
    }

    if (cls === 'write' && (type === 'aurora' || type === 'dynamodb')) {
      return 2;
    }

    return 1;
  };

  const alive = (node: BoardNode) => aliveFraction(node) > 0;

  const farPenalty = (node: BoardNode, flow: Flow) => {
    if (CATALOG[node.type].global) {
      return 0;
    }

    const away = flow.origin !== null && node.config.region !== flow.origin;

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
      (acc, target, i) => sum(acc, route(target, { ...flow, rate: (flow.rate * (caps[i] ?? 0)) / total }, path)),
      EMPTY,
    );
  };

  const accepting = (node: BoardNode, cls: RequestClass) =>
    (children.get(node.id) ?? []).filter((child) => CATALOG[child.type].accepts.includes(cls));

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

    if (flow.cls === 'static' && targets.some((target) => target.type === 's3')) {
      targets = targets.filter((target) => target.type === 's3');
    } else {
      targets = targets.filter((target) => target.type !== 's3');
    }

    if (node.type === 'alb') {
      const compute = targets.filter((target) => COMPUTE_TYPES.has(target.type));

      if (compute.length < targets.length) {
        report('alb_target', node.id, flow.cls === 'attack' ? 0 : flow.rate);
      }

      targets = compute;
    }

    // Latency routing: send users to the closest Region that passes health checks.
    if (node.type === 'route53') {
      const near = targets.filter((target) => target.config.region === flow.origin && alive(target));

      if (near.length > 0) {
        targets = near;
      }
    }

    return forward(node, flow, path, targets);
  };

  const databases = (node: BoardNode, cls: 'read' | 'write') =>
    (children.get(node.id) ?? []).filter(
      (child) => DATABASE_TYPES.has(child.type) && (cls === 'read' || child.type !== 'readReplica'),
    );

  const readFromData = (node: BoardNode, flow: Flow, path: string[]): Outcome => {
    const caches = (children.get(node.id) ?? []).filter((child) => child.type === 'elasticache' && alive(child));
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

    if (recording && node.type === 'lambda' && !node.config.provisioned && own.prevRate >= 0) {
      const growth = own.lastLoad - own.prevRate;

      if (growth > own.prevRate * 0.25 + 5 && own.lastLoad > 0) {
        extra = (COLD_START * growth) / own.lastLoad;

        if (own.coldTick !== t) {
          own.coldTick = t;
          own.coldStarts += growth;
        }
      }
    }

    const kids = children.get(node.id) ?? [];
    const queues = kids.filter((child) => QUEUE_TYPES.has(child.type));
    const withCold = (outcome: Outcome) => ({ ...outcome, lat: outcome.lat + extra * outcome.ok });

    switch (flow.cls) {
      case 'attack':
        return EMPTY;
      case 'static': {
        const buckets = kids.filter((child) => child.type === 's3');

        if (buckets.length > 0) {
          return withCold(spread(buckets, flow, path));
        }

        return served(node, flow, flow.rate, 15 + extra);
      }
      case 'read':
        return withCold(readFromData(node, flow, path));
      case 'write': {
        const dbs = databases(node, 'write');

        // Without a database of its own, the server hands writes to a queue (write-behind).
        if (dbs.length === 0 && queues.length > 0 && !flow.fromQueue) {
          return withCold(spread(queues, flow, path));
        }

        if (dbs.length === 0) {
          const onlyReplicas = kids.some((child) => child.type === 'readReplica');

          return failed(onlyReplicas ? 'replica_write' : 'nowhere_write', node.id, flow.rate, flow.cls);
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
    }
  };

  const enqueue = (node: BoardNode, flow: Flow, path: string[]): Outcome => {
    if (node.type === 'sns') {
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
    }

    return { ok: flow.rate, fail: 0, lat: 0, miss: 0 };
  };

  const behave = (node: BoardNode, flow: Flow, path: string[]): Outcome => {
    switch (node.type) {
      case 'users':
        return EMPTY;
      case 'waf':
        return passThrough(node, flow.cls === 'attack' ? { ...flow, rate: flow.rate * (1 - WAF_BLOCK) } : flow, path);
      case 'globalAccelerator':
        return passThrough(node, { ...flow, reach: flow.reach * 0.5 }, path);
      case 'cloudfront': {
        const hit = flow.cls === 'static' ? EDGE_STATIC_HIT : flow.cls === 'read' && node.config.cacheApi ? EDGE_API_HIT : 0;
        const atEdge = served(node, flow, flow.rate * hit);
        const origin = passThrough(node, { ...flow, rate: flow.rate * (1 - hit), reach: flow.reach * 0.6 }, path);

        return sum(atEdge, origin);
      }
      case 'route53':
      case 'alb':
      case 'apiGateway':
        return passThrough(node, flow, path);
      case 'ec2':
      case 'lambda':
        return compute(node, flow, path);
      case 'elasticache': {
        const hits = served(node, flow, flow.rate * CACHE_HIT);
        const missRate = flow.rate * (1 - CACHE_HIT);
        const dbs = databases(node, 'read');

        if (dbs.length > 0) {
          return sum(hits, spread(dbs, { ...flow, rate: missRate }, path));
        }

        return { ...hits, miss: missRate };
      }
      case 'readReplica':
        if (flow.cls === 'write') {
          return failed('replica_write', node.id, flow.rate, flow.cls);
        }

        return served(node, flow, flow.rate);
      case 'rds':
      case 'aurora':
      case 'dynamodb':
      case 's3':
        return served(node, flow, flow.rate);
      case 'sqs':
      case 'sns':
        return enqueue(node, flow, path);
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
      return failed('down', node.id, flow.rate, flow.cls);
    }

    const own = state(node.id);
    const spec = CATALOG[node.type];
    const hop = flow.region && !spec.global && node.config.region !== flow.region ? CROSS_REGION : 0;

    own.load += flow.rate * weight(node.type, flow.cls);

    // Attack traffic is billed too: pay-per-request services charge for every junk request.
    if (recording) {
      own.handled += flow.rate * weight(node.type, flow.cls);
    }

    const dropped = flow.rate * own.drop;
    const lost = dropped > 0 ? failed('overloaded', node.id, dropped, flow.cls) : EMPTY;
    const next: Flow = {
      ...flow,
      rate: flow.rate - dropped,
      region: spec.global ? flow.region : node.config.region,
    };
    const result = behave(node, next, [...path, node.id]);
    const delay = spec.latency * (1 + 4 * Math.min(own.util, 1.2) ** 4) + hop;

    if (recording) {
      own.latShare += delay * result.ok;
    }

    return { ...sum(lost, result), lat: result.lat + delay * result.ok };
  }

  const users = board.nodes.find((node) => node.type === 'users');
  const ticks: TickSample[] = [];
  let totalSent = 0;
  let totalOk = 0;
  let totalLat = 0;

  const scaleGroups = () => {
    for (const node of board.nodes) {
      if (node.type !== 'ec2') {
        continue;
      }

      const own = state(node.id);
      const azDown = inWindow(twist, 'azOutage', t);
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
        if (azDown || node.config.az === 'b') {
          return 'b';
        }

        if (node.config.az === 'a') {
          return 'a';
        }

        return own.instances.a <= own.instances.b ? 'a' : 'b';
      };

      // Target tracking: aim for 60% utilization.
      const wanted = Math.min(max, Math.ceil((own.util * Math.max(healthyCount, 1)) / 0.6));

      if (azDown && node.config.az === 'spread' && healthyCount + own.pending.length < node.config.count) {
        // Replace lost capacity in the healthy AZ.
        own.pending.push({ az: 'b', readyAt: t + 2 });
      } else if (own.util > 0.6 && total < max) {
        for (let i = total; i < Math.max(wanted, total + 1); i += 1) {
          own.pending.push({ az: targetAz(), readyAt: t + 2 });
        }
      } else if (own.util < 0.3 && own.pending.length === 0 && own.instances.a + own.instances.b > node.config.count) {
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
      if (queue.type !== 'sqs' || !alive(queue)) {
        continue;
      }

      const own = state(queue.id);
      const consumers = (children.get(queue.id) ?? []).filter((child) => COMPUTE_TYPES.has(child.type) && alive(child));

      if (consumers.length === 0 || own.backlog <= 0) {
        continue;
      }

      // Jobs cost three units on a consumer, writes one.
      const writeShare = own.backlogWrite / own.backlog;
      const unitsPerMessage = writeShare + (1 - writeShare) * 3;
      const free = consumers.map((consumer) => Math.max(0, capacity(consumer) * 0.9 - state(consumer.id).load));
      const room = free.reduce((acc, value) => acc + value, 0);
      const amount = Math.min(own.backlog, room / unitsPerMessage);

      if (amount <= 0) {
        continue;
      }

      own.backlog -= amount;
      own.backlogWrite -= amount * writeShare;
      let lost = 0;

      consumers.forEach((consumer, i) => {
        const share = (amount * (free[i] ?? 0)) / room;
        const base = { origin: null, reach: 0, region: queue.config.region, fromQueue: true };
        const writes = route(consumer, { ...base, cls: 'write', rate: share * writeShare }, [queue.id]);
        const jobs = route(consumer, { ...base, cls: 'job', rate: share * (1 - writeShare) }, [queue.id]);

        lost += writes.fail + jobs.fail;
      });

      totalOk -= lost;
    }
  };

  const mix = Object.entries(scenario.mix) as [TrafficClass, number][];
  const audience = Object.entries(scenario.audience) as [Region, number][];

  for (t = 0; t < TICKS; t += 1) {
    scaleGroups();

    const wave = 1 + 0.08 * Math.sin(t / 3);
    // The sale ramps up over six ticks, so Auto Scaling has a chance to follow.
    const saleStart = Math.ceil(TWIST_WINDOW.flashSale[0] * TICKS);
    const surge = inWindow(twist, 'flashSale', t) ? 1 + 2 * Math.min(1, (t - saleStart + 1) / 6) : 1;
    const growth = twist === 'viral' ? 1 + (3 * t) / TICKS : 1;
    const traffic = scenario.traffic * wave * surge * growth;
    const attack = inWindow(twist, 'ddos', t) ? scenario.traffic * 6 : 0;
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
            report(entries.length === 0 ? 'users_unconnected' : (NOWHERE[cls] ?? 'users_unconnected'), users?.id, rate);
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
        own.util = cap === Number.POSITIVE_INFINITY ? 0 : cap <= 0 ? (own.load > 0 ? 2 : 0) : own.load / cap;
        own.drop = own.util > 1 ? 1 - 1 / own.util : 0;
      }
    }

    const nodes: Record<string, NodeTick> = {};

    for (const node of board.nodes) {
      const own = state(node.id);
      const instances = own.instances.a + own.instances.b;

      if (node.type === 'ec2') {
        own.instanceTicks += instances + own.pending.length;
      }

      if (node.type === 'lambda') {
        own.prevRate = own.load;
      }

      nodes[node.id] = {
        util: Math.min(own.util, 2),
        alive: alive(node),
        instances: node.type === 'ec2' ? Math.round(instances * aliveFraction(node)) : undefined,
        backlog: node.type === 'sqs' ? own.backlog : undefined,
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
      twistActive: twist ? inWindow(twist, twist, t) && twist !== 'viral' : false,
      nodes,
    });
  }

  // Leftover backlog: jobs nobody processed.
  const queued = board.nodes.filter((node) => node.type === 'sqs');

  for (const queue of queued) {
    const own = state(queue.id);
    const enqueued = own.handled;
    const consumers = (children.get(queue.id) ?? []).filter((child) => COMPUTE_TYPES.has(child.type));

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

    if (node.type === 'ec2') {
      const avgInstances = own.instanceTicks / TICKS;
      const base = Math.min(avgInstances, node.config.count);
      const extraInstances = Math.max(0, avgInstances - base);
      const factor = PRICING_FACTOR[node.config.pricing];
      const burstFactor = node.config.pricing === 'reserved' ? 1 : factor;

      price += sized * (base * factor + extraInstances * burstFactor);
    } else if (node.type === 'dynamodb') {
      price = node.config.provisioned ? sized : price;
    } else if (node.type === 'rds' || node.type === 'elasticache') {
      price += sized * (node.config.multiAz ? 2 : 1);
    } else {
      price += sized;
    }

    if (node.type === 'lambda' && node.config.provisioned) {
      price += PROVISIONED_CONCURRENCY_PRICE;
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
            (DATABASE_TYPES.has(node.type) || node.type === 'elasticache') &&
            (parents.get(node.id) ?? []).some(
              (parent) => !COMPUTE_TYPES.has(parent.type) && parent.type !== 'elasticache',
            ),
        );

        for (const node of exposed) {
          report('public_data', node.id, 1);
        }

        return exposed.length === 0;
      }
      case 'noPublicServers': {
        const exposed = board.nodes.filter(
          (node) =>
            node.type === 'ec2' &&
            (parents.get(node.id) ?? []).some((parent) =>
              ['users', 'route53', 'globalAccelerator'].includes(parent.type),
            ),
        );

        for (const node of exposed) {
          report('public_server', node.id, 1);
        }

        return exposed.length === 0;
      }
      case 'fanOut': {
        const ok = board.nodes.some(
          (node) =>
            node.type === 'sns' &&
            (children.get(node.id) ?? []).filter(
              (child) =>
                child.type === 'sqs' &&
                (children.get(child.id) ?? []).some((consumer) => COMPUTE_TYPES.has(consumer.type)),
            ).length >= 2,
        );

        if (!ok) {
          report('no_fan_out', board.nodes.find((node) => node.type === 'sns')?.id, 1);
        }

        return ok;
      }
      case 'drainQueue':
        return !queued.some((queue) => {
          const own = state(queue.id);

          return own.handled > 0 && own.backlog > own.handled * 0.05;
        });
    }
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
      (best, node) => (!best || (costByNode[node.id] ?? 0) > (costByNode[best.id] ?? 0) ? node : best),
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
      requirements: requirementChecks,
    },
    passed: answeredOk && latencyOk && costOk && requirementChecks.every((check) => check.ok),
  };
};
