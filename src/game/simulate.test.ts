import { describe, expect, it } from 'vitest';
import { makeBoard } from './board';
import { simulate } from './simulate';
import type { Scenario } from './types';

const scenario: Scenario = { traffic: 100, mix: { read: 0.7, write: 0.3 }, audience: { 'us-east-1': 1 }, latencyTarget: 300, requirements: [] };

describe('simulate', () => {
  it('reports users that reach nothing', () => {
    const result = simulate(makeBoard([['users', 'users', 0, 0]], []), scenario);

    expect(result.answered).toBe(0);
    expect(result.issues[0]?.code).toBe('users_unconnected');
  });

  it('reports reads with nowhere to go', () => {
    const board = makeBoard(
      [
        ['users', 'users', 0, 0],
        ['web', 'ec2', 0, 0],
      ],
      [['users', 'web']],
    );

    expect(simulate(board, scenario).issues.map((issue) => issue.code)).toContain('nowhere_read');
  });

  it('drops requests on an overloaded server', () => {
    const board = makeBoard(
      [
        ['users', 'users', 0, 0],
        ['web', 'ec2', 0, 0],
        ['db', 'dynamodb', 0, 0],
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
        ['users', 'users', 0, 0],
        ['web', 'ec2', 0, 0],
        ['replica', 'readReplica', 0, 0],
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
        ['users', 'users', 0, 0],
        ['a', 'alb', 0, 0],
        ['b', 'alb', 0, 0],
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
        ['users', 'users', 0, 0],
        ['fn', 'lambda', 0, 0],
        ['db', 'dynamodb', 0, 0],
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
        ['users', 'users', 0, 0],
        ['web', 'ec2', 0, 0, { count: 3 }],
        ['db', 'dynamodb', 0, 0],
      ],
      [
        ['users', 'web'],
        ['web', 'db'],
      ],
    );
    const balanced = makeBoard(
      [
        ['users', 'users', 0, 0],
        ['lb', 'alb', 0, 0],
        ['web', 'ec2', 0, 0, { count: 3 }],
        ['db', 'dynamodb', 0, 0],
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
        ['users', 'users', 0, 0],
        ['fn', 'lambda', 0, 0],
        ['db', 'dynamodb', 0, 0],
        ['spare', 'ec2', 0, 0],
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
    const standby = (options: { db: 'rds' | 'aurora' | 'dynamodb'; globalDb: boolean }) =>
      makeBoard(
        [
          ['users', 'users', 0, 0],
          ['dns', 'route53', 0, 0],
          ['lb1', 'alb', 0, 0],
          ['web1', 'ec2', 0, 0, { size: 'medium' }],
          ['lb2', 'alb', 0, 0, { region: 'eu-west-1' }],
          ['web2', 'ec2', 0, 0, { size: 'medium', region: 'eu-west-1' }],
          ['db', options.db, 0, 0, { size: 'medium', globalDb: options.globalDb }],
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
    const outage: Scenario = { ...scenario, twist: 'regionOutage', outageRegion: 'us-east-1' };

    it('fails when the only database lives in the Region that goes down', () => {
      const result = simulate(standby({ db: 'rds', globalDb: false }), outage);

      expect(result.passed).toBe(false);
      expect(result.issues.map((issue) => issue.code)).toContain('db_region_down');
    });

    it('moves Aurora Global Database writes to the other Region for good', () => {
      const result = simulate(standby({ db: 'aurora', globalDb: true }), outage);

      expect(result.passed).toBe(true);
      expect(result.ticks.at(-1)?.nodes.db?.primaryRegion).toBe('eu-west-1');
    });

    it('keeps a DynamoDB global table writing in both Regions without failover', () => {
      const result = simulate(standby({ db: 'dynamodb', globalDb: true }), outage);

      expect(result.passed).toBe(true);
      expect(result.ticks.at(-1)?.nodes.db?.primaryRegion).toBeUndefined();
    });

    it('bills a global database twice', () => {
      const single = simulate(standby({ db: 'aurora', globalDb: false }), scenario).costByNode.db ?? 0;
      const global = simulate(standby({ db: 'aurora', globalDb: true }), scenario).costByNode.db ?? 0;

      expect(global).toBe(single * 2);
    });
  });

  it('rejects writes to a cross-Region Read Replica', () => {
    const board = makeBoard(
      [
        ['users', 'users', 0, 0],
        ['web', 'ec2', 0, 0, { region: 'eu-west-1' }],
        ['db', 'rds', 0, 0],
        ['copy', 'readReplica', 0, 0, { region: 'eu-west-1' }],
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
          ['users', 'users', 0, 0],
          ['files', 's3', 0, 0],
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
          ['users', 'users', 0, 0],
          ['cdn', 'cloudfront', 0, 0],
          ['files', 's3', 0, 0],
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
          ['users', 'users', 0, 0],
          ['api', 'apiGateway', 0, 0],
          ['fn', 'lambda', 0, 0],
          ['db', 'dynamodb', 0, 0],
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
          ['users', 'users', 0, 0],
          ['shield', 'waf', 0, 0],
          ['api', 'apiGateway', 0, 0],
          ['fn', 'lambda', 0, 0],
          ['db', 'dynamodb', 0, 0],
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
