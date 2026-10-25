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

const PREFIX = 'archlab:';
const KEY = `${PREFIX}progress`;
const BOARD_PREFIX = `${PREFIX}board:`;
const EVENT = `${PREFIX}progress`;
/** Prefix used before the app was renamed; saved data is moved over once. */
const OLD_PREFIX = 'cloudcrash:';

const migrate = () => {
  for (const key of Object.keys(window.localStorage)) {
    if (key.startsWith(OLD_PREFIX)) {
      const value = window.localStorage.getItem(key);
      const renamed = PREFIX + key.slice(OLD_PREFIX.length);

      if (value !== null && window.localStorage.getItem(renamed) === null) {
        window.localStorage.setItem(renamed, value);
      }

      window.localStorage.removeItem(key);
    }
  }
};

const EMPTY: Progress = { stars: {}, fixesShown: [], answers: {}, cards: {}, lessonsRead: [] };

let cache: Progress | null = null;

const read = (): Progress => {
  if (cache) {
    return cache;
  }

  try {
    migrate();
    const raw = window.localStorage.getItem(KEY);

    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Progress>) } : EMPTY;
  } catch {
    cache = EMPTY;
  }

  return cache;
};

const subscribe = (callback: () => void) => {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
};

/**
 * Reads the saved progress and re-renders when it changes.
 * @returns The current progress.
 */
export const useProgress = () => useSyncExternalStore(subscribe, read, () => EMPTY);

/**
 * Applies a change to the saved progress.
 * @param change Builds the new progress from the old one.
 */
export const updateProgress = (change: (old: Progress) => Progress) => {
  cache = change(read());

  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Storage can be full or blocked; progress then lives for this tab only.
  }

  window.dispatchEvent(new Event(EVENT));
};

/** Forgets all progress and saved boards. */
export const resetProgress = () => {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith(PREFIX)) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // Nothing to clear when storage is blocked.
  }

  cache = EMPTY;
  window.dispatchEvent(new Event(EVENT));
};

/**
 * Loads the board saved for a round or the sandbox.
 * @param slot Round id or `sandbox`.
 * @returns The saved board, if any.
 */
export const loadBoard = (slot: string): Board | null => {
  try {
    migrate();
    const raw = window.localStorage.getItem(BOARD_PREFIX + slot);

    return raw ? (JSON.parse(raw) as Board) : null;
  } catch {
    return null;
  }
};

/**
 * Saves the board of a round or the sandbox.
 * @param slot Round id or `sandbox`.
 * @param board The board to keep.
 */
export const saveBoard = (slot: string, board: Board) => {
  try {
    window.localStorage.setItem(BOARD_PREFIX + slot, JSON.stringify(board));
  } catch {
    // Ignore: the board stays in memory.
  }
};
