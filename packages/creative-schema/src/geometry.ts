import { Layer } from "./types.ts";
export interface Rect { x: number; y: number; w: number; h: number }
/** Axis-aligned bounding box of a layer after rotation about its center. */
export function boundingBox(l: Pick<Layer,"x"|"y"|"w"|"h"|"rotation">): Rect {
  const r = (l.rotation * Math.PI) / 180, c = Math.abs(Math.cos(r)), s = Math.abs(Math.sin(r));
  const w = l.w * c + l.h * s, h = l.w * s + l.h * c, cx = l.x + l.w / 2, cy = l.y + l.h / 2;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}
export function isWithinCanvas(l: Layer, cw: number, ch: number, margin = 0): boolean {
  const b = boundingBox(l);
  return b.x >= margin - 1e-6 && b.y >= margin - 1e-6 && b.x + b.w <= cw - margin + 1e-6 && b.y + b.h <= ch - margin + 1e-6;
}
/** z-order = array order (last is on top). Returns a new array. */
export function reorder<T extends { id: string }>(layers: T[], id: string, toIndex: number): T[] {
  const i = layers.findIndex(l => l.id === id); if (i < 0) return layers;
  const out = layers.slice(); const [m] = out.splice(i, 1); out.splice(Math.max(0, Math.min(out.length, toIndex)), 0, m); return out;
}
/** Scale layers to another canvas (uniform fit, centered) for resizing an ad into a new format. */
export function resizeLayers<T extends Layer>(layers: T[], from: {width:number;height:number}, to: {width:number;height:number}): T[] {
  const k = Math.min(to.width / from.width, to.height / from.height);
  const ox = (to.width - from.width * k) / 2, oy = (to.height - from.height * k) / 2;
  return layers.map(l => ({ ...l, x: l.x * k + ox, y: l.y * k + oy, w: l.w * k, h: l.h * k,
    ...(l.type === "text" ? { fontSize: l.fontSize * k } : {}) }));
}
/** Rough overflow estimate (avg glyph ≈ 0.55em). Renderers should measure exactly. */
export function estimateTextOverflow(l: { text: string; fontSize: number; w: number; h: number; lineHeight: number }): boolean {
  const perLine = Math.max(1, Math.floor(l.w / (l.fontSize * 0.55))); let lines = 0;
  for (const para of l.text.split("\n")) lines += Math.max(1, Math.ceil(para.length / perLine));
  return lines * l.fontSize * l.lineHeight > l.h;
}
