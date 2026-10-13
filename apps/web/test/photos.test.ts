import { test } from "node:test"; import assert from "node:assert/strict";
import { searchPexels, creditOf, creditLine, PEXELS_URL } from "../lib/photos.ts"; import { parseManifest, pickLocal, manifestEntries, entryToPhoto, LIB_QUERIES } from "../lib/library.ts"; import { photoQuery } from "../lib/auto.ts"; import { autoCreate } from "../lib/auto.ts"; import { validateProject } from "@adforge/creative-schema";
const px = (o: object = {}) => ({ id: 101, width: 4000, height: 6000, url: "https://www.pexels.com/photo/x-101/", photographer: "Ann Lee", photographer_url: "https://www.pexels.com/@ann", alt: "Fresh bread", src: { large2x: "https://images.pexels.com/photos/101/big.jpg", large: "https://images.pexels.com/photos/101/l.jpg", medium: "https://images.pexels.com/photos/101/m.jpg" }, ...o });
const stub = (status: number, body: unknown) => { const calls: { url: string; init: any }[] = []; return { calls, f: (async (url: string, init: any) => { calls.push({ url, init }); return new Response(typeof body === "string" ? body : JSON.stringify(body), { status }); }) as unknown as typeof fetch }; };
test("searchPexels builds the request and maps photos with credit data", async () => {
  const s = stub(200, { photos: [px()] }); const r = await searchPexels(" fresh bread ", " KEY123 ", { orientation: "portrait", perPage: 5, fetchImpl: s.f });
  assert.ok(s.calls[0].url.startsWith(PEXELS_URL) && s.calls[0].url.includes("query=fresh+bread") && s.calls[0].url.includes("per_page=5") && s.calls[0].url.includes("orientation=portrait")); assert.equal(s.calls[0].init.headers.Authorization, "KEY123");
  assert.equal(r.length, 1); assert.equal(r[0].author, "Ann Lee"); assert.equal(r[0].src, "https://images.pexels.com/photos/101/big.jpg"); assert.deepEqual(creditOf(r[0]), { author: "Ann Lee", url: "https://www.pexels.com/photo/x-101/", source: "Pexels" }); assert.match(creditLine(creditOf(r[0])), /Ann Lee/); });
test("searchPexels errors are clear and nothing is sent without a key or query", async () => {
  const s = stub(200, { photos: [] }); await assert.rejects(searchPexels("x", " ", { fetchImpl: s.f }), /API key/); await assert.rejects(searchPexels(" ", "k", { fetchImpl: s.f }), /what kind/); assert.equal(s.calls.length, 0);
  await assert.rejects(searchPexels("x", "k", { fetchImpl: stub(401, {}).f }), /rejected/); await assert.rejects(searchPexels("x", "k", { fetchImpl: stub(429, {}).f }), /rate limit/); await assert.rejects(searchPexels("x", "k", { fetchImpl: stub(500, {}).f }), /error 500/);
  await assert.rejects(searchPexels("x", "k", { fetchImpl: stub(200, "not json").f }), /unreadable/); await assert.rejects(searchPexels("x", "k", { fetchImpl: stub(200, { nope: 1 }).f }), /unexpected/); });
test("unsafe or malformed photo entries are dropped", async () => {
  const bad = [px({ id: "str" }), px({ src: { large2x: "javascript:alert(1)", medium: "https://a/m.jpg" } }), px({ url: 5 }), px({ id: 202 })]; const r = await searchPexels("x", "k", { fetchImpl: stub(200, { photos: bad }).f }); assert.deepEqual(r.map(p => p.id), ["202"]); });
test("library manifest: parse, pick deterministically with category fallback", () => {
  assert.equal(parseManifest(null), null); assert.equal(parseManifest({ version: 2, photos: [] }), null);
  const m = parseManifest({ version: 1, photos: [{ id: "1", file: "food-1.jpg", category: "food", author: "A" }, { id: "2", file: "food-2.jpg", category: "food" }, { id: "3", file: "../evil.jpg", category: "food" }, { id: "4", file: "fashion-4.jpg", category: "fashion" }] })!;
  assert.equal(m.photos.length, 3); assert.equal(pickLocal(m, "food", 0)?.id, "1"); assert.equal(pickLocal(m, "food", 3)?.id, "2"); assert.equal(pickLocal(m, "fashion", 9)?.id, "4"); assert.ok(pickLocal(m, "events", 1)); assert.equal(pickLocal({ version: 1, photos: [] }, "food", 1), undefined);
  assert.equal(entryToPhoto(m.photos[0]).src, "/stock/food-1.jpg"); assert.equal(entryToPhoto(m.photos[0]).source, "library"); });
test("manifestEntries file names and every category has search words", () => {
  const e = manifestEntries("food", [{ id: "9", thumb: "t", src: "s", w: 1, h: 2, author: "Z", authorUrl: "u", pageUrl: "p", alt: "a", source: "pexels" }]); assert.equal(e[0].file, "food-9.jpg");
  for (const c of ["food", "fashion", "events", "education", "technology", "real-estate", "services", "offers", "retail", "product-launch"]) assert.ok(LIB_QUERIES[c]?.length, c); });
test("photoQuery combines product words with a hint", () => { assert.equal(photoQuery("Mama Pima bakery fresh bread", "food"), "Mama Pima bakery food"); assert.equal(photoQuery("Sunrise", "real-estate"), "Sunrise home interior"); });
test("autoCreate keeps the photo credit on the asset", async () => {
  const r = await autoCreate("Wanjiku hair salon", { photo: { dataUrl: "data:image/jpeg;base64,AAAA", w: 800, h: 1000, name: "x", credit: { author: "Ann Lee", url: "https://www.pexels.com/photo/x-101/", source: "Pexels" } } });
  const id = Object.keys(r.assets)[0]; assert.equal(r.project.assets.find(a => a.id === id)?.credit?.author, "Ann Lee"); assert.ok(validateProject(r.project).ok); });
