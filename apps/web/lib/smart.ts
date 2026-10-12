import { resizeLayers, type ImageLayer, type Project, type ProjectMeta } from "@adforge/creative-schema";
import { layoutFor, isPhotoStyle, ROLE_NAMES, type Copy, type Style } from "@adforge/template-library";
import { fitFontSize } from "./autofit";
import { uid } from "./sample";
export const FORMATS: { label: string; w: number; h: number }[] = [{ label: "Square", w: 1080, h: 1080 }, { label: "Story", w: 1080, h: 1920 }, { label: "Banner", w: 1920, h: 1080 }];
export const fitAll = (p: Project): Project => ({ ...p, layers: p.layers.map(l => (l.type === "text" && l.autoFit ? { ...l, fontSize: fitFontSize(l) } : l)) });
/** Rebuild a template-made design (new size, mood, layout style, palette, font or copy) while keeping the user's words, photo and custom layers. */
export function relayout(p: Project, patch: Partial<ProjectMeta> = {}, W = p.canvas.width, H = p.canvas.height, over: Partial<Copy> = {}): Project {
  if (!p.meta) return W === p.canvas.width && H === p.canvas.height ? p : { ...p, canvas: { ...p.canvas, width: W, height: H }, layers: resizeLayers(p.layers, p.canvas, { width: W, height: H }) };
  const meta: ProjectMeta = { ...p.meta, ...patch }; if (patch.style) meta.needsPhoto = isPhotoStyle(patch.style);
  const tx = (n: string) => { const l = p.layers.find(x => x.name === n); return l?.type === "text" ? l.text : undefined; };
  const copy: Copy = { headline: tx("headline") ?? "", subtitle: tx("subtitle") ?? "", cta: (tx("cta") ?? "Learn more").replace(/\s*→\s*$/, ""), hook: tx("hook") ?? "", badge: tx("badge-text"), ...over };
  const img = p.layers.find((l): l is ImageLayer => l.name === "image" && l.type === "image"), photo = img && img.assetId !== "placeholder" ? { assetId: img.assetId, fit: img.fit, focusX: img.focusX, focusY: img.focusY } : undefined;
  const { background, layers } = layoutFor({ style: meta.style as Style, palette: meta.palette, emojis: meta.emojis, W, H, copy, art: meta.art, font: meta.font, photo });
  const extras = resizeLayers(p.layers.filter(l => !ROLE_NAMES.has(l.name)), p.canvas, { width: W, height: H });
  return fitAll({ ...p, meta, canvas: { ...p.canvas, width: W, height: H, background }, layers: [...layers, ...extras] });
}
export const smartResize = (p: Project, W: number, H: number): Project => relayout(p, {}, W, H);
export const otherSizes = (p: Project): Project[] => FORMATS.filter(f => f.w !== p.canvas.width || f.h !== p.canvas.height).map(f => ({ ...smartResize(p, f.w, f.h), id: uid(), name: `${p.name} — ${f.label}` }));
