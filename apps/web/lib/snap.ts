import type { Rect } from "@adforge/creative-schema";
export interface Guide { axis: "x" | "y"; pos: number }
/** Snap a moving rect's edges/centre to canvas edges/centre and other layers' edges/centres. Returns the correction to add and guides to draw. */
export function snapMove(r: Rect, c: { w: number; h: number }, others: Rect[], thr: number): { dx: number; dy: number; guides: Guide[] } {
  const xs = [0, c.w / 2, c.w], ys = [0, c.h / 2, c.h];
  for (const o of others) { xs.push(o.x, o.x + o.w / 2, o.x + o.w); ys.push(o.y, o.y + o.h / 2, o.y + o.h); }
  const best = (vals: number[], targets: number[]) => { let b: { d: number; t: number } | null = null;
    for (const v of vals) for (const t of targets) { const d = t - v; if (Math.abs(d) <= thr && (!b || Math.abs(d) < Math.abs(b.d))) b = { d, t }; } return b; };
  const bx = best([r.x, r.x + r.w / 2, r.x + r.w], xs), by = best([r.y, r.y + r.h / 2, r.y + r.h], ys);
  return { dx: bx?.d ?? 0, dy: by?.d ?? 0, guides: [...(bx ? [{ axis: "x" as const, pos: bx.t }] : []), ...(by ? [{ axis: "y" as const, pos: by.t }] : [])] };
}
