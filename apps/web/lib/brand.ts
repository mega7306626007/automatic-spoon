import type { Layer, Project } from "@adforge/creative-schema";
export interface BrandKit { id: string; name: string; primary: string; secondary: string; accent: string; background: string; text: string; fontFamily: string; slogan?: string; website?: string; messaging?: string; logo?: string }
/** Updates colours and fonts of known template roles (by layer name). Text, geometry and all other layers are untouched. */
export function applyBrandKit(p: Project, k: BrandKit): Project {
  const layers = p.layers.map((l): Layer => {
    if (l.type === "shape" && l.name === "accent") return { ...l, fill: { kind: "solid", color: k.primary } };
    if (l.type === "shape" && l.name === "cta-bg") return { ...l, fill: { kind: "solid", color: k.accent } };
    if (l.type === "text" && l.name === "headline") return { ...l, color: k.text, fontFamily: k.fontFamily };
    if (l.type === "text" && l.name === "subtitle") return { ...l, color: k.secondary, fontFamily: k.fontFamily };
    if (l.type === "text" && l.name === "cta") return { ...l, fontFamily: k.fontFamily };
    return l; });
  return { ...p, brandKitId: k.id, canvas: { ...p.canvas, background: { kind: "solid", color: k.background } }, layers };
}
const lum = (hex: string) => { const n = parseInt(hex.slice(1, 7), 16), f = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255); };
export const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
/** Readability warnings for text drawn straight on a solid canvas background. */
export function brandWarnings(p: Project): string[] {
  const bg = p.canvas.background; if (bg.kind !== "solid" || !bg.color) return [];
  return p.layers.flatMap(l => l.type === "text" && /^#[0-9a-f]{6}/i.test(l.color) && l.name !== "cta" && contrast(l.color, bg.color!) < 3 ? [`"${l.name}" has low contrast against the background`] : []);
}
