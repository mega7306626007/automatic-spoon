import { resizeLayers, type Layer, type Project } from "@adforge/creative-schema";
import { buildLayers, type Template } from "@adforge/template-library";
import { fitFontSize } from "./autofit";
import { uid } from "./sample";
export const FORMATS: { label: string; w: number; h: number }[] = [{ label: "Square", w: 1080, h: 1080 }, { label: "Story", w: 1080, h: 1920 }, { label: "Banner", w: 1920, h: 1080 }];
const ROLES = new Set(["headline", "subtitle", "cta", "cta-bg", "accent", "image"]);
/** Re-lay out a template-style design for another canvas size, keeping copy, colours, fonts and photo. Custom layers are scaled. */
export function fitAll(p: Project): Project { return { ...p, layers: p.layers.map(l => (l.type === "text" && l.autoFit ? { ...l, fontSize: fitFontSize(l) } : l)) }; }
export function smartResize(p: Project, W: number, H: number): Project {
  const by = (n: string) => p.layers.find(l => l.name === n), head = by("headline"), sub = by("subtitle"), cta = by("cta");
  const plain = (): Project => ({ ...p, canvas: { ...p.canvas, width: W, height: H }, layers: resizeLayers(p.layers, p.canvas, { width: W, height: H }) });
  if (!head || head.type !== "text") return plain();
  const col = (l: Layer | undefined, f: string) => (l?.type === "text" ? l.color : l?.type === "shape" ? l.fill.color ?? f : f);
  const t: Template = { id: "smart", name: p.name, category: "product-launch", tags: [], width: W, height: H, layout: W === H ? "split" : H > W ? "centered" : "banner", animation: "fade-up", fields: ["headline", "subtitle", "cta"],
    palette: { bg: p.canvas.background.color ?? p.canvas.background.stops?.[0]?.color ?? "#0B1026", primary: col(by("accent"), "#7C3AED"), secondary: col(sub, "#22D3EE"), text: col(head, "#FFFFFF"), gold: col(by("cta-bg"), "#D4AF37") },
    copy: { headline: head.text, subtitle: sub?.type === "text" ? sub.text : "", cta: cta?.type === "text" ? cta.text : "" } };
  let built = buildLayers(t); if (!sub) built = built.filter(l => l.name !== "subtitle"); if (!cta) built = built.filter(l => l.name !== "cta" && l.name !== "cta-bg"); const img = by("image"); if (!img) built = built.filter(l => l.name !== "image");
  built = built.map((l): Layer => { const src = by(l.name);
    if (l.type === "text" && src?.type === "text") return { ...l, fontFamily: src.fontFamily, lineHeight: src.lineHeight, letterSpacing: src.letterSpacing };
    if (l.type === "image" && img?.type === "image") return { ...l, assetId: img.assetId, fit: img.fit, focusX: img.focusX, focusY: img.focusY }; return l; });
  const extras = resizeLayers(p.layers.filter(l => !ROLES.has(l.name)), p.canvas, { width: W, height: H });
  return fitAll({ ...p, canvas: { ...p.canvas, width: W, height: H }, layers: [...built, ...extras] });
}
/** Designs for the other standard formats (new ids), derived from p. */
export const otherSizes = (p: Project): Project[] => FORMATS.filter(f => f.w !== p.canvas.width || f.h !== p.canvas.height).map(f => ({ ...smartResize(p, f.w, f.h), id: uid(), name: `${p.name} — ${f.label}` }));
