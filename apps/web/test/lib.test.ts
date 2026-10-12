import { test } from "node:test"; import assert from "node:assert/strict";
import { wrapLines, textOverflows } from "../lib/text.ts"; import { snapMove } from "../lib/snap.ts"; import { applyBrandKit, brandWarnings, contrast, type BrandKit } from "../lib/brand.ts";
import { parsePackage, toPackage } from "../lib/store.ts"; import { blankProject } from "../lib/sample.ts";
const m = (s: string, size: number) => s.length * size * 0.5;
test("wrapLines wraps at word boundaries and keeps newlines", () => {
  assert.deepEqual(wrapLines("aaa bbb ccc", 40, 10, "x", 0, m), ["aaa bbb", "ccc"]); assert.deepEqual(wrapLines("a\n\nb", 100, 10, "x", 0, m), ["a", "", "b"]); });
test("overflow: too many lines or an over-wide word", () => {
  const l = { text: "aaa bbb ccc ddd", w: 40, h: 20, fontSize: 10, fontFamily: "x", lineHeight: 1.2, letterSpacing: 0 };
  assert.equal(textOverflows(l, m), true); assert.equal(textOverflows({ ...l, h: 100, w: 200 }, m), false); assert.equal(textOverflows({ ...l, text: "supercalifragilistic", w: 30, h: 100 }, m), true); });
test("snap to canvas centre and other layers", () => {
  const s = snapMove({ x: 497, y: 100, w: 100, h: 50 }, { w: 1080, h: 1080 }, [], 8); assert.equal(s.dx, 540 - 547); assert.deepEqual(s.guides[0], { axis: "x", pos: 540 });
  const t = snapMove({ x: 300, y: 203, w: 50, h: 50 }, { w: 1080, h: 1080 }, [{ x: 0, y: 200, w: 100, h: 100 }], 8); assert.equal(t.dy, -3); assert.equal(snapMove({ x: 300, y: 300, w: 10, h: 10 }, { w: 1080, h: 1080 }, [], 8).guides.length, 0); });
const kit: BrandKit = { id: "k", name: "K", primary: "#112233", secondary: "#aabbcc", accent: "#ffcc00", background: "#000000", text: "#ffffff", fontFamily: "Georgia, serif" };
test("brand kit recolours known roles only and is idempotent", () => {
  const p = blankProject(), a = applyBrandKit(p, kit), b = applyBrandKit(a, kit);
  const h = a.layers.find(l => l.name === "headline"), o = p.layers.find(l => l.name === "headline");
  assert.ok(h?.type === "text" && o?.type === "text" && h.color === "#ffffff" && h.text === o.text && h.x === o.x && h.fontFamily === "Georgia, serif");
  assert.equal(a.brandKitId, "k"); assert.deepEqual(a, b); });
test("contrast warnings", () => {
  assert.ok(contrast("#000000", "#ffffff") > 20); const p = blankProject(); p.canvas.background = { kind: "solid", color: "#ffffff" };
  assert.ok(brandWarnings(p).length >= 1); assert.deepEqual(brandWarnings(applyBrandKit(p, kit)), []); });
test("package round-trip, missing assets, bad input", () => {
  const p = blankProject(); p.assets.push({ id: "a1", kind: "image", mime: "image/png", name: "x" });
  const r = parsePackage(JSON.parse(JSON.stringify(toPackage(p, {})))); assert.ok(r.ok && r.warnings.length === 1);
  const r2 = parsePackage(JSON.parse(JSON.stringify(toPackage(p, { a1: "data:image/png;base64,AA" })))); assert.ok(r2.ok && r2.warnings.length === 0);
  assert.equal(parsePackage({ nope: 1 }).ok, false); assert.equal(parsePackage(null).ok, false); });

import { instantiate as inst, TEMPLATES as TPL } from "@adforge/template-library";
test("brand kit on a template design relays out with kit colours and font, keeping words", () => {
  const p = inst(TPL[2], { copy: { headline: "Keep Me" } }), a = applyBrandKit(p, kit), h = a.layers.find(l => l.name === "headline");
  assert.ok(h?.type === "text" && h.text === "Keep Me" && h.color === "#ffffff" && h.fontFamily === "Georgia, serif"); assert.equal(a.meta?.palette.primary, "#112233"); assert.equal(a.brandKitId, "k"); });
