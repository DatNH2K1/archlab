import { describe, expect, it } from 'vitest';
import { canAdd, canConnect, makeBoard } from './board';

const board = makeBoard(
  [
    ['users', 'users', 0, 0],
    ['lb', 'alb', 0, 0],
    ['web', 'ec2', 0, 0],
    ['db', 'rds', 0, 0],
    ['dns', 'route53', 0, 0],
  ],
  [['users', 'lb']],
);

describe('canConnect', () => {
  it('allows links that exist in AWS', () => {
    expect(canConnect(board, 'lb', 'web')).toBe(true);
    expect(canConnect(board, 'web', 'db')).toBe(true);
  });

  it('rejects users linked straight to a database', () => {
    expect(canConnect(board, 'users', 'db')).toBe(false);
  });

  it('rejects an ALB linked to a database', () => {
    expect(canConnect(board, 'lb', 'db')).toBe(false);
  });

  it('rejects a link that already exists', () => {
    expect(canConnect(board, 'users', 'lb')).toBe(false);
  });
});

describe('canAdd', () => {
  it('limits global entry points to one', () => {
    expect(canAdd(board, 'route53')).toBe(false);
  });

  it('allows any number of servers', () => {
    expect(canAdd(board, 'ec2')).toBe(true);
  });
});
