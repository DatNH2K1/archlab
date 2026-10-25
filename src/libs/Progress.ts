'use client';

import { useSyncExternalStore } from 'react';
import type { Board } from '@/game/types';

/** Everything the player has done, kept in the browser. */
export type Progress = {
  /** Best stars per round id (1–3). */
  stars: Record<string, number>;
  /** Rounds where the fix was revealed. */
  fixesShown: string[];
  /** Last answer per question id: true when correct. */
  answers: Record<string, boolean>;
  /** Leitner box per flashcard id (0–4). */
  cards: Record<string, number>;
  lessonsRead: string[];
};

type State = {
  /** False until the saved data is read from IndexedDB. */
  ready: boolean;
  progress: Progress;
  /** Saved board per round id or `sandbox`. */
  boards: Record<string, Board>;
};

/** Change sent to other tabs so they stay in sync. */
type Message = { type: 'progress'; progress: Progress } | { type: 'board'; slot: string; board: Board } | { type: 'reset' };

const DB_NAME = 'archlab';
const DB_VERSION = 1;
const PROGRESS_STORE = 'progress';
const BOARDS_STORE = 'boards';
/** Progress is a single record in its store. */
const PROGRESS_KEY = 'progress';

/** localStorage prefixes used before IndexedDB; saved data is moved over once. */
const LEGACY_PREFIXES = ['cloudcrash:', 'archlab:'];
const LEGACY_BOARD = 'board:';

const EMPTY: Progress = { stars: {}, fixesShown: [], answers: {}, cards: {}, lessonsRead: [] };

let state: State = { ready: false, progress: EMPTY, boards: {} };
let loading: Promise<void> | undefined;
let channel: BroadcastChannel | undefined;
const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) {
    listener();
  }
};

const settle = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

let database: Promise<IDBDatabase> | undefined;

const openDatabase = () => {
  database ??= new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(PROGRESS_STORE);
      request.result.createObjectStore(BOARDS_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return database;
};

/**
 * Runs writes in one transaction and waits for it to commit.
 * @param write Puts or deletes records through the transaction.
 */
const commit = async (write: (transaction: IDBTransaction) => void) => {
  const db = await openDatabase();
  const transaction = db.transaction([PROGRESS_STORE, BOARDS_STORE], 'readwrite');

  write(transaction);

  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
};

/**
 * Saves changes without blocking the UI.
 * @param write Puts or deletes records through the transaction.
 */
const persist = (write: (transaction: IDBTransaction) => void) => {
  commit(write).catch(() => {
    // Storage can be full or blocked; data then lives for this tab only.
  });
};

const readStored = async () => {
  const db = await openDatabase();
  const transaction = db.transaction([PROGRESS_STORE, BOARDS_STORE]);
  const boardStore = transaction.objectStore(BOARDS_STORE);
  const [progress, slots, boards] = await Promise.all([
    settle(transaction.objectStore(PROGRESS_STORE).get(PROGRESS_KEY)),
    settle(boardStore.getAllKeys()),
    settle(boardStore.getAll()),
  ]);

  return {
    progress: progress as Partial<Progress> | undefined,
    boards: Object.fromEntries(slots.map((slot, i) => [String(slot), boards[i] as Board])),
  };
};

/** Reads data saved in localStorage by older versions; newer prefixes win. */
const readLegacy = () => {
  const legacy: { progress?: Partial<Progress>; boards: Record<string, Board>; keys: string[] } = { boards: {}, keys: [] };

  try {
    for (const prefix of LEGACY_PREFIXES) {
      for (const key of Object.keys(window.localStorage)) {
        const raw = key.startsWith(prefix) ? window.localStorage.getItem(key) : null;

        if (raw !== null) {
          const name = key.slice(prefix.length);

          if (name === PROGRESS_KEY) {
            legacy.progress = JSON.parse(raw) as Partial<Progress>;
          } else if (name.startsWith(LEGACY_BOARD)) {
            legacy.boards[name.slice(LEGACY_BOARD.length)] = JSON.parse(raw) as Board;
          }

          legacy.keys.push(key);
        }
      }
    }
  } catch {
    // Unreadable legacy data is left in place and ignored.
    return { boards: {}, keys: [] };
  }

  return legacy;
};

/** Moves localStorage data into IndexedDB once, keeping records already there. */
const migrate = async (stored: Awaited<ReturnType<typeof readStored>>) => {
  const legacy = readLegacy();

  if (legacy.keys.length === 0) {
    return stored;
  }

  const progress = stored.progress ?? legacy.progress;
  const boards = { ...legacy.boards, ...stored.boards };

  await commit((transaction) => {
    if (progress) {
      transaction.objectStore(PROGRESS_STORE).put(progress, PROGRESS_KEY);
    }

    for (const [slot, board] of Object.entries(boards)) {
      transaction.objectStore(BOARDS_STORE).put(board, slot);
    }
  });

  for (const key of legacy.keys) {
    window.localStorage.removeItem(key);
  }

  return { progress, boards };
};

const receive = (message: Message) => {
  if (message.type === 'progress') {
    state = { ...state, progress: message.progress };
  } else if (message.type === 'board') {
    state = { ...state, boards: { ...state.boards, [message.slot]: message.board } };
  } else {
    state = { ...state, progress: EMPTY, boards: {} };
  }

  emit();
};

const broadcast = (message: Message) => {
  channel?.postMessage(message);
};

const hydrate = async () => {
  channel = new BroadcastChannel(DB_NAME);
  channel.onmessage = (event: MessageEvent<Message>) => receive(event.data);

  try {
    const stored = await migrate(await readStored());

    state = { ready: true, progress: { ...EMPTY, ...stored.progress }, boards: stored.boards };
  } catch {
    // IndexedDB is blocked (e.g. some private modes); start empty in memory.
    state = { ...state, ready: true };
  }

  emit();
};

/** Starts reading the saved data once; resolves when it is in memory. */
const load = () => {
  loading ??= hydrate();

  return loading;
};

const subscribe = (callback: () => void) => {
  listeners.add(callback);
  void load();

  return () => {
    listeners.delete(callback);
  };
};

/**
 * Reads the saved progress and re-renders when it changes.
 * @returns The current progress, empty until the saved data is read.
 */
export const useProgress = () => useSyncExternalStore(subscribe, () => state.progress, () => EMPTY);

/**
 * Tells whether the saved progress and boards were read.
 * @returns True once `loadBoard` and `useProgress` return saved data.
 */
export const useProgressReady = () => useSyncExternalStore(subscribe, () => state.ready, () => false);

/**
 * Applies a change to the saved progress.
 * @param change Builds the new progress from the old one.
 */
export const updateProgress = (change: (old: Progress) => Progress) => {
  void load().then(() => {
    const progress = change(state.progress);

    state = { ...state, progress };
    emit();
    persist((transaction) => transaction.objectStore(PROGRESS_STORE).put(progress, PROGRESS_KEY));
    broadcast({ type: 'progress', progress });
  });
};

/** Forgets all progress and saved boards. */
export const resetProgress = () => {
  void load().then(() => {
    state = { ...state, progress: EMPTY, boards: {} };
    emit();
    persist((transaction) => {
      transaction.objectStore(PROGRESS_STORE).clear();
      transaction.objectStore(BOARDS_STORE).clear();
    });
    broadcast({ type: 'reset' });
  });
};

/**
 * Loads the board saved for a round or the sandbox; call after `useProgressReady` is true.
 * @param slot Round id or `sandbox`.
 * @returns A copy of the saved board, if any.
 */
export const loadBoard = (slot: string) => {
  const board = state.boards[slot];

  return board ? structuredClone(board) : null;
};

/**
 * Saves the board of a round or the sandbox.
 * @param slot Round id or `sandbox`.
 * @param board The board to keep.
 */
export const saveBoard = (slot: string, board: Board) => {
  void load().then(() => {
    state = { ...state, boards: { ...state.boards, [slot]: board } };
    persist((transaction) => transaction.objectStore(BOARDS_STORE).put(board, slot));
    broadcast({ type: 'board', slot, board });
  });
};
