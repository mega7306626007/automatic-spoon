import type { StockPhoto } from "./photos";
export interface LibEntry { id: string; file: string; category: string; w: number; h: number; author: string; authorUrl: string; pageUrl: string; alt: string }
export interface Manifest { version: 1; photos: LibEntry[] }
/** What `npm run photos` searches for, per template category. */
export const LIB_QUERIES: Record<string, string[]> = {
  food: ["bakery fresh bread", "restaurant food plate"], fashion: ["fashion clothing boutique", "stylish outfit portrait"], events: ["concert crowd lights", "party celebration friends"], education: ["students classroom learning", "books study desk"],
  technology: ["laptop coding desk", "smartphone technology"], "real-estate": ["modern house exterior", "living room interior"], services: ["hair salon barber", "repair tools workshop"], offers: ["shopping bags sale", "gift boxes ribbon"], retail: ["shop store shelves", "market stall produce"], "product-launch": ["product box unboxing", "gadget on desk"] };
export const CATEGORY_HINT: Record<string, string> = { food: "food", fashion: "fashion", events: "event", education: "classroom", technology: "technology", "real-estate": "home interior", services: "service", offers: "shopping", retail: "shop", "product-launch": "product" };
export function parseManifest(j: unknown): Manifest | null {
  const m = j as any; if (!m || m.version !== 1 || !Array.isArray(m.photos)) return null; const ok = (e: any) => e && typeof e.id === "string" && typeof e.file === "string" && /^[\w.\-]+$/.test(e.file) && typeof e.category === "string";
  return { version: 1, photos: m.photos.filter(ok).map((e: any): LibEntry => ({ id: e.id, file: e.file, category: e.category, w: Number(e.w) || 0, h: Number(e.h) || 0, author: String(e.author ?? "Unknown"), authorUrl: String(e.authorUrl ?? ""), pageUrl: String(e.pageUrl ?? ""), alt: String(e.alt ?? "") })) };
}
export const entryToPhoto = (e: LibEntry): StockPhoto => ({ id: e.id, thumb: `/stock/${e.file}`, src: `/stock/${e.file}`, w: e.w, h: e.h, author: e.author, authorUrl: e.authorUrl, pageUrl: e.pageUrl, alt: e.alt, source: "library" });
export const manifestEntries = (category: string, photos: StockPhoto[]): LibEntry[] => photos.map(p => ({ id: p.id, file: `${category}-${p.id}.jpg`, category, w: p.w, h: p.h, author: p.author, authorUrl: p.authorUrl, pageUrl: p.pageUrl, alt: p.alt }));
/** Deterministic pick from the local library: same category if any, otherwise any photo. */
export function pickLocal(m: Manifest, category: string, seed: number): StockPhoto | undefined {
  const inCat = m.photos.filter(p => p.category === category), pool = inCat.length ? inCat : m.photos; return pool.length ? entryToPhoto(pool[seed % pool.length]) : undefined; }
export async function loadManifest(fetchImpl: typeof fetch = (...a) => fetch(...a)): Promise<Manifest | null> {
  try { const r = await fetchImpl("/stock/manifest.json", { cache: "no-store" }); if (!r.ok) return null; const m = parseManifest(await r.json()); return m && m.photos.length ? m : null; } catch { return null; } }
