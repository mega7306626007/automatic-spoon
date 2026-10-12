export type Measure = (s: string, size: number, family: string) => number;
let ctx: CanvasRenderingContext2D | null | undefined;
export const defaultMeasure: Measure = (s, size, family) => {
  if (ctx === undefined) ctx = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null;
  if (!ctx) return Array.from(s).length * size * (family.startsWith("@b ") ? 0.62 : 0.56); ctx.font = family.startsWith("@b ") ? `bold ${size}px ${family.slice(3)}` : `${size}px ${family}`; return ctx.measureText(s).width; };
/** Greedy word wrap. A single word wider than the box stays on its own line (reported by textOverflows). */
export function wrapLines(text: string, maxW: number, size: number, family: string, letterSpacing = 0, measure: Measure = defaultMeasure): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean); if (!words.length) { out.push(""); continue; }
    let line = "";
    for (const w of words) { const t = line ? `${line} ${w}` : w;
      if (!line || measure(t, size, family) + letterSpacing * t.length <= maxW) line = t; else { out.push(line); line = w; } }
    out.push(line);
  }
  return out;
}
export function textOverflows(l: { text: string; w: number; h: number; fontSize: number; fontFamily: string; lineHeight: number; letterSpacing: number; bold?: boolean }, measure: Measure = defaultMeasure): boolean {
  const fam = l.bold ? "@b " + l.fontFamily : l.fontFamily, lines = wrapLines(l.text, l.w, l.fontSize, fam, l.letterSpacing, measure);
  return lines.length * l.fontSize * l.lineHeight > l.h + 0.5 || lines.some(s => measure(s, l.fontSize, fam) > l.w + 0.5);
}
