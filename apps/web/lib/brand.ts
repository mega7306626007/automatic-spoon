import type { Layer, Project } from "@adforge/creative-schema";
import { relayout } from "./smart";
export interface BrandKit { id: string; name: string; primary: string; secondary: string; accent: string; background: string; text: string; fontFamily: string; slogan?: string; website?: string; messaging?: string; logo?: string }
/** Updates colours and fonts of known template roles (by layer name). Text, geometry and all other layers are untouched. */
export function applyBrandKit(p: Project, k: BrandKit): Project {
  if (p.meta) return { ...relayout(p, { palette: { bg: k.background, primary: k.primary, secondary: k.secondary, text: k.text, gold: k.accent }, font: k.fontFamily }), brandKitId: k.id };
  const layers = p.layers.map((l): Layer => {
    if (l.type === "shape" && l.name === "accent") return { ...l, fill: { kind: "solid", color: k.primary } };
    if (l.type === "shape" && l.name === "cta-bg") return { ...l, fill: { kind: "solid", color: k.accent } };
    if (l.type === "text" && l.name === "headline") return { ...l, color: k.text, fontFamily: k.fontFamily };
    if (l.type === "text" && l.name === "subtitle") return { ...l, color: k.secondary, fontFamily: k.fontFamily };
    if (l.type === "text" && l.name === "cta") return { ...l, fontFamily: k.fontFamily };
    return l; });
  return { ...p, brandKitId: k.id, canvas: { ...p.canvas, background: { kind: "solid", color: k.background } }, layers };
}
export const lum = (hex: string) => { const n = parseInt(hex.slice(1, 7), 16), f = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255); };
export const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
/** Readability warnings for text drawn straight on a solid canvas background. */
export function brandWarnings(p: Project): string[] {
  const bg = p.canvas.background; if (bg.kind !== "solid" || !bg.color) return [];
  return p.layers.flatMap(l => l.type === "text" && /^#[0-9a-f]{6}/i.test(l.color) && l.name !== "cta" && contrast(l.color, bg.color!) < 3 ? [`"${l.name}" has low contrast against the background`] : []);
}

/** Replace low-contrast text colours (on a solid background) with white or near-black. Other layers untouched. */
export function fixContrast(p: Project): Project {
  const bg = p.canvas.background; if (bg.kind !== "solid" || !bg.color) return p; const b = bg.color;
  return { ...p, layers: p.layers.map((l): Layer => l.type === "text" && l.name !== "cta" && /^#[0-9a-f]{6}/i.test(l.color) && contrast(l.color, b) < 3 ? { ...l, color: contrast("#FFFFFF", b) >= contrast("#111111", b) ? "#FFFFFF" : "#111111" } : l) };
}
const sat = (h: string) => { const n = parseInt(h.slice(1, 7), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255, mx = Math.max(r, g, b); return mx === 0 ? 0 : (mx - Math.min(r, g, b)) / mx; };
/** Build brand colours from a logo/photo palette (hex list, most frequent first). */
export function kitColorsFromPalette(colors: string[]): Pick<BrandKit, "primary" | "secondary" | "accent" | "background" | "text"> {
  const dark = [...colors].sort((a, b) => lum(a) - lum(b))[0], background = dark && lum(dark) < 0.25 ? dark : "#0B1026";
  const vivid = colors.filter(c => c !== background).sort((a, b) => sat(b) - sat(a));
  return { background, text: contrast("#FFFFFF", background) >= contrast("#111111", background) ? "#FFFFFF" : "#111111", primary: vivid[0] ?? "#7C3AED", secondary: vivid[1] ?? "#22D3EE", accent: vivid[2] ?? "#D4AF37" };
}
