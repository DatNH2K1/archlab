import { defaultConfig, LINKS, MAX_PER_BOARD, WRITE_DATABASE_TYPES } from './catalog';
import { ComponentType } from './types';
import type { Board, BoardNode, NodeConfig } from './types';

/**
 * Creates a unique id for a node or an edge.
 * @param prefix A readable prefix.
 * @returns A new id.
 */
export const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Creates a board node with default settings.
 * @param options Type, position and setting overrides of the node.
 * @returns The new node.
 */
export const createNode = (options: {
  type: ComponentType;
  x: number;
  y: number;
  id?: string;
  config?: Partial<NodeConfig>;
}): BoardNode => ({
  id: options.id ?? newId(options.type),
  type: options.type,
  x: options.x,
  y: options.y,
  config: { ...defaultConfig(options.type), ...options.config },
});

/** A node of a starter or reference design. */
export type NodeSpec<Id extends string = string> = {
  id: Id;
  type: ComponentType;
  x: number;
  y: number;
  config?: Partial<NodeConfig>;
};

/**
 * Builds a board from a compact description, used for starters and reference designs.
 * @param nodes The nodes; their ids are the only ids edges may use.
 * @param edges Edges as [from, to] node ids.
 * @returns The board.
 */
export const makeBoard = <const Id extends string>(nodes: NodeSpec<Id>[], edges: (readonly [NoInfer<Id>, NoInfer<Id>])[]): Board => ({
  nodes: nodes.map((node) => createNode(node)),
  edges: edges.map(([from, to]) => ({ id: `${from}->${to}`, from, to })),
});

/** The board every round starts from: only the users. */
export const emptyBoard = (): Board => makeBoard([{ id: 'users', type: ComponentType.Users, x: 80, y: 240 }], []);

/**
 * Checks whether an edge can be added between two nodes.
 * @param board The current board.
 * @param from Source node id.
 * @param to Target node id.
 * @returns True when the edge is new and valid.
 */
export const canConnect = (board: Board, from: string, to: string) => {
  if (from === to) {
    return false;
  }

  const source = board.nodes.find((node) => node.id === from);
  const target = board.nodes.find((node) => node.id === to);

  if (!source || !target || !LINKS[source.type].includes(target.type)) {
    return false;
  }

  return !board.edges.some((edge) => edge.from === from && edge.to === to);
};

/**
 * Checks whether one more component of a type fits on the board.
 * @param board The current board.
 * @param type The component type to add.
 * @returns True when the type is under its limit and the board has no write database yet when adding one.
 */
export const canAdd = (board: Board, type: ComponentType) => {
  if (WRITE_DATABASE_TYPES.has(type) && board.nodes.some((node) => WRITE_DATABASE_TYPES.has(node.type))) {
    return false;
  }

  return board.nodes.filter((node) => node.type === type).length < (MAX_PER_BOARD[type] ?? Number.POSITIVE_INFINITY);
};

/**
 * Takes the nodes to copy and the edges between them; the users are left out.
 * @param board The current board.
 * @param ids Ids of the nodes to copy.
 * @returns The copied part of the board.
 */
export const copyNodes = (board: Board, ids: string[]): Board => {
  const picked = new Set(ids);
  const nodes = board.nodes.filter((node) => picked.has(node.id) && node.type !== ComponentType.Users);
  const kept = new Set(nodes.map((node) => node.id));

  return {
    nodes,
    edges: board.edges.filter((edge) => kept.has(edge.from) && kept.has(edge.to)),
  };
};

/**
 * Removes nodes and their edges; the users always stay.
 * @param board The current board.
 * @param ids Ids of the nodes to remove.
 * @returns The board without those nodes.
 */
export const removeNodes = (board: Board, ids: string[]): Board => {
  const removed = new Set(
    board.nodes.filter((node) => ids.includes(node.id) && node.type !== ComponentType.Users).map((node) => node.id),
  );

  return {
    nodes: board.nodes.filter((node) => !removed.has(node.id)),
    edges: board.edges.filter((edge) => !removed.has(edge.from) && !removed.has(edge.to)),
  };
};

/**
 * Pastes copied nodes with new ids, skipping those over a board limit.
 * @param board The current board.
 * @param clip Nodes and edges from {@link copyNodes}.
 * @param offset How far to shift the pasted nodes.
 * @returns The new board, the ids of the pasted nodes and how many were skipped.
 */
export const pasteNodes = (board: Board, clip: Board, offset: { x: number; y: number }) => {
  const ids = new Map<string, string>();
  let next = board;

  for (const node of clip.nodes) {
    if (canAdd(next, node.type)) {
      const id = newId(node.type);

      ids.set(node.id, id);
      next = { ...next, nodes: [...next.nodes, { ...node, id, x: node.x + offset.x, y: node.y + offset.y }] };
    }
  }

  for (const edge of clip.edges) {
    const from = ids.get(edge.from);
    const to = ids.get(edge.to);

    if (from && to && canConnect(next, from, to)) {
      next = { ...next, edges: [...next.edges, { id: newId('edge'), from, to }] };
    }
  }

  return { board: next, ids: [...ids.values()], skipped: clip.nodes.length - ids.size };
};
