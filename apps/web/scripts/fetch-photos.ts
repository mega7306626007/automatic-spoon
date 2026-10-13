// Downloads real photos from Pexels into apps/web/public/stock for use as an OFFLINE library.
// Usage:  PEXELS_API_KEY=your_key npm run photos -w @adforge/web      (free key: https://www.pexels.com/api/)
// The folder is git-ignored on purpose: Pexels does not allow redistributing its photos in another library.
import { mkdir, readFile, writeFile } from "node:fs/promises"; import { existsSync } from "node:fs"; import { fileURLToPath } from "node:url";
import { searchPexels } from "../lib/photos.ts"; import { LIB_QUERIES, manifestEntries, parseManifest, type LibEntry } from "../lib/library.ts";
const key = process.env.PEXELS_API_KEY; if (!key) { console.error("Set PEXELS_API_KEY first. Free key: https://www.pexels.com/api/"); process.exit(1); }
const PER = Math.max(1, Math.min(10, Number(process.env.PHOTOS_PER_QUERY ?? 3))), dir = fileURLToPath(new URL("../public/stock/", import.meta.url)), manifestPath = dir + "manifest.json";
await mkdir(dir, { recursive: true }); const old = existsSync(manifestPath) ? parseManifest(JSON.parse(await readFile(manifestPath, "utf8"))) : null, have = new Map<string, LibEntry>((old?.photos ?? []).map(e => [e.file, e]));
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms)); let added = 0, failed = 0;
for (const [cat, queries] of Object.entries(LIB_QUERIES)) for (const q of queries) {
  try { const found = await searchPexels(q, key, { perPage: PER, orientation: "portrait" });
    for (const [i, e] of manifestEntries(cat, found).entries()) { if (have.has(e.file)) continue; const res = await fetch(found[i].src); if (!res.ok) { failed++; continue; }
      await writeFile(dir + e.file, Buffer.from(await res.arrayBuffer())); have.set(e.file, e); added++; console.log(`+ ${e.file}  (${e.author})`); }
  } catch (err) { failed++; console.error(`! ${cat} / ${q}: ${(err as Error).message}`); if (/rate limit|rejected/.test((err as Error).message)) break; }
  await sleep(400); }
await writeFile(manifestPath, JSON.stringify({ version: 1, photos: [...have.values()] }, null, 1));
console.log(`\nDone: ${added} new photo(s), ${failed} problem(s). ${have.size} photos in the library.\nPhotos are from Pexels (https://www.pexels.com/license/). Credits are kept in manifest.json and added to downloads.`);
