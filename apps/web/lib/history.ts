export interface History<T> { past: T[]; present: T; future: T[] }
export const init = <T,>(p: T): History<T> => ({ past: [], present: p, future: [] });
/** Push the current state to undo stack and set a new present (clears redo). */
export const commit = <T,>(h: History<T>, next: T): History<T> => ({ past: [...h.past.slice(-99), h.present], present: next, future: [] });
/** Replace present without creating an undo step (used for live dragging after a checkpoint). */
export const replace = <T,>(h: History<T>, next: T): History<T> => ({ ...h, present: next });
export const checkpoint = <T,>(h: History<T>): History<T> => ({ past: [...h.past.slice(-99), h.present], present: h.present, future: [] });
export const undo = <T,>(h: History<T>): History<T> => h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h;
export const redo = <T,>(h: History<T>): History<T> => h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h;
