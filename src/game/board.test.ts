import { describe, expect, it } from 'vitest';
import { canAdd, canConnect, makeBoard } from './board';
import { ComponentType } from './types';

const board = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
    { id: 'lb', type: ComponentType.Alb, x: 0, y: 0 },
    { id: 'web', type: ComponentType.Ec2, x: 0, y: 0 },
    { id: 'db', type: ComponentType.Rds, x: 0, y: 0 },
    { id: 'dns', type: ComponentType.Route53, x: 0, y: 0 },
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
    expect(canAdd(board, ComponentType.Route53)).toBe(false);
  });

  it('allows any number of servers', () => {
    expect(canAdd(board, ComponentType.Ec2)).toBe(true);
  });

  it('refuses a second database that takes writes', () => {
    expect(canAdd(board, ComponentType.Rds)).toBe(false);
    expect(canAdd(board, ComponentType.Aurora)).toBe(false);
    expect(canAdd(board, ComponentType.DynamoDb)).toBe(false);
  });

  it('allows Read Replicas next to the write database', () => {
    expect(canAdd(board, ComponentType.ReadReplica)).toBe(true);
  });
});
