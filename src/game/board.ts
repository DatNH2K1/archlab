import { defaultConfig } from './catalog';
import type { Board, BoardNode, ComponentType, NodeConfig } from './types';

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

type NodeSpec = [id: string, type: ComponentType, x: number, y: number, config?: Partial<NodeConfig>];

/**
 * Builds a board from a compact description, used for starters and reference designs.
 * @param nodes Nodes as [id, type, x, y, config].
 * @param edges Edges as [from, to].
 * @returns The board.
 */
export const makeBoard = (nodes: NodeSpec[], edges: [string, string][]): Board => ({
  nodes: nodes.map(([id, type, x, y, config]) => createNode({ id, type, x, y, config })),
  edges: edges.map(([from, to]) => ({ id: `${from}->${to}`, from, to })),
});

/** The board every round starts from: only the users. */
export const emptyBoard = (): Board => makeBoard([['users', 'users', 80, 240]], []);

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

  const target = board.nodes.find((node) => node.id === to);

  if (!target || target.type === 'users') {
    return false;
  }

  return !board.edges.some((edge) => edge.from === from && edge.to === to);
};
