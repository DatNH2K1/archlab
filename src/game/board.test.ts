import { describe, expect, it } from 'vitest';
import { canAdd, canConnect, copyNodes, makeBoard, pasteNodes, removeNodes } from './board';
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

describe('copyNodes', () => {
  it('keeps edges between copied nodes and leaves out the users', () => {
    const clip = copyNodes(makeBoard(board.nodes, [['users', 'lb'], ['lb', 'web']]), ['users', 'lb', 'web']);

    expect(clip.nodes.map((node) => node.id)).toEqual(['lb', 'web']);
    expect(clip.edges.map((edge) => edge.id)).toEqual(['lb->web']);
  });
});

describe('removeNodes', () => {
  it('removes nodes with their edges but keeps the users', () => {
    const next = removeNodes(board, ['users', 'lb']);

    expect(next.nodes.map((node) => node.id)).toEqual(['users', 'web', 'db', 'dns']);
    expect(next.edges).toEqual([]);
  });
});

describe('pasteNodes', () => {
  const source = makeBoard(board.nodes, [['users', 'lb'], ['lb', 'web']]);

  it('pastes shifted copies with new ids and their edges', () => {
    const pasted = pasteNodes(source, copyNodes(source, ['lb', 'web']), { x: 30, y: 40 });
    const added = pasted.board.nodes.filter((node) => pasted.ids.includes(node.id));

    expect(added.map((node) => [node.type, node.x, node.y])).toEqual([
      [ComponentType.Alb, 30, 40],
      [ComponentType.Ec2, 30, 40],
    ]);
    expect(pasted.board.edges).toHaveLength(3);
    expect(pasted.skipped).toBe(0);
  });

  it('skips nodes over a board limit', () => {
    const pasted = pasteNodes(source, copyNodes(source, ['dns', 'db', 'web']), { x: 0, y: 0 });

    expect(pasted.ids).toHaveLength(1);
    expect(pasted.skipped).toBe(2);
  });
});
