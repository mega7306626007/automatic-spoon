import { test } from "node:test"; import assert from "node:assert/strict";
import { validateProject, estimateTextOverflow } from "@adforge/creative-schema";
import { fitFontSize } from "../lib/autofit.ts"; import { smartResize, otherSizes } from "../lib/smart.ts"; import { makeZip, crc32 } from "../lib/zip.ts";
import { extractPalette } from "../lib/palette.ts"; import { fixContrast, brandWarnings, kitColorsFromPalette, contrast } from "../lib/brand.ts"; import { parseIdea, autoCreate } from "../lib/auto.ts";
import { instantiate, TEMPLATES } from "@adforge/template-library"; import type { TextLayer } from "@adforge/creative-schema";
const m = (s: string, size: number) => s.length * size * 0.5;
test("fitFontSize shrinks to fit, never exceeds max", () => {
  const l: TextLayer = { id: "t", name: "t", type: "text", x: 0, y: 0, w: 200, h: 60, rotation: 0, opacity: 1, text: "A fairly long headline that needs shrinking", fontFamily: "x", fontSize: 80, color: "#fff", align: "left", lineHeight: 1.2, letterSpacing: 0, autoFit: true, fitMax: 80 };
  const f = fitFontSize(l, m); assert.ok(f < 80 && f >= 8); assert.ok(fitFontSize({ ...l, text: "Hi", h: 200 }, m) === 80 || fitFontSize({ ...l, text: "Hi", h: 200 }, m) <= 80);
  const wrapped = estimateTextOverflow({ ...l, fontSize: f }); void wrapped; });
test("smartResize keeps copy/colours and fits every format; custom layers survive", () => {
  const p = instantiate(TEMPLATES[0]); p.layers.push({ id: "x", name: "My badge", type: "shape", shape: "rect", x: 100, y: 100, w: 100, h: 50, rotation: 0, opacity: 1, fill: { kind: "solid", color: "#ff0000" } });
  for (const [w, h] of [[1080, 1920], [1920, 1080], [1080, 1080]] as const) { const r = smartResize(p, w, h); assert.ok(validateProject(r).ok, `${w}x${h}`); assert.equal(r.canvas.width, w);
    const head = r.layers.find(l => l.name === "headline"); assert.ok(head?.type === "text" && head.text === "Meet Your New Product"); assert.ok(r.layers.some(l => l.id === "x" && Math.abs(l.w / l.h - 2) < 1e-9));
    for (const l of r.layers) if (l.name !== "accent") assert.ok(l.x >= -1 && l.y >= -1 && l.x + l.w <= w + 1 && l.y + l.h <= h + 1, `${w}x${h} ${l.name}`); }
  assert.equal(otherSizes(p).length, 2); assert.ok(otherSizes(p).every(x => x.id !== p.id)); });
test("zip structure and CRC", () => {
  const z = makeZip([{ name: "a.txt", data: new TextEncoder().encode("hello") }, { name: "b/ü.png", data: new Uint8Array([1, 2, 3]) }]), dv = new DataView(z.buffer);
  assert.equal(dv.getUint32(0, true), 0x04034b50); assert.equal(dv.getUint32(z.length - 22, true), 0x06054b50); assert.equal(dv.getUint16(z.length - 22 + 10, true), 2); assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926); });
test("palette extraction finds dominant colours", () => {
  const px: number[] = []; const add = (c: number[], n: number) => { for (let i = 0; i < n; i++) px.push(...c, 255); }; add([200, 30, 30], 70); add([10, 15, 40], 20); add([250, 220, 20], 10);
  const pal = extractPalette(px, 4); assert.ok(pal.length >= 3 && pal[0] === "#C81E1E"); const k = kitColorsFromPalette(pal); assert.ok(contrast(k.text, k.background) >= 4.5); assert.ok(["#C81E1E", "#FADC14"].includes(k.primary) && k.primary !== k.background); });
test("fixContrast repairs unreadable text and leaves the rest", () => {
  const p = instantiate(TEMPLATES[0]); p.canvas.background = { kind: "solid", color: "#FFFFFF" }; assert.ok(brandWarnings(p).length > 0);
  const f = fixContrast(p); assert.deepEqual(brandWarnings(f), []); assert.equal(f.layers.length, p.layers.length); assert.deepEqual(fixContrast(f), f); });
test("parseIdea extracts only what was typed", () => {
  assert.deepEqual(parseIdea("Mama Pima bakery fresh bread 20% off this weekend"), { product: "Mama Pima bakery fresh bread", offer: "20% off", price: undefined, when: "this weekend" });
  const q = parseIdea("Fresh juice KES 150 only"); assert.equal(q.price, "KES 150"); assert.equal(q.offer, undefined); assert.equal(parseIdea("Pizza night 2 for 1 KES 800").offer, "2 for 1"); assert.equal(parseIdea("Pizza night 2 for 1 KES 800").price, "KES 800"); assert.equal(parseIdea("Shoes 3000 ksh").price, "3000 ksh"); assert.equal(parseIdea("Fresh juice").offer, undefined); });
test("autoCreate: valid, no invented figures, extra sizes, fitted text", async () => {
  const r = await autoCreate("Wanjiku hair salon braids and styling for ladies"); assert.ok(validateProject(r.project).ok); assert.equal(r.extras.length, 2); assert.ok(r.extras.every(e => validateProject(e).ok));
  const texts = r.project.layers.flatMap(l => (l.type === "text" ? [l.text] : [])).join(" "); assert.ok(!/\d/.test(texts), texts);
  const w = await autoCreate("Pizza night 2 for 1 KES 800", {}); const t2 = w.project.layers.flatMap(l => (l.type === "text" ? [l.text] : [])).join(" "); assert.ok(t2.includes("KES 800")); assert.ok(/Pizza/.test(t2)); });
