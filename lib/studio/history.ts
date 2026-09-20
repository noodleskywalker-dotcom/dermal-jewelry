export type History<T> = {
  past: T[];
  present: T;
  future: T[];
  lastKey: string | null;
  lastAt: number;
};

const LIMIT = 100;
const COALESCE_MS = 800;

export function createHistory<T>(present: T): History<T> {
  return { past: [], present, future: [], lastKey: null, lastAt: 0 };
}

/**
 * Records a new state. Consecutive changes that share a key collapse into one undo step:
 * keys starting with "gesture:" collapse for the whole gesture, others within a short window.
 */
export function applyChange<T>(h: History<T>, next: T, opts: { key?: string; at: number }): History<T> {
  if (Object.is(next, h.present)) return h;
  const sameKey = opts.key !== undefined && opts.key === h.lastKey;
  const coalesce = sameKey && (opts.key!.startsWith("gesture:") || opts.at - h.lastAt < COALESCE_MS);
  return {
    past: coalesce ? h.past : [...h.past, h.present].slice(-LIMIT),
    present: next,
    future: [],
    lastKey: opts.key ?? null,
    lastAt: opts.at,
  };
}

export function undo<T>(h: History<T>): History<T> {
  if (h.past.length === 0) return h;
  const previous = h.past[h.past.length - 1];
  return { past: h.past.slice(0, -1), present: previous, future: [h.present, ...h.future], lastKey: null, lastAt: 0 };
}

export function redo<T>(h: History<T>): History<T> {
  if (h.future.length === 0) return h;
  const [next, ...rest] = h.future;
  return { past: [...h.past, h.present], present: next, future: rest, lastKey: null, lastAt: 0 };
}

export const canUndo = <T,>(h: History<T>) => h.past.length > 0;
export const canRedo = <T,>(h: History<T>) => h.future.length > 0;
