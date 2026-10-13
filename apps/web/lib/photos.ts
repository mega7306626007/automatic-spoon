import type { AssetCredit } from "@adforge/creative-schema";
export interface StockPhoto { id: string; thumb: string; src: string; w: number; h: number; author: string; authorUrl: string; pageUrl: string; alt: string; source: "pexels" | "library" }
export const PEXELS_URL = "https://api.pexels.com/v1/search";
const safeUrl = (u: unknown): string | null => { if (typeof u !== "string") return null; try { const x = new URL(u, "http://local.invalid"); return x.protocol === "https:" || x.protocol === "http:" || u.startsWith("/") ? u : null; } catch { return null; } };
const str = (v: unknown, d = "") => (typeof v === "string" ? v.slice(0, 300) : d);
/** Search Pexels. Sends only the query text and the user's API key to api.pexels.com; call only after the user has consented. */
export async function searchPexels(query: string, key: string, o: { orientation?: "portrait" | "landscape" | "square"; perPage?: number; fetchImpl?: typeof fetch } = {}): Promise<StockPhoto[]> {
  if (!key.trim()) throw new Error("Add a Pexels API key in Settings first"); if (!query.trim()) throw new Error("Type what kind of photo you want");
  const u = new URL(PEXELS_URL); u.searchParams.set("query", query.trim()); u.searchParams.set("per_page", String(Math.min(40, o.perPage ?? 12))); if (o.orientation) u.searchParams.set("orientation", o.orientation);
  const res = await (o.fetchImpl ?? fetch)(u.toString(), { headers: { Authorization: key.trim() } });
  if (res.status === 401 || res.status === 403) throw new Error("Pexels rejected the API key"); if (res.status === 429) throw new Error("Pexels rate limit reached. Try again later");
  if (!res.ok) throw new Error(`Pexels error ${res.status}`);
  let j: any; try { j = await res.json(); } catch { throw new Error("Pexels sent an unreadable answer"); }
  if (!Array.isArray(j?.photos)) throw new Error("Pexels sent an unexpected answer");
  return j.photos.flatMap((p: any): StockPhoto[] => { const src = safeUrl(p?.src?.large2x ?? p?.src?.large), thumb = safeUrl(p?.src?.medium ?? p?.src?.small), page = safeUrl(p?.url), au = safeUrl(p?.photographer_url);
    if (!src || !thumb || !page || typeof p?.id !== "number") return []; return [{ id: String(p.id), thumb, src, w: Number(p.width) || 0, h: Number(p.height) || 0, author: str(p.photographer, "Unknown"), authorUrl: au ?? page, pageUrl: page, alt: str(p.alt), source: "pexels" }]; });
}
export const creditOf = (p: StockPhoto): AssetCredit => ({ author: p.author, url: p.pageUrl, source: p.source === "pexels" ? "Pexels" : "Photo library" });
export const creditLine = (c: AssetCredit) => `Photo: ${c.author} (${c.source}) ${c.url}`;
