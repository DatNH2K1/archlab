'use client';

import { useEffect, useRef, useState } from 'react';
import { CATALOG } from '@/game/catalog';
import type { Board, BoardNode, TickSample } from '@/game/types';
import type { Side } from './NodeBox';
import { dotPosition, NodeBox, nodeSize } from './NodeBox';

export type View = { x: number; y: number; zoom: number };

export type Selection = { kind: 'nodes'; ids: string[] } | { kind: 'edge'; id: string } | null;

type Box = { x1: number; y1: number; x2: number; y2: number };

const SNAP = 10;
const snap = (value: number) => Math.round(value / SNAP) * SNAP;

const OFFSET: Record<Side, { x: number; y: number }> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

/** Picks the sides that face each other for an edge between two nodes. */
const facingSides = (from: BoardNode, to: BoardNode): [Side, Side] => {
  const a = nodeSize(from);
  const b = nodeSize(to);
  const dx = to.x + b.w / 2 - (from.x + a.w / 2);
  const dy = to.y + b.h / 2 - (from.y + a.h / 2);

  if (Math.abs(dx) * 0.6 >= Math.abs(dy)) {
    return dx >= 0 ? ['right', 'left'] : ['left', 'right'];
  }

  return dy >= 0 ? ['bottom', 'top'] : ['top', 'bottom'];
};

const curve = (
  start: { x: number; y: number },
  startSide: Side,
  end: { x: number; y: number },
  endSide: Side,
) => {
  const bend = Math.max(40, Math.hypot(end.x - start.x, end.y - start.y) / 3);
  const c1 = { x: start.x + OFFSET[startSide].x * bend, y: start.y + OFFSET[startSide].y * bend };
  const c2 = { x: end.x + OFFSET[endSide].x * bend, y: end.y + OFFSET[endSide].y * bend };

  return `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
};

const edgeTone = (live: TickSample | undefined, targetId: string) => {
  const state = live?.nodes[targetId];

  if (!state) {
    return 'stroke-chalk/70';
  }

  if (!state.alive || state.util >= 1) {
    return 'stroke-bad';
  }

  return state.util >= 0.75 ? 'stroke-warn' : 'stroke-good';
};

/**
 * The pannable, zoomable drawing board with nodes and connections.
 * @param props Board data, view, selection and change handlers.
 */
export const BoardCanvas = (props: {
  board: Board;
  view: View;
  onViewChange: (view: View) => void;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  onMoveStart: () => void;
  onMove: (moves: { id: string; x: number; y: number }[]) => void;
  /** Opens the board menu at a screen point. */
  onMenu: (clientX: number, clientY: number) => void;
  onConnect: (from: string, to: string) => void;
  canLink: (from: string, to: string) => boolean;
  live?: TickSample;
  failingId?: string;
  locked: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const [wire, setWire] = useState<{ from: string; side: Side; x: number; y: number } | null>(null);
  const [box, setBox] = useState<Box | null>(null);
  const selectedIds = props.selection?.kind === 'nodes' ? props.selection.ids : [];
  const viewRef = useRef(props.view);
  const onViewChange = useRef(props.onViewChange);

  viewRef.current = props.view;
  onViewChange.current = props.onViewChange;

  // Wheel needs a non-passive listener so Ctrl+scroll zooms the board instead of the page.
  useEffect(() => {
    const element = props.containerRef.current;

    if (!element) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const view = viewRef.current;

      if (event.ctrlKey || event.metaKey) {
        const rect = element.getBoundingClientRect();
        const zoom = Math.min(2, Math.max(0.3, view.zoom * Math.exp(-event.deltaY * 0.01)));
        const px = event.clientX - rect.left;
        const py = event.clientY - rect.top;

        onViewChange.current({
          zoom,
          x: px - ((px - view.x) / view.zoom) * zoom,
          y: py - ((py - view.y) / view.zoom) * zoom,
        });
      } else {
        onViewChange.current({ ...view, x: view.x - event.deltaX, y: view.y - event.deltaY });
      }
    };

    element.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', onWheel);
    };
  }, [props.containerRef]);

  const toBoard = (clientX: number, clientY: number) => {
    const rect = props.containerRef.current?.getBoundingClientRect();
    const view = viewRef.current;

    return {
      x: (clientX - (rect?.left ?? 0) - view.x) / view.zoom,
      y: (clientY - (rect?.top ?? 0) - view.y) / view.zoom,
    };
  };

  const track = (onMove: (event: PointerEvent) => void, onUp: (event: PointerEvent) => void) => {
    const up = (event: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', up);
      onUp(event);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', up);
  };

  /** Right-drag marks an area and selects the nodes it touches; a plain right click opens the menu. */
  const startMarquee = (event: React.PointerEvent) => {
    const origin = toBoard(event.clientX, event.clientY);
    let moved = false;

    track(
      (move) => {
        const point = toBoard(move.clientX, move.clientY);

        moved ||= Math.abs(move.clientX - event.clientX) + Math.abs(move.clientY - event.clientY) > 4;

        if (moved) {
          setBox({ x1: origin.x, y1: origin.y, x2: point.x, y2: point.y });
        }
      },
      (up) => {
        setBox(null);

        if (moved) {
          const end = toBoard(up.clientX, up.clientY);
          const [left, right] = [Math.min(origin.x, end.x), Math.max(origin.x, end.x)];
          const [top, bottom] = [Math.min(origin.y, end.y), Math.max(origin.y, end.y)];
          const ids = props.board.nodes
            .filter((node) => {
              const size = nodeSize(node);

              return node.x < right && node.x + size.w > left && node.y < bottom && node.y + size.h > top;
            })
            .map((node) => node.id);

          props.onSelect(ids.length > 0 ? { kind: 'nodes', ids } : null);

          if (ids.length === 0) {
            return;
          }
        }

        props.onMenu(up.clientX, up.clientY);
      },
    );
  };

  const startPan = (event: React.PointerEvent) => {
    if (event.button === 2) {
      startMarquee(event);

      return;
    }

    if (event.button !== 0) {
      return;
    }

    const start = { x: event.clientX, y: event.clientY, view: props.view };
    let moved = false;

    track(
      (move) => {
        const dx = move.clientX - start.x;
        const dy = move.clientY - start.y;

        if (Math.abs(dx) + Math.abs(dy) > 3) {
          moved = true;
        }

        onViewChange.current({ ...start.view, x: start.view.x + dx, y: start.view.y + dy });
      },
      () => {
        if (!moved) {
          props.onSelect(null);
        }
      },
    );
  };

  const startNodeDrag = (event: React.PointerEvent, node: BoardNode) => {
    event.stopPropagation();
    const inSelection = selectedIds.includes(node.id);

    if (event.button === 2) {
      if (!inSelection) {
        props.onSelect({ kind: 'nodes', ids: [node.id] });
      }

      props.onMenu(event.clientX, event.clientY);

      return;
    }

    if (event.button !== 0) {
      return;
    }

    if (event.shiftKey) {
      const ids = inSelection ? selectedIds.filter((id) => id !== node.id) : [...selectedIds, node.id];

      props.onSelect(ids.length > 0 ? { kind: 'nodes', ids } : null);

      return;
    }

    if (props.locked) {
      props.onSelect({ kind: 'nodes', ids: [node.id] });

      return;
    }

    const start = { x: event.clientX, y: event.clientY };
    // Dragging a node of the selection moves the whole selection.
    const group = props.board.nodes.filter((item) =>
      inSelection ? selectedIds.includes(item.id) : item.id === node.id,
    );
    let moved = false;

    track(
      (move) => {
        const dx = (move.clientX - start.x) / viewRef.current.zoom;
        const dy = (move.clientY - start.y) / viewRef.current.zoom;

        if (!moved && Math.abs(dx) + Math.abs(dy) > 4) {
          moved = true;
          props.onMoveStart();
        }

        if (moved) {
          props.onMove(group.map((item) => ({ id: item.id, x: snap(item.x + dx), y: snap(item.y + dy) })));
        }
      },
      () => {
        if (!moved) {
          props.onSelect({ kind: 'nodes', ids: [node.id] });
        }
      },
    );
  };

  const startWire = (event: React.PointerEvent, node: BoardNode, side: Side) => {
    event.stopPropagation();

    if (props.locked) {
      return;
    }

    const origin = toBoard(event.clientX, event.clientY);

    setWire({ from: node.id, side, ...origin });
    track(
      (move) => {
        setWire({ from: node.id, side, ...toBoard(move.clientX, move.clientY) });
      },
      (up) => {
        setWire(null);
        const hit = document.elementFromPoint(up.clientX, up.clientY)?.closest('[data-node-id]');
        const target =
          hit instanceof HTMLElement
            ? hit.dataset.nodeId
            : (hit?.getAttribute('data-node-id') ?? undefined);

        if (target && target !== node.id) {
          props.onConnect(node.id, target);
        }
      },
    );
  };

  const byId = new Map(props.board.nodes.map((node) => [node.id, node]));
  const regions = new Set(
    props.board.nodes
      .filter((node) => CATALOG[node.type].fields.includes('region'))
      .map((node) => node.config.region),
  );
  const wireFrom = wire ? byId.get(wire.from) : undefined;

  return (
    <div
      ref={props.containerRef}
      className="dot-grid absolute inset-0 touch-none overflow-hidden"
      style={{
        backgroundSize: `${22 * props.view.zoom}px ${22 * props.view.zoom}px`,
        backgroundPosition: `${props.view.x}px ${props.view.y}px`,
      }}
      onPointerDown={startPan}
      onContextMenu={(event) => {
        event.preventDefault();
      }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          transform: `translate(${props.view.x}px, ${props.view.y}px) scale(${props.view.zoom})`,
        }}
      >
        <svg
          className="absolute top-0 left-0 overflow-visible"
          width="1"
          height="1"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path
                d="M 0 1 L 9 5 L 0 9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-chalk"
              />
            </marker>
          </defs>
          {props.board.edges.map((edge) => {
            const from = byId.get(edge.from);
            const to = byId.get(edge.to);

            if (!from || !to) {
              return null;
            }

            const [a, b] = facingSides(from, to);
            const d = curve(dotPosition(from, a), a, dotPosition(to, b), b);
            const selected = props.selection?.kind === 'edge' && props.selection.id === edge.id;

            return (
              <g key={edge.id}>
                <path
                  d={d}
                  stroke="transparent"
                  strokeWidth="14"
                  fill="none"
                  className="pointer-events-auto cursor-pointer"
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    props.onSelect({ kind: 'edge', id: edge.id });

                    if (event.button === 2) {
                      props.onMenu(event.clientX, event.clientY);
                    }
                  }}
                />
                <path
                  d={d}
                  fill="none"
                  strokeWidth={selected ? 3 : 1.8}
                  markerEnd="url(#arrow)"
                  className={`pointer-events-none ${selected ? 'stroke-accent' : edgeTone(props.live, to.id)} ${
                    props.live?.nodes[from.id] && props.live.nodes[to.id] ? 'edge-flow' : ''
                  }`}
                />
              </g>
            );
          })}
          {wire && wireFrom && (
            <path
              d={curve(dotPosition(wireFrom, wire.side), wire.side, wire, wire.side)}
              fill="none"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="stroke-accent"
            />
          )}
        </svg>
        {props.board.nodes.map((node) => (
          <NodeBox
            key={node.id}
            node={node}
            selected={selectedIds.includes(node.id)}
            failing={props.failingId === node.id}
            live={props.live?.nodes[node.id]}
            idle={Boolean(props.live) && !props.live?.nodes[node.id]}
            dimmed={wire !== null && wire.from !== node.id && !props.canLink(wire.from, node.id)}
            showRegion={regions.size > 1}
            showDots={wire !== null}
            onPointerDown={(event) => {
              startNodeDrag(event, node);
            }}
            onDotPointerDown={(event, side) => {
              startWire(event, node, side);
            }}
          />
        ))}
        {box && (
          <div
            className="pointer-events-none absolute rounded-sm border border-accent bg-accent/10"
            style={{
              left: Math.min(box.x1, box.x2),
              top: Math.min(box.y1, box.y2),
              width: Math.abs(box.x2 - box.x1),
              height: Math.abs(box.y2 - box.y1),
            }}
          />
        )}
      </div>
    </div>
  );
};
