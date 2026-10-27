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
});
