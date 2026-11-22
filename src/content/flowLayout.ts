import type { Diagram, DiagramNode } from './diagrams';

type FlowRows = Extract<Diagram, { kind: 'flow' }>['rows'];

/**
 * A node on the grid; a node without `label` is a bend point that carries a long edge across a column.
 * `slot` is the centre of its lane and may sit halfway between two lanes, so a parent is centred on its branches.
 */
export type FlowCell = { id: number; label?: string; note?: string; rank: number; slot: number; incoming: boolean };

/** An edge between two neighbouring columns. */
export type FlowSegment = { from: number; to: number; labels: string[] };

/** The straight part of the edges entering a lane of a column, or a lone spot for their labels. */
export type FlowEnd = { rank: number; slot: number; labels: string[]; line: boolean; arrow: boolean };

export type FlowLayout = { cells: FlowCell[]; segments: FlowSegment[]; ends: FlowEnd[]; ranks: number; slots: number };

type Edge = { from: number; to: number; labels: string[] };

const reaches = (children: number[][], from: number, target: number): boolean =>
  from === target || children[from]!.some((child) => reaches(children, child, target));

/**
 * Joins the chains of a flow into one graph: a node repeated on a later line is the same node,
 * unless its note differs or reusing it would loop back.
 */
const buildGraph = (rows: FlowRows) => {
  const nodes: DiagramNode[] = [];
  const children: number[][] = [];
  const edges: Edge[] = [];

  const addEdge = (from: number, to: number, label: string | undefined) => {
    const existing = edges.find((edge) => edge.from === from && edge.to === to);
    const labels = label ? [label] : [];

    if (existing) {
      existing.labels.push(...labels);
    } else {
      edges.push({ from, to, labels });
      children[from]!.push(to);
    }
  };

  for (const row of rows) {
    let prev: number | undefined;

    row.nodes.forEach((node, i) => {
      let id = nodes.findIndex(
        (other, j) =>
          other.label === node.label &&
          (node.note === undefined || node.note === other.note) &&
          (prev === undefined || !reaches(children, j, prev)),
      );

      if (id === -1) {
        id = nodes.push(node) - 1;
        children.push([]);
      }

      if (prev !== undefined) {
        addEdge(prev, id, row.edges[i - 1]);
      }

      prev = id;
    });
  }

  return { nodes, children, edges };
};

/** Puts each node one column after its furthest parent, then pulls start nodes next to their first child. */
const rankNodes = (graph: ReturnType<typeof buildGraph>) => {
  const ranks = graph.nodes.map(() => 0);
  const hasParent = graph.nodes.map((_, id) => graph.edges.some((edge) => edge.to === id));
  const visit = (id: number) => {
    for (const child of graph.children[id]!) {
      if (ranks[child]! < ranks[id]! + 1) {
        ranks[child] = ranks[id]! + 1;
        visit(child);
      }
    }
  };

  graph.nodes.forEach((_, id) => !hasParent[id] && visit(id));
  graph.nodes.forEach((_, id) => {
    if (!hasParent[id] && graph.children[id]!.length > 0) {
      ranks[id] = Math.min(...graph.children[id]!.map((child) => ranks[child]!)) - 1;
    }
  });

  const min = Math.min(...ranks);

  return ranks.map((rank) => rank - min);
};

/**
 * Puts each edge label above the line entering its target. When several labelled edges meet at one target,
 * a label moves to its own lane at the start of the curve, so they do not pile up.
 */
const endsOf = (cells: FlowCell[], segments: FlowSegment[]) => {
  const ends: FlowEnd[] = cells
    .filter((cell) => cell.incoming)
    .map((cell) => ({ rank: cell.rank, slot: cell.slot, labels: [], line: true, arrow: cell.label !== undefined }));
  const endAt = (rank: number, slot: number) => ends.find((end) => end.rank === rank && end.slot === slot);
  const clash = (rank: number, slot: number) => ends.some((end) => end.rank === rank && Math.abs(end.slot - slot) < 1);

  for (const segment of segments) {
    const from = cells[segment.from]!;
    const to = cells[segment.to]!;
    const crowded = segments.filter((other) => other.to === segment.to && other.labels.length > 0).length > 1;
    const own = crowded && from.slot !== to.slot && !clash(to.rank, from.slot);

    if (own) {
      ends.push({ rank: to.rank, slot: from.slot, labels: [...segment.labels], line: false, arrow: false });
    } else {
      endAt(to.rank, to.slot)!.labels.push(...segment.labels);
    }
  }

  return ends;
};

/**
 * Lays a flow out on a grid of columns (steps) and lanes, so that branches fork into their own lanes.
 * @param rows The parsed chains of the flow.
 * @returns The cells and the edges between neighbouring columns.
 */
export const layoutFlow = (rows: FlowRows): FlowLayout => {
  const graph = buildGraph(rows);
  const ranks = rankNodes(graph);
  const cells: FlowCell[] = graph.nodes.map((node, id) => ({
    id,
    label: node.label,
    note: node.note,
    rank: ranks[id]!,
    slot: 0,
    incoming: false,
  }));
  const segments: FlowSegment[] = [];

  // Long edges are split into one segment per column, through unlabeled bend points.
  for (const edge of graph.edges) {
    let from = edge.from;

    for (let rank = ranks[edge.from]! + 1; rank < ranks[edge.to]!; rank++) {
      const bend = cells.push({ id: cells.length, rank, slot: 0, incoming: true }) - 1;

      segments.push({ from, to: bend, labels: from === edge.from ? edge.labels : [] });
      from = bend;
    }

    segments.push({ from, to: edge.to, labels: from === edge.from ? edge.labels : [] });
    cells[edge.to]!.incoming = true;
  }

  // Each cell follows its first parent: leaves take new lanes from the top, and a parent sits centred on its children.
  const firstParent = new Map<number, number>();

  for (const segment of segments) {
    if (!firstParent.has(segment.to)) {
      firstParent.set(segment.to, segment.from);
    }
  }

  let nextSlot = 0;
  const placed = new Set<number>();
  const taken = (rank: number, slot: number) =>
    cells.some((cell) => placed.has(cell.id) && cell.rank === rank && Math.abs(cell.slot - slot) < 1);
  const place = (id: number): number => {
    const kids = segments.filter((segment) => segment.from === id && firstParent.get(segment.to) === id).map((segment) => segment.to);
    const slots = kids.map(place);
    const cell = cells[id]!;

    if (slots.length > 0) {
      // Snapped to half a lane, the finest step the grid draws.
      cell.slot = Math.round(slots[0]! + slots.at(-1)!) / 2;
    } else {
      // A start node whose children sit in other lanes takes the free lane closest to its first child.
      const target = firstParent.has(id) ? undefined : segments.find((segment) => segment.from === id);
      const near = target ? cells[target.to]!.slot : nextSlot;
      const free = Array.from({ length: nextSlot * 2 - 1 }, (_, half) => half / 2)
        .filter((slot) => !taken(cell.rank, slot))
        .toSorted((a, b) => Math.abs(a - near) - Math.abs(b - near))[0];

      cell.slot = target && free !== undefined ? free : nextSlot++;
    }

    placed.add(id);

    return cell.slot;
  };

  const roots = cells.filter((cell) => !firstParent.has(cell.id));

  roots.forEach((cell) => place(cell.id));

  // Start nodes that feed the same node are spread evenly around it, when that does not overlap anything.
  const firstChild = (cell: FlowCell) => segments.find((segment) => segment.from === cell.id)?.to;

  for (const target of new Set(roots.map(firstChild))) {
    const group = roots.filter((cell) => firstChild(cell) === target);

    if (target === undefined || group.length < 2) {
      continue;
    }

    const centre = cells[target]!.slot;

    const wanted = group.map((_, i) => centre + i - (group.length - 1) / 2);
    const fits = wanted.every((slot, i) =>
      cells.every((other) => group.includes(other) || other.rank !== group[i]!.rank || Math.abs(other.slot - slot) >= 1),
    );

    if (fits) {
      group.forEach((cell, i) => (cell.slot = wanted[i]!));
    }
  }

  const top = Math.min(...cells.map((cell) => cell.slot));

  cells.forEach((cell) => (cell.slot -= top));

  return {
    cells,
    segments,
    ends: endsOf(cells, segments),
    ranks: Math.max(...cells.map((cell) => cell.rank)) + 1,
    slots: Math.max(...cells.map((cell) => cell.slot)) + 1,
  };
};
