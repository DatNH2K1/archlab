'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { AppMenu } from '@/components/AppMenu';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { canConnect, createNode, emptyBoard, newId } from '@/game/board';
import { CATALOG, COMPONENT_TYPES_IN_PALETTE } from '@/game/catalog';
import type { Round } from '@/game/rounds';
import { inLocale } from '@/libs/Localize';
import { simulate, TICKS } from '@/game/simulate';
import type { Board, ComponentType, NodeConfig, Scenario, SimResult } from '@/game/types';
import { useRouter } from '@/libs/I18nNavigation';
import { loadBoard, saveBoard, updateProgress } from '@/libs/Progress';
import type { Selection, View } from './BoardCanvas';
import { BoardCanvas } from './BoardCanvas';
import { ComponentIcon } from './ComponentIcon';
import { Inspector } from './Inspector';
import { NODE_H, NODE_W } from './NodeBox';
import { Palette } from './Palette';
import { ResultCard } from './ResultCard';
import { RoundIntro } from './RoundIntro';
import { SandboxPanel } from './SandboxPanel';

type Run = { result: SimResult; tick: number; done: boolean };

const SANDBOX_SCENARIO: Scenario = {
  traffic: 200,
  mix: { read: 0.7, write: 0.3 },
  audience: { 'us-east-1': 1 },
  outageRegion: 'us-east-1',
  latencyTarget: 300,
  requirements: [],
};

const TICK_MS = 110;

/**
 * Scores a passed run: one star to pass, two when well under budget, three at the reference cost.
 * @param result The run result.
 * @param round The round played.
 * @returns Stars from 0 to 3.
 */
const starsFor = (result: SimResult, round: Round) => {
  if (!result.passed) {
    return 0;
  }

  const reference = simulate(round.solution, round.scenario).cost;

  if (result.cost <= reference * 1.05) {
    return 3;
  }

  return result.cost <= (round.scenario.budget ?? Number.POSITIVE_INFINITY) * 0.9 ? 2 : 1;
};

/**
 * The drag-and-drop design game, used by Learn rounds and the sandbox.
 * @param props Either a round to play or the sandbox mode.
 */
export type PlayProps = {
  mode: 'play';
  round: Round;
  /** Rounds of the same chapter list or design problem, in order. */
  sequence: Round[];
  palette: ComponentType[];
  /** Chapter or design problem name, shown in the brief. */
  heading: string;
  /** Link to another round of the same sequence. */
  roundHref: (id: string) => string;
};

export const GameScreen = (props: PlayProps | { mode: 'sandbox' }) => {
  const t = useTranslations('Game');
  const ti = useTranslations('Issues');
  const tt = useTranslations('Twists');
  const router = useRouter();
  const locale = useLocale();
  const play = props.mode === 'play' ? props : undefined;
  const round = play?.round;
  const slot = round?.id ?? 'sandbox';
  const roundIndex = play ? play.sequence.indexOf(play.round) : -1;
  const palette: ComponentType[] = play?.palette ?? COMPONENT_TYPES_IN_PALETTE;

  const [history, setHistory] = useState(() => {
    // A new round grows from the design of the previous one, like a real app.
    const previous = play && roundIndex > 0 ? loadBoard(play.sequence[roundIndex - 1]?.id ?? '') : null;
    const initial = loadBoard(slot) ?? structuredClone(round?.starter ?? previous ?? emptyBoard());

    return { past: [] as Board[], present: initial, future: [] as Board[] };
  });
  const board = history.present;
  const [view, setView] = useState<View>({ x: props.mode === 'sandbox' ? 320 : 40, y: 80, zoom: 1 });
  const [selection, setSelection] = useState<Selection>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [sandbox, setSandbox] = useState<Scenario>(SANDBOX_SCENARIO);
  const [intro, setIntro] = useState(() => Boolean(round) && loadBoard(slot) === null);
  const [hintLevel, setHintLevel] = useState(0);
  const [ghost, setGhost] = useState<{ type: ComponentType; x: number; y: number } | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const scenario = round?.scenario ?? sandbox;
  const locked = Boolean(run && !run.done);

  const apply = (next: Board, record = true) => {
    saveBoard(slot, next);
    setRun(null);
    setHistory((old) =>
      record ? { past: [...old.past.slice(-60), old.present], present: next, future: [] } : { ...old, present: next },
    );
  };

  const undo = () => {
    const previous = history.past.at(-1);

    if (previous) {
      saveBoard(slot, previous);
      setRun(null);
      setHistory({ past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] });
    }
  };

  const redo = () => {
    const [next, ...rest] = history.future;

    if (next) {
      saveBoard(slot, next);
      setRun(null);
      setHistory({ past: [...history.past, history.present], present: next, future: rest });
    }
  };

  const finish = (result: SimResult) => {
    window.clearInterval(timer.current);
    setRun({ result, tick: TICKS - 1, done: true });

    if (round && result.passed) {
      const stars = starsFor(result, round);

      updateProgress((old) => {
        // Using the revealed fix caps the round at two stars.
        const earned = old.fixesShown.includes(round.id) ? Math.min(stars, 2) : stars;

        return { ...old, stars: { ...old.stars, [round.id]: Math.max(old.stars[round.id] ?? 0, earned) } };
      });
    }
  };

  const start = () => {
    if (run && !run.done) {
      finish(run.result);

      return;
    }

    const result = simulate(board, scenario);
    let tick = 0;

    setSelection(null);
    setRun({ result, tick, done: false });
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      tick += 1;

      if (tick >= TICKS) {
        finish(result);
      } else {
        setRun({ result, tick, done: false });
      }
    }, TICK_MS);
  };

  const deleteSelection = () => {
    if (!selection || locked) {
      return;
    }

    if (selection.kind === 'edge') {
      apply({ ...board, edges: board.edges.filter((edge) => edge.id !== selection.id) });
    } else {
      const node = board.nodes.find((item) => item.id === selection.id);

      if (!node || node.type === 'users') {
        return;
      }

      apply({
        nodes: board.nodes.filter((item) => item.id !== node.id),
        edges: board.edges.filter((edge) => edge.from !== node.id && edge.to !== node.id),
      });
    }

    setSelection(null);
  };

  const keys = useRef({ start, undo, redo, deleteSelection });

  keys.current = { start, undo, redo, deleteSelection };

  // Global shortcuts: Ctrl+Enter runs, Ctrl+Z / Ctrl+Shift+Z undo and redo, Delete removes.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
        return;
      }

      const mod = event.ctrlKey || event.metaKey;

      if (mod && event.key === 'Enter') {
        event.preventDefault();
        keys.current.start();
      } else if (mod && event.key.toLowerCase() === 'z') {
        event.preventDefault();

        if (event.shiftKey) {
          keys.current.redo();
        } else {
          keys.current.undo();
        }
      } else if (mod && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        keys.current.redo();
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        keys.current.deleteSelection();
      }
    };

    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearInterval(timer.current);
    };
  }, []);

  const dropAt = (type: ComponentType, clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect || clientX < rect.left || clientY < rect.top || clientX > rect.right || clientY > rect.bottom) {
      return;
    }

    const x = Math.round(((clientX - rect.left - view.x) / view.zoom - NODE_W / 2) / 10) * 10;
    const y = Math.round(((clientY - rect.top - view.y) / view.zoom - NODE_H / 2) / 10) * 10;
    const node = createNode({ type, x, y });

    apply({ ...board, nodes: [...board.nodes, node] });
  };

  const startPaletteDrag = (type: ComponentType, event: React.PointerEvent) => {
    event.preventDefault();
    const origin = { x: event.clientX, y: event.clientY };
    let moved = false;

    setGhost({ type, x: event.clientX, y: event.clientY });

    const onMove = (move: PointerEvent) => {
      moved ||= Math.abs(move.clientX - origin.x) + Math.abs(move.clientY - origin.y) > 4;
      setGhost({ type, x: move.clientX, y: move.clientY });
    };
    const onUp = (up: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setGhost(null);

      if (moved) {
        dropAt(type, up.clientX, up.clientY);
      } else {
        // A plain click drops the component in the middle of the visible board.
        const rect = containerRef.current?.getBoundingClientRect();

        if (rect) {
          dropAt(type, rect.left + rect.width * 0.45, rect.top + rect.height * 0.5);
        }
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const changeNode = (id: string, config: Partial<NodeConfig>) =>
    apply({
      ...board,
      nodes: board.nodes.map((node) => (node.id === id ? { ...node, config: { ...node.config, ...config } } : node)),
    });

  const zoomBy = (factor: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = (rect?.width ?? 800) / 2;
    const cy = (rect?.height ?? 600) / 2;
    const zoom = Math.min(2, Math.max(0.3, view.zoom * factor));

    setView({ zoom, x: cx - ((cx - view.x) / view.zoom) * zoom, y: cy - ((cy - view.y) / view.zoom) * zoom });
  };

  const fit = () => {
    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect || board.nodes.length === 0) {
      return;
    }

    const minX = Math.min(...board.nodes.map((node) => node.x));
    const minY = Math.min(...board.nodes.map((node) => node.y));
    const maxX = Math.max(...board.nodes.map((node) => node.x + NODE_W));
    const maxY = Math.max(...board.nodes.map((node) => node.y + NODE_H + 30));
    const zoom = Math.min(1.4, Math.max(0.3, Math.min((rect.width - 340) / (maxX - minX + 80), (rect.height - 160) / (maxY - minY + 80))));

    setView({ zoom, x: 40 - minX * zoom, y: 90 - minY * zoom });
  };

  const live = run ? run.result.ticks[run.tick] : undefined;
  const result = run?.done ? run.result : undefined;
  const topIssue = result && !result.passed ? result.issues[0] : undefined;
  const selectedNode = selection?.kind === 'node' ? board.nodes.find((node) => node.id === selection.id) : undefined;
  const estimate = simulate(board, { ...scenario, twist: undefined });
  const shownCost = result?.cost ?? estimate.cost;
  const users = board.nodes.find((node) => node.type === 'users');
  const usersConnected = users ? board.edges.some((edge) => edge.from === users.id) : false;
  const stars = round && result ? starsFor(result, round) : 0;

  const nodeLabel = (id: string | undefined) => {
    const node = board.nodes.find((item) => item.id === id);

    if (!node) {
      return t('users');
    }

    return node.type === 'users' ? t('users') : CATALOG[node.type].label;
  };

  const describeIssue = (index: number) => {
    const issue = result?.issues[index];

    return issue ? ti(issue.code, { name: nodeLabel(issue.nodeId) }) : '';
  };

  const coach = () => {
    if (run && !run.done && live) {
      return {
        tone: 'info',
        text: t('live', { answered: (live.answered * 100).toFixed(1), latency: Math.round(live.latency) }),
      };
    }

    if (result) {
      return result.passed
        ? { tone: 'good', text: t('coach_passed') }
        : { tone: 'bad', text: describeIssue(0) || t('coach_failed') };
    }

    if (board.nodes.length <= 1) {
      const first = palette[0];

      return { tone: 'warn', text: t('coach_drag', { name: first ? CATALOG[first].label : '' }) };
    }

    if (!usersConnected) {
      return { tone: 'warn', text: t('coach_connect') };
    }

    return { tone: 'info', text: t('coach_ready') };
  };

  const message = coach();
  const twistNow = live?.twistActive && scenario.twist ? scenario.twist : undefined;
  const fresh = round?.unlocks ?? [];
  const nextRound = play?.sequence[roundIndex + 1];

  const hint = round && result && !result.passed && (
    <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-2 text-sm">
      {hintLevel === 0 && (
        <button type="button" className="font-semibold text-accent" onClick={() => setHintLevel(1)}>
          💡 {t('hint')}
        </button>
      )}
      {hintLevel >= 1 && <p>💡 {inLocale(round.text, locale).nudge}</p>}
      {hintLevel === 1 && (
        <button
          type="button"
          className="mt-2 font-semibold text-accent"
          onClick={() => {
            setHintLevel(2);
            apply(structuredClone(round.solution));
            updateProgress((old) => ({ ...old, fixesShown: [...new Set([...old.fixesShown, round.id])] }));
          }}
        >
          🔧 {t('show_fix')}
        </button>
      )}
      {hintLevel === 2 && <p className="mt-2 text-muted">{t('fix_loaded')}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 overflow-hidden select-none">
      <BoardCanvas
        board={board}
        view={view}
        onViewChange={setView}
        selection={selection}
        onSelect={setSelection}
        onMoveStart={() => setHistory((old) => ({ past: [...old.past.slice(-60), old.present], present: old.present, future: [] }))}
        onMove={(id, x, y) =>
          apply({ ...board, nodes: board.nodes.map((node) => (node.id === id ? { ...node, x, y } : node)) }, false)
        }
        onConnect={(from, to) => {
          if (canConnect(board, from, to)) {
            apply({ ...board, edges: [...board.edges, { id: newId('edge'), from, to }] });
          }
        }}
        live={live}
        failingId={topIssue?.nodeId}
        locked={locked}
        containerRef={containerRef}
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 border-b border-line bg-ink/85 px-3 py-2 backdrop-blur">
        <div className="pointer-events-auto">
          <AppMenu title={play ? play.heading : t('sandbox')} />
        </div>
        <dl className="pointer-events-auto flex items-stretch gap-4 font-mono">
          {round && (
            <div className="hidden sm:block">
              <dt className="text-[10px] font-bold tracking-widest text-muted">{t('round')}</dt>
              <dd className="text-xl leading-6 font-bold">{roundIndex + 1}</dd>
            </div>
          )}
          <div className="border-line sm:border-l sm:pl-4">
            <dt className="text-[10px] font-bold tracking-widest text-muted">{t('traffic')}</dt>
            <dd className="text-sm">{Math.round(live?.traffic ?? scenario.traffic)} req/s</dd>
          </div>
          <div className="border-l border-line pl-4">
            <dt className="text-[10px] font-bold tracking-widest text-muted">{t('budget')}</dt>
            <dd className={`text-sm ${scenario.budget !== undefined && shownCost > scenario.budget ? 'text-bad' : ''}`}>
              ${shownCost.toFixed(0)}
              {scenario.budget !== undefined && <span className="text-muted"> / ${scenario.budget}</span>}
            </dd>
          </div>
          {scenario.twist && (
            <div className="hidden border-l border-line pl-4 md:block">
              <dt className="text-[10px] font-bold tracking-widest text-warn">{t('twist')}</dt>
              <dd className="text-sm text-warn">{tt(`${scenario.twist}.name`)}</dd>
            </div>
          )}
        </dl>
        <div className="pointer-events-auto flex items-center gap-2">
          {round && (
            <button
              type="button"
              className="hidden rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-panel-2 sm:block"
              onClick={() => setIntro(true)}
            >
              {t('brief')}
            </button>
          )}
          <LocaleSwitcher />
          <button
            type="button"
            title={t('run_title')}
            className={`flex items-center gap-2 rounded-xl px-4 py-1.5 font-bold shadow ${
              locked ? 'border-2 border-chalk bg-ink text-chalk' : 'bg-accent text-ink'
            }`}
            onClick={start}
          >
            {locked ? t('skip') : t('run')} {locked ? '⏭' : '▷'}
          </button>
        </div>
        {run && !run.done && (
          <div className="absolute bottom-0 left-0 h-0.5 bg-warn" style={{ width: `${((run.tick + 1) / TICKS) * 100}%` }} />
        )}
      </header>

      <div className="pointer-events-none absolute top-16 left-3 z-10 flex max-w-[min(26rem,calc(100vw-1.5rem))] flex-col gap-2">
        <div className="pointer-events-auto flex items-start gap-2 rounded-xl border border-line bg-panel/95 px-3 py-2 text-sm shadow-lg">
          <span
            className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full text-[10px] font-bold text-ink ${
              { info: 'bg-info', good: 'bg-good', bad: 'bg-bad', warn: 'bg-accent' }[message.tone]
            }`}
          >
            {message.tone === 'bad' ? '✕' : message.tone === 'good' ? '✓' : '!'}
          </span>
          <span className="font-semibold">{message.text}</span>
        </div>
        {twistNow && (
          <div className="pointer-events-auto rounded-xl border border-warn/60 bg-warn/15 px-3 py-2 text-sm shadow-lg">
            <span className="font-bold text-warn">📟 {t('paged')} </span>
            {tt(`${twistNow}.page`, { region: scenario.outageRegion ?? '' })}
          </div>
        )}
        {props.mode === 'sandbox' && (
          <div className="pointer-events-auto">
            <SandboxPanel scenario={sandbox} onChange={(next) => { setSandbox(next); setRun(null); }} disabled={locked} />
          </div>
        )}
      </div>

      <aside className="absolute top-16 right-3 z-10 flex w-64 flex-col gap-2">
        {selectedNode ? (
          <Inspector
            node={selectedNode}
            cost={estimate.costByNode[selectedNode.id] ?? 0}
            locked={locked}
            onChange={(config) => changeNode(selectedNode.id, config)}
            onDelete={deleteSelection}
            onClose={() => setSelection(null)}
          />
        ) : (
          <>
            <button
              type="button"
              className="self-end rounded-lg border border-line bg-panel/95 px-3 py-1 text-xs font-semibold sm:hidden"
              onClick={() => setPaletteOpen(!paletteOpen)}
            >
              {t('components')} {paletteOpen ? '−' : '+'}
            </button>
            {paletteOpen && (
              <Palette
                types={palette}
                fresh={fresh}
                disabled={locked}
                onDragStart={startPaletteDrag}
                onClear={() => {
                  apply(structuredClone(round?.starter ?? emptyBoard()));
                  setSelection(null);
                }}
              />
            )}
          </>
        )}
        {selection?.kind === 'edge' && !locked && (
          <button type="button" className="rounded-lg border border-bad/60 bg-panel px-3 py-1.5 text-sm text-bad" onClick={deleteSelection}>
            {t('delete_connection')}
          </button>
        )}
      </aside>

      {result && (
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
          <ResultCard
            result={result}
            scenario={scenario}
            board={board}
            stars={stars}
            describeIssue={describeIssue}
            onRetry={() => setRun(null)}
            onNext={
              play && result.passed && nextRound
                ? () => router.push(play.roundHref(nextRound.id))
                : undefined
            }
            hint={hint}
          />
        </div>
      )}

      <div className="absolute right-3 bottom-3 z-10 flex items-center gap-1 rounded-xl border border-line bg-panel/95 p-1 font-mono text-xs shadow-lg">
        <button type="button" className="size-8 rounded-lg hover:bg-panel-2" onClick={undo} disabled={history.past.length === 0} title={t('undo')}>
          ↶
        </button>
        <button type="button" className="size-8 rounded-lg hover:bg-panel-2" onClick={redo} disabled={history.future.length === 0} title={t('redo')}>
          ↷
        </button>
        <button type="button" className="size-8 rounded-lg hover:bg-panel-2" onClick={() => zoomBy(1 / 1.2)} aria-label={t('zoom_out')}>
          −
        </button>
        <button type="button" className="w-12 rounded-lg py-2 hover:bg-panel-2" onClick={() => setView({ ...view, zoom: 1 })}>
          {Math.round(view.zoom * 100)}%
        </button>
        <button type="button" className="size-8 rounded-lg hover:bg-panel-2" onClick={() => zoomBy(1.2)} aria-label={t('zoom_in')}>
          +
        </button>
        <button type="button" className="size-8 rounded-lg hover:bg-panel-2" onClick={fit} aria-label={t('fit')}>
          ⛶
        </button>
      </div>

      {ghost && (
        <div
          className="pointer-events-none fixed z-50 flex -translate-1/2 items-center gap-2 rounded-lg border-2 border-accent bg-panel/90 px-3 py-2"
          style={{ left: ghost.x, top: ghost.y }}
        >
          <ComponentIcon type={ghost.type} />
          <span className="font-bold">{CATALOG[ghost.type].label}</span>
        </div>
      )}

      {play && intro && (
        <RoundIntro round={play.round} number={roundIndex + 1} heading={play.heading} onStart={() => setIntro(false)} />
      )}
    </div>
  );
};
