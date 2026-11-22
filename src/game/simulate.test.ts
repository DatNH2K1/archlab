import { describe, expect, it } from 'vitest';
import { makeBoard } from './board';
import { simulate } from './simulate';
import { ComponentType, Twist } from './types';
import type { Scenario } from './types';

const scenario: Scenario = { traffic: 100, mix: { read: 0.7, write: 0.3 }, audience: { 'us-east-1': 1 }, latencyTarget: 300, requirements: [] };

describe('simulate', () => {
  it('reports users that reach nothing', () => {
    const result = simulate(makeBoard([{ id: 'users', type: ComponentType.Users, x: 0, y: 0 }], []), scenario);

    expect(result.answered).toBe(0);
    expect(result.issues[0]?.code).toBe('users_unconnected');
  });

  it('reports reads with nowhere to go', () => {
    const board = makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
        { id: 'web', type: ComponentType.Ec2, x: 0, y: 0 },
      ],
      [['users', 'web']],
    );

    expect(simulate(board, scenario).issues.map((issue) => issue.code)).toContain('nowhere_read');
  });

  it('drops requests on an overloaded server', () => {
    const board = makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
        { id: 'web', type: ComponentType.Ec2, x: 0, y: 0 },
        { id: 'db', type: ComponentType.DynamoDb, x: 0, y: 0 },
      ],
      [
        ['users', 'web'],
        ['web', 'db'],
      ],
    );
    const result = simulate(board, { ...scenario, traffic: 400 });

    expect(result.answered).toBeLessThan(0.6);
    expect(result.issues[0]).toMatchObject({ code: 'overloaded', nodeId: 'web' });
  });

  it('rejects writes sent only to a read replica', () => {
    const board = makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
        { id: 'web', type: ComponentType.Ec2, x: 0, y: 0 },
        { id: 'replica', type: ComponentType.ReadReplica, x: 0, y: 0 },
      ],
      [
        ['users', 'web'],
        ['web', 'replica'],
      ],
    );

    expect(simulate(board, scenario).issues.map((issue) => issue.code)).toContain('replica_write');
  });

  it('detects loops', () => {
    const board = makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
        { id: 'a', type: ComponentType.Alb, x: 0, y: 0 },
        { id: 'b', type: ComponentType.Alb, x: 0, y: 0 },
      ],
      [
        ['users', 'a'],
        ['a', 'b'],
        ['b', 'a'],
      ],
    );

    expect(simulate(board, scenario).passed).toBe(false);
  });

  it('charges Lambda by request', () => {
    const board = makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
        { id: 'fn', type: ComponentType.Lambda, x: 0, y: 0 },
        { id: 'db', type: ComponentType.DynamoDb, x: 0, y: 0 },
      ],
      [
        ['users', 'fn'],
        ['fn', 'db'],
      ],
    );
    const low = simulate(board, scenario).costByNode.fn ?? 0;
    const high = simulate(board, { ...scenario, traffic: 800 }).costByNode.fn ?? 0;

    expect(high).toBeGreaterThan(low * 6);
  });

  it('spreads load over an EC2 group only behind an ALB', () => {
    const direct = makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
        { id: 'web', type: ComponentType.Ec2, x: 0, y: 0, config: { count: 3 } },
        { id: 'db', type: ComponentType.DynamoDb, x: 0, y: 0 },
      ],
      [
        ['users', 'web'],
        ['web', 'db'],
      ],
    );
    const balanced = makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
        { id: 'lb', type: ComponentType.Alb, x: 0, y: 0 },
        { id: 'web', type: ComponentType.Ec2, x: 0, y: 0, config: { count: 3 } },
        { id: 'db', type: ComponentType.DynamoDb, x: 0, y: 0 },
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    );
    const busy = { ...scenario, traffic: 400 };

    expect(simulate(direct, busy).issues.map((issue) => issue.code)).toContain('no_balancer');
    expect(simulate(balanced, busy).passed).toBe(true);
  });

  it('leaves components users cannot reach out of the live state', () => {
    const board = makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
        { id: 'fn', type: ComponentType.Lambda, x: 0, y: 0 },
        { id: 'db', type: ComponentType.DynamoDb, x: 0, y: 0 },
        { id: 'spare', type: ComponentType.Ec2, x: 0, y: 0 },
      ],
      [
        ['users', 'fn'],
        ['fn', 'db'],
      ],
    );
    const result = simulate(board, scenario);

    expect(Object.keys(result.ticks[0]?.nodes ?? {})).toEqual(['users', 'fn', 'db']);
    expect(result.costByNode.spare).toBeGreaterThan(0);
  });

  describe('with a standby Region', () => {
    const standby = (options: { db: (typeof ComponentType)['Rds' | 'Aurora' | 'DynamoDb']; globalDb: boolean }) =>
      makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
          { id: 'dns', type: ComponentType.Route53, x: 0, y: 0 },
          { id: 'lb1', type: ComponentType.Alb, x: 0, y: 0 },
          { id: 'web1', type: ComponentType.Ec2, x: 0, y: 0, config: { size: 'medium' } },
          { id: 'lb2', type: ComponentType.Alb, x: 0, y: 0, config: { region: 'eu-west-1' } },
          { id: 'web2', type: ComponentType.Ec2, x: 0, y: 0, config: { size: 'medium', region: 'eu-west-1' } },
          { id: 'db', type: options.db, x: 0, y: 0, config: { size: 'medium', globalDb: options.globalDb } },
        ],
        [
          ['users', 'dns'],
          ['dns', 'lb1'],
          ['dns', 'lb2'],
          ['lb1', 'web1'],
          ['lb2', 'web2'],
          ['web1', 'db'],
          ['web2', 'db'],
        ],
      );
    const outage: Scenario = { ...scenario, twist: Twist.RegionOutage };

    it('fails when the only database lives in the Region that goes down', () => {
      const result = simulate(standby({ db: ComponentType.Rds, globalDb: false }), outage);

      expect(result.passed).toBe(false);
      expect(result.issues.map((issue) => issue.code)).toContain('db_region_down');
    });

    it('moves Aurora Global Database writes to the other Region for good', () => {
      const result = simulate(standby({ db: ComponentType.Aurora, globalDb: true }), outage);

      expect(result.passed).toBe(true);
      expect(result.ticks.at(-1)?.nodes.db?.primaryRegion).toBe('eu-west-1');
    });

    it('keeps a DynamoDB global table writing in both Regions without failover', () => {
      const result = simulate(standby({ db: ComponentType.DynamoDb, globalDb: true }), outage);

      expect(result.passed).toBe(true);
      expect(result.ticks.at(-1)?.nodes.db?.primaryRegion).toBeUndefined();
    });

    it('takes down the Region running the most components', () => {
      const board = standby({ db: ComponentType.Rds, globalDb: false });
      const moved = { ...board, nodes: board.nodes.map((node) => (node.id === 'db' ? { ...node, config: { ...node.config, region: 'eu-west-1' as const } } : node)) };

      expect(simulate(board, outage).outageRegion).toBe('us-east-1');
      expect(simulate(moved, outage).outageRegion).toBe('eu-west-1');
    });

    it('bills a global database twice', () => {
      const single = simulate(standby({ db: ComponentType.Aurora, globalDb: false }), scenario).costByNode.db ?? 0;
      const global = simulate(standby({ db: ComponentType.Aurora, globalDb: true }), scenario).costByNode.db ?? 0;

      expect(global).toBe(single * 2);
    });
  });

  it('rejects writes to a cross-Region Read Replica', () => {
    const board = makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
        { id: 'web', type: ComponentType.Ec2, x: 0, y: 0, config: { region: 'eu-west-1' } },
        { id: 'db', type: ComponentType.Rds, x: 0, y: 0 },
        { id: 'copy', type: ComponentType.ReadReplica, x: 0, y: 0, config: { region: 'eu-west-1' } },
      ],
      [
        ['users', 'web'],
        ['web', 'copy'],
        ['db', 'copy'],
      ],
    );

    expect(simulate(board, scenario).issues.map((issue) => issue.code)).toContain('replica_write');
  });

  describe('with security rules', () => {
    const files: Scenario = { ...scenario, mix: { static: 1 }, requirements: ['privateBucket'] };
    const api: Scenario = { ...scenario, requirements: ['webFirewall'] };

    it('reports a bucket users reach directly', () => {
      const board = makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
          { id: 'files', type: ComponentType.S3, x: 0, y: 0 },
        ],
        [['users', 'files']],
      );
      const result = simulate(board, files);

      expect(result.checks.requirements).toEqual([{ id: 'privateBucket', ok: false }]);
      expect(result.issues.map((issue) => issue.code)).toContain('public_bucket');
    });

    it('accepts a bucket behind CloudFront', () => {
      const board = makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
          { id: 'cdn', type: ComponentType.CloudFront, x: 0, y: 0 },
          { id: 'files', type: ComponentType.S3, x: 0, y: 0 },
        ],
        [
          ['users', 'cdn'],
          ['cdn', 'files'],
        ],
      );

      expect(simulate(board, files).checks.requirements).toEqual([{ id: 'privateBucket', ok: true }]);
    });

    it('reports a server reached without WAF', () => {
      const board = makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
          { id: 'api', type: ComponentType.ApiGateway, x: 0, y: 0 },
          { id: 'fn', type: ComponentType.Lambda, x: 0, y: 0 },
          { id: 'db', type: ComponentType.DynamoDb, x: 0, y: 0 },
        ],
        [
          ['users', 'api'],
          ['api', 'fn'],
          ['fn', 'db'],
        ],
      );
      const result = simulate(board, api);

      expect(result.checks.requirements).toEqual([{ id: 'webFirewall', ok: false }]);
      expect(result.issues).toContainEqual({ code: 'no_firewall', nodeId: 'fn', count: 1 });
    });

    it('accepts servers behind WAF', () => {
      const board = makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
          { id: 'shield', type: ComponentType.Waf, x: 0, y: 0 },
          { id: 'api', type: ComponentType.ApiGateway, x: 0, y: 0 },
          { id: 'fn', type: ComponentType.Lambda, x: 0, y: 0 },
          { id: 'db', type: ComponentType.DynamoDb, x: 0, y: 0 },
        ],
        [
          ['users', 'shield'],
          ['shield', 'api'],
          ['api', 'fn'],
          ['fn', 'db'],
        ],
      );

      expect(simulate(board, api).checks.requirements).toEqual([{ id: 'webFirewall', ok: true }]);
    });
  });
});
