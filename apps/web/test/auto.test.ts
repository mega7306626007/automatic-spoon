import { test } from "node:test"; import assert from "node:assert/strict";
import { validateProject, estimateTextOverflow } from "@adforge/creative-schema";
import { fitFontSize } from "../lib/autofit.ts"; import { smartResize, otherSizes } from "../lib/smart.ts"; import { makeZip, crc32 } from "../lib/zip.ts";
import { extractPalette } from "../lib/palette.ts"; import { fixContrast, brandWarnings, kitColorsFromPalette, contrast } from "../lib/brand.ts"; import { parseIdea, autoCreate } from "../lib/auto.ts"; import { blankProject } from "../lib/sample.ts";
import { instantiate, TEMPLATES, EMOTIONS } from "@adforge/template-library"; import type { TextLayer } from "@adforge/creative-schema"; import { relayout } from "../lib/smart.ts"; import { setPillText } from "../lib/pill.ts";
const m = (s: string, size: number) => s.length * size * 0.5;
test("fitFontSize shrinks to fit, never exceeds max", () => {
  const l: TextLayer = { id: "t", name: "t", type: "text", x: 0, y: 0, w: 200, h: 60, rotation: 0, opacity: 1, text: "A fairly long headline that needs shrinking", fontFamily: "x", fontSize: 80, color: "#fff", align: "left", lineHeight: 1.2, letterSpacing: 0, autoFit: true, fitMax: 80 };
  const f = fitFontSize(l, m); assert.ok(f < 80 && f >= 8); assert.ok(fitFontSize({ ...l, text: "Hi", h: 200 }, m) === 80 || fitFontSize({ ...l, text: "Hi", h: 200 }, m) <= 80);
  const wrapped = estimateTextOverflow({ ...l, fontSize: f }); void wrapped; });
test("smartResize re-lays out any style for any format, keeps copy/photo/custom layers", () => {
  for (const t of [TEMPLATES[0], TEMPLATES[1], TEMPLATES[2], TEMPLATES[3]]) { const p = instantiate(t, { copy: { headline: "Fresh Bread Daily", badge: "20% off" } });
    p.layers.push({ id: "x", name: "My badge", type: "shape", shape: "rect", x: 100, y: 100, w: 100, h: 50, rotation: 0, opacity: 1, fill: { kind: "solid", color: "#ff0000" } });
    for (const [w, h] of [[1080, 1920], [1920, 1080], [1080, 1080], [1500, 500]] as const) { const r = smartResize(p, w, h); assert.ok(validateProject(r).ok, `${t.id} ${w}x${h}`); assert.equal(r.canvas.width, w);
      const head = r.layers.find(l => l.name === "headline"); assert.ok(head?.type === "text" && head.text === "Fresh Bread Daily"); assert.ok(r.layers.some(l => l.name === "badge-text"));
      assert.ok(r.layers.some(l => l.id === "x" && Math.abs(l.w / l.h - 2) < 1e-9)); assert.equal(r.meta?.style, t.style); } }
  assert.equal(otherSizes(instantiate(TEMPLATES.find(t => t.id === "food-burst")!)).length, 2); assert.equal(otherSizes(instantiate(TEMPLATES[0])).length, 3); });
test("photo survives relayout; mood change keeps words", () => {
  const p = instantiate(TEMPLATES[0], { photo: { assetId: "a1", focusX: 1 }, copy: { headline: "Hello World" } }); const r = smartResize(p, 1080, 1920), img = r.layers.find(l => l.name === "image");
  assert.ok(img?.type === "image" && img.assetId === "a1" && img.focusX === 1);
  const m = relayout(p, { emotion: "urgency", palette: EMOTIONS.urgency.palette, emojis: EMOTIONS.urgency.emojis, art: "rays" }); const h = m.layers.find(l => l.name === "headline");
  assert.ok(h?.type === "text" && h.text === "Hello World"); assert.equal(m.meta?.emotion, "urgency"); assert.notEqual(m.meta?.palette.primary, p.meta?.palette.primary); });
test("setPillText resizes the chip and keeps it centred when it was", () => {
  const p = instantiate(TEMPLATES[0]), bg0 = p.layers.find(l => l.name === "hook-bg")!, q = setPillText(p, "hook", "A much longer hook line here"), bg1 = q.layers.find(l => l.name === "hook-bg")!;
  assert.ok(bg1.w > bg0.w); assert.ok(validateProject(q).ok); const c = instantiate(TEMPLATES.find(t => t.id === "food-burst")!); const cb = c.layers.find(l => l.name === "hook-bg")!, c2 = setPillText(c, "hook", "Short"), cb2 = c2.layers.find(l => l.name === "hook-bg")!;
  assert.ok(Math.abs((cb.x + cb.w / 2) - (cb2.x + cb2.w / 2)) < 3); });
test("zip structure and CRC", () => {
  const z = makeZip([{ name: "a.txt", data: new TextEncoder().encode("hello") }, { name: "b/ü.png", data: new Uint8Array([1, 2, 3]) }]), dv = new DataView(z.buffer);
  assert.equal(dv.getUint32(0, true), 0x04034b50); assert.equal(dv.getUint32(z.length - 22, true), 0x06054b50); assert.equal(dv.getUint16(z.length - 22 + 10, true), 2); assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926); });
test("palette extraction finds dominant colours", () => {
  const px: number[] = []; const add = (c: number[], n: number) => { for (let i = 0; i < n; i++) px.push(...c, 255); }; add([200, 30, 30], 70); add([10, 15, 40], 20); add([250, 220, 20], 10);
  const pal = extractPalette(px, 4); assert.ok(pal.length >= 3 && pal[0] === "#C81E1E"); const k = kitColorsFromPalette(pal); assert.ok(contrast(k.text, k.background) >= 4.5); assert.ok(["#C81E1E", "#FADC14"].includes(k.primary) && k.primary !== k.background); });
test("fixContrast repairs unreadable text and leaves the rest", () => {
  const p = blankProject(); p.canvas.background = { kind: "solid", color: "#FFFFFF" }; assert.ok(brandWarnings(p).length > 0);
  const f = fixContrast(p); assert.deepEqual(brandWarnings(f), []); assert.equal(f.layers.length, p.layers.length); assert.deepEqual(fixContrast(f), f); });
test("parseIdea extracts only what was typed", () => {
  assert.deepEqual(parseIdea("Mama Pima bakery fresh bread 20% off this weekend"), { product: "Mama Pima bakery fresh bread", offer: "20% off", price: undefined, when: "this weekend" });
  const q = parseIdea("Fresh juice KES 150 only"); assert.equal(q.price, "KES 150"); assert.equal(q.offer, undefined); assert.equal(parseIdea("Pizza night 2 for 1 KES 800").offer, "2 for 1"); assert.equal(parseIdea("Pizza night 2 for 1 KES 800").price, "KES 800"); assert.equal(parseIdea("Shoes 3000 ksh").price, "3000 ksh"); assert.equal(parseIdea("Fresh juice").offer, undefined); });
test("autoCreate: valid, no invented figures, extra sizes, fitted text", async () => {
  const r = await autoCreate("Wanjiku hair salon braids and styling for ladies"); assert.ok(validateProject(r.project).ok); assert.ok(r.extras.length >= 2 && r.extras.length <= 3); assert.ok(r.extras.every(e => validateProject(e).ok)); assert.ok(r.extras.every(e => e.layers.filter(l => l.name === "illo").length <= 1));
  const texts = r.project.layers.flatMap(l => (l.type === "text" ? [l.text] : [])).join(" "); assert.ok(!/\d/.test(texts), texts);
  const w = await autoCreate("Pizza night 2 for 1 KES 800", {}); assert.ok(w.project.layers.some(l => l.name === "badge-text" && l.type === "text" && l.text === "2 for 1")); assert.ok(w.project.layers.some(l => l.name === "hook")); assert.ok(!r.project.layers.some(l => l.name === "badge")); const t2 = w.project.layers.flatMap(l => (l.type === "text" ? [l.text] : [])).join(" "); assert.ok(t2.includes("KES 800")); assert.ok(/Pizza/.test(t2)); });

test("autoCreate with a photo uses a photo layout and registers the asset", async () => {
  const r = await autoCreate("Wanjiku hair salon braids", { photo: { dataUrl: "data:image/jpeg;base64,AAAA", w: 800, h: 600, name: "me.jpg" } }); const id = Object.keys(r.assets)[0];
  assert.ok(r.project.meta?.needsPhoto); const img = r.project.layers.find(l => l.name === "image"); assert.ok(img?.type === "image" && img.assetId === id); assert.ok(r.project.assets.some(a => a.id === id)); assert.ok(validateProject(r.project).ok);
  assert.ok(r.extras.every(e => e.layers.some(l => l.type === "image" && l.assetId === id))); });
