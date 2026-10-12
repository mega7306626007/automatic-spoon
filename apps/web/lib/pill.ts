import type { Layer, Project } from "@adforge/creative-schema";
import { pillWidth } from "@adforge/template-library";
/** Change the label of a hook/CTA pill and resize its background to match (keeps it centred if it was centred). */
export function setPillText(p: Project, name: "hook" | "cta", text: string): Project {
  const t = p.layers.find(l => l.name === name && l.type === "text"), bg = p.layers.find(l => l.name === `${name}-bg`);
  if (!t || t.type !== "text" || !bg) return { ...p, layers: p.layers.map((l): Layer => (l.name === name && l.type === "text" ? { ...l, text } : l)) };
  const w = pillWidth(text, t.fontSize, p.canvas.width * 0.9), centred = Math.abs(bg.x + bg.w / 2 - p.canvas.width / 2) < 3, x = centred ? p.canvas.width / 2 - w / 2 : bg.x;
  return { ...p, layers: p.layers.map((l): Layer => (l.id === t.id && l.type === "text" ? { ...l, text, x, w } : l.id === bg.id ? { ...l, x, w } : l)) };
}
