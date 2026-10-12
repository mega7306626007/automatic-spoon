import type { TextLayer } from "@adforge/creative-schema";
import { defaultMeasure, textOverflows, type Measure } from "./text";
/** Largest font size (up to fitMax, never below 8) at which the text fits its box. */
export function fitFontSize(l: TextLayer, measure: Measure = defaultMeasure): number {
  const max = Math.max(8, Math.min(l.fitMax ?? l.fontSize, l.h)); if (!textOverflows({ ...l, fontSize: max }, measure)) return Math.round(max * 10) / 10;
  let lo = 8, hi = max; while (hi - lo > 0.5) { const mid = (lo + hi) / 2; if (textOverflows({ ...l, fontSize: mid }, measure)) hi = mid; else lo = mid; }
  return Math.round(lo * 10) / 10;
}
