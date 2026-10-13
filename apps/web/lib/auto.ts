import { generateCopyWithFallback, type Brief, type Tone } from "@adforge/ai-orchestrator";
import { emotionFor, hooksFor, illoFor, instantiate, recommendTemplate } from "@adforge/template-library";
import type { AssetCredit, Project } from "@adforge/creative-schema";
import { CATEGORY_HINT } from "./library";
import { applyBrandKit, type BrandKit } from "./brand";
import { fitAll, otherSizes } from "./smart";
import { uid } from "./sample";
export interface Idea { product: string; offer?: string; price?: string; when?: string }
const OFFER = /\b(\d{1,3}\s?%\s?(off|discount)?|buy\s?\d+\s?get\s?\d+(\s?free)?|\d+\s?for\s?\d+)/i;
const PRICE_A = /(\b(ksh?s?|kes|usd)\.?\s?\d[\d,]*|\$\s?\d[\d,.]*)/i, PRICE_B = /\b\d[\d,]*\s?(ksh|kes|bob)\b/i;
const WHEN = /\b((this|next)\s+(weekend|week|month|friday|saturday|sunday|monday|tuesday|wednesday|thursday)|today|tonight|tomorrow)\b/i;
/** Pull a product name and any offer/price/timing the user actually typed. Nothing is invented. */
export function parseIdea(text: string): Idea {
  let t = text.trim().replace(/\s+/g, " "); const take = (re: RegExp) => { const m = t.match(re); if (!m) return undefined; t = t.replace(m[0], " "); return m[0].trim(); };
  const offer = take(OFFER), price = take(PRICE_A) ?? take(PRICE_B), when = take(WHEN);
  const words = t.replace(/[,.;:!-]+/g, " ").split(/\s+/).filter(Boolean); while (words.length && /^(at|for|only|just|now|from|on)$/i.test(words[words.length - 1])) words.pop();
  return { product: words.slice(0, 6).join(" ") || text.trim().slice(0, 40), offer, price, when };
}
export const hash = (t: string) => { let h = 0; for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
export interface Photo { dataUrl: string; w: number; h: number; name?: string; credit?: AssetCredit }
/** Search words for a stock photo: the product words plus a category hint. */
export const photoQuery = (product: string, category: string) => `${product.split(/\s+/).slice(0, 3).join(" ")} ${CATEGORY_HINT[category] ?? ""}`.trim();
/** One sentence in, finished design(s) out: picks a layout and mood, writes an emotional hook and offline copy, uses your photo, applies the brand kit, fits text, makes other sizes. */
export async function autoCreate(idea: string, o: { kit?: BrandKit; tone?: Tone; language?: string; allSizes?: boolean; photo?: Photo } = {}): Promise<{ project: Project; extras: Project[]; captions: string; assets: Record<string, string> }> {
  const parsed = parseIdea(idea), tpl = recommendTemplate(idea, { photo: !!o.photo, pick: hash(idea) }), illo = illoFor(idea, tpl.category, hash(idea)), emotion = emotionFor(idea, tpl.emotion), hooks = hooksFor(tpl.category, emotion);
  const brief: Brief = { product: parsed.product, tone: o.tone ?? "friendly", language: o.language ?? "en", offer: parsed.offer, price: parsed.price, brandName: o.kit?.name };
  const { copy } = await generateCopyWithFallback([], brief);
  const subtitle = [parsed.offer && !o.photo ? undefined : undefined, parsed.price, parsed.when].filter(Boolean).join(" · ") || (parsed.offer ? `${parsed.offer}` : copy.supporting[1] ?? copy.supporting[0]);
  const photoId = o.photo ? uid() : undefined;
  let project = instantiate(tpl, { id: uid(), name: parsed.product, emotion, illo, copy: { headline: cap(parsed.product), subtitle, cta: copy.ctas[0], hook: hooks[hash(idea) % hooks.length], badge: parsed.offer }, photo: photoId ? { assetId: photoId } : undefined });
  const assets: Record<string, string> = {}; if (photoId && o.photo) { assets[photoId] = o.photo.dataUrl; project = { ...project, assets: [...project.assets, { id: photoId, kind: "image", mime: o.photo.dataUrl.slice(5, o.photo.dataUrl.indexOf(";")), name: o.photo.name ?? "Your photo", ...(o.photo.credit ? { credit: o.photo.credit } : {}) }] }; }
  if (o.kit) project = applyBrandKit(project, o.kit); project = fitAll(project);
  return { project, extras: o.allSizes === false ? [] : otherSizes(project), captions: [...copy.captions, "", copy.hashtags.join(" ")].join("\n"), assets };
}
