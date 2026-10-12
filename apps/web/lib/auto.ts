import { generateCopyWithFallback, type Brief, type Tone } from "@adforge/ai-orchestrator";
import { instantiate, recommendTemplate } from "@adforge/template-library";
import type { Project } from "@adforge/creative-schema";
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
/** One sentence in, finished design(s) out: picks a template, writes offline copy, applies the brand kit, fits text, makes other sizes. */
export async function autoCreate(idea: string, o: { kit?: BrandKit; tone?: Tone; language?: string; allSizes?: boolean } = {}): Promise<{ project: Project; extras: Project[]; captions: string }> {
  const parsed = parseIdea(idea), tpl = recommendTemplate(idea);
  const brief: Brief = { product: parsed.product, tone: o.tone ?? "friendly", language: o.language ?? "en", offer: parsed.offer, price: parsed.price, brandName: o.kit?.name };
  const { copy } = await generateCopyWithFallback([], brief);
  const subtitle = [parsed.offer, parsed.price, parsed.when].filter(Boolean).join(" · ") || copy.supporting[0];
  let project = instantiate(tpl, { id: uid(), name: parsed.product, copy: { headline: copy.headlines[0], subtitle, cta: copy.ctas[0] } });
  if (o.kit) project = applyBrandKit(project, o.kit); project = fitAll(project);
  return { project, extras: o.allSizes === false ? [] : otherSizes(project), captions: [...copy.captions, "", copy.hashtags.join(" ")].join("\n") };
}
