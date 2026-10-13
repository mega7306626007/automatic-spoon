import type { AssetCredit } from "@adforge/creative-schema";
import { recommendTemplate } from "@adforge/template-library";
import { hash, parseIdea, photoQuery } from "./auto";
import { loadManifest, pickLocal } from "./library";
import { creditOf, searchPexels, type StockPhoto } from "./photos";
import type { Settings } from "./store";
import { downscale } from "./useStudio";
export interface FoundPhoto { dataUrl: string; w: number; h: number; name: string; credit: AssetCredit }
export async function photoToData(p: StockPhoto): Promise<FoundPhoto> {
  const res = await fetch(p.src); if (!res.ok) throw new Error(`download failed (${res.status})`); const blob = await res.blob();
  const d = await downscale(new File([blob], `${p.id}.jpg`, { type: blob.type || "image/jpeg" })); return { ...d, name: p.alt || `Photo ${p.id}`, credit: creditOf(p) };
}
/** Pick a photo for an idea: local library first (offline), then Pexels if the user enabled it and agrees to this request. */
export async function findPhotoFor(idea: string, settings: Settings, ask: (query: string) => boolean): Promise<{ photo?: FoundPhoto; note: string }> {
  const tpl = recommendTemplate(idea, { photo: true }), seed = hash(idea), m = await loadManifest();
  if (m) { const p = pickLocal(m, tpl.category, seed); if (p) try { return { photo: await photoToData(p), note: `Used a photo from your library (${p.author}).` }; } catch { /* fall through */ } }
  if (settings.photosEnabled && settings.pexelsKey.trim()) { const q = photoQuery(parseIdea(idea).product, tpl.category);
    if (ask(q)) try { const list = await searchPexels(q, settings.pexelsKey, { perPage: 10, orientation: "portrait" }), p = list[seed % Math.max(1, list.length)]; if (p) return { photo: await photoToData(p), note: `Photo by ${p.author} on Pexels.` }; return { note: "No matching photos found. Made a graphic design instead." }; }
    catch (e) { return { note: `Could not get a stock photo (${(e as Error).message}). Made a graphic design instead.` }; } }
  return { note: "No photo available: add photos with “npm run photos” or turn on stock photos in Settings. Made a graphic design instead." };
}
