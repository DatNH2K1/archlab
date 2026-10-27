import { describe, expect, it } from 'vitest';
import { makeBoard } from './board';
import { simulate } from './simulate';
import type { Board, Scenario } from './types';

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
    const standby = (options: { db: 'rds' | 'aurora'; replicated: boolean; repointed: boolean }) =>
      makeBoard(
        [
          ['users', 'users', 0, 0],
          ['dns', 'route53', 0, 0],
          ['lb1', 'alb', 0, 0],
          ['web1', 'ec2', 0, 0, { size: 'medium' }],
          ['db1', options.db, 0, 0, { size: 'medium' }],
          ['lb2', 'alb', 0, 0, { region: 'eu-west-1' }],
          ['web2', 'ec2', 0, 0, { size: 'medium', region: 'eu-west-1' }],
          ['db2', options.db, 0, 0, { size: 'medium', region: 'eu-west-1' }],
        ],
        [
          ['users', 'dns'],
          ['dns', 'lb1'],
          ['dns', 'lb2'],
          ['lb1', 'web1'],
          ['web1', 'db1'],
          ['lb2', 'web2'],
          ['web2', 'db2'],
          ...(options.replicated ? ([['db1', 'db2']] as [string, string][]) : []),
          ...(options.repointed ? ([['web1', 'db2']] as [string, string][]) : []),
        ],
      );
    const outage: Scenario = { ...scenario, twist: 'regionOutage', outageRegion: 'us-east-1' };
    const roleAtEnd = (board: Board, id: string) => simulate(board, outage).ticks.at(-1)?.nodes[id]?.dbRole;

    it('fails when the standby database is not a replica', () => {
      const result = simulate(standby({ db: 'rds', replicated: false, repointed: false }), outage);

      expect(result.checks.integrity).toBe(false);
      expect(result.issues[0]?.code).toBe('data_split');
    });

    it('keeps the promoted replica as primary after the Region recovers', () => {
      const board = standby({ db: 'rds', replicated: true, repointed: true });

      expect(roleAtEnd(board, 'db2')).toBe('primary');
      expect(roleAtEnd(board, 'db1')).toBe('stale');
    });

    it('fails when servers keep using the old RDS primary after failover', () => {
      const result = simulate(standby({ db: 'rds', replicated: true, repointed: false }), outage);

      expect(result.checks.integrity).toBe(false);
      expect(result.issues.map((issue) => issue.code)).toContain('stale_data');
    });

    it('passes when servers switch to the promoted RDS replica', () => {
      expect(simulate(standby({ db: 'rds', replicated: true, repointed: true }), outage).passed).toBe(true);
    });

    it('adds the old Aurora primary back as a read-only copy', () => {
      const board = standby({ db: 'aurora', replicated: true, repointed: true });

      expect(roleAtEnd(board, 'db1')).toBe('replica');
      expect(simulate(board, outage).passed).toBe(true);
    });
  });

  it('rejects writes to a cross-Region replica while its primary is up', () => {
    const board = makeBoard(
      [
        ['users', 'users', 0, 0],
        ['web', 'ec2', 0, 0, { region: 'eu-west-1' }],
        ['db1', 'rds', 0, 0],
        ['db2', 'rds', 0, 0, { region: 'eu-west-1' }],
      ],
      [
        ['users', 'web'],
        ['web', 'db2'],
        ['db1', 'db2'],
      ],
    );

    expect(simulate(board, scenario).issues.map((issue) => issue.code)).toContain('replica_write');
  });
});
