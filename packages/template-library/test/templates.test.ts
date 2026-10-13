import { test } from "node:test"; import assert from "node:assert/strict";
import { validateProject, estimateTextOverflow, boundingBox, type Layer } from "@adforge/creative-schema";
import { TEMPLATES, EMOTION_LIST, instantiate, layoutFor, searchTemplates, recommendTemplate, emotionFor, hooksFor, illoFor, ILLOS_BY_CAT } from "../src/index.ts";
import { ILLUSTRATIONS } from "@adforge/creative-schema";
const SIZES: [number, number][] = [[1080, 1080], [1080, 1350], [1080, 1920], [1920, 1080], [1500, 500]];
test("70 templates (7 per category), unique ids, every required category covered", () => {
  assert.equal(TEMPLATES.length, 70); assert.equal(new Set(TEMPLATES.map(t => t.id)).size, 70);
  for (const c of ["product-launch", "retail", "food", "fashion", "events", "education", "technology", "real-estate", "services", "offers"]) assert.equal(TEMPLATES.filter(t => t.category === c).length, 7, c);
  assert.ok(TEMPLATES.some(t => t.needsPhoto) && TEMPLATES.some(t => !t.needsPhoto)); });
test("every template validates, has an emotional hook, and text fits", () => {
  for (const t of TEMPLATES) { const p = instantiate(t, { copy: { badge: "20% off" } }), r = validateProject(p); assert.ok(r.ok, t.id + JSON.stringify(!r.ok && r.issues));
    for (const n of ["hook", "headline", "subtitle", "cta", "emoji"]) assert.ok(p.layers.some(l => l.name === n), `${t.id} missing ${n}`);
    if (["showcase", "studio", "clean"].includes(t.style)) assert.ok(p.layers.some(l => l.name === "illo" && l.type === "illo" && ILLUSTRATIONS[l.kind]), `${t.id} needs a real illustration`);
    for (const l of p.layers) if (l.type === "text") assert.equal(estimateTextOverflow(l), false, `${t.id}/${l.name}`); } });
test("all four styles keep every element on canvas in every canvas shape (rotation included)", () => {
  for (const style of ["hero", "split", "magazine", "circle", "showcase", "studio", "clean", "burst", "poster"] as const) for (const [W, H] of SIZES) { const { layers } = layoutFor({ illo: "bread", style, palette: EMOTION_LIST[0].palette, emojis: ["😍", "🎉", "✨"], W, H, art: "confetti", copy: { headline: "Fresh Bread", subtitle: "Baked this morning.", cta: "Order now", hook: "Taste the moment.", badge: "20% off" } });
    for (const l of layers as Layer[]) { if (["art", "art2", "accent", "ring", "scrim", "image", "hero-circle"].includes(l.name)) continue; const b = boundingBox(l); const tol = Math.min(W, H) * 0.03;
      assert.ok(b.x >= -tol && b.y >= -tol && b.x + b.w <= W + tol && b.y + b.h <= H + tol, `${style} ${W}x${H} ${l.name} ${JSON.stringify(b)}`); } } });
test("badge appears only when an offer is supplied", () => {
  assert.ok(!instantiate(TEMPLATES[0]).layers.some(l => l.name === "badge")); assert.ok(instantiate(TEMPLATES[0], { copy: { badge: "2 for 1" } }).layers.some(l => l.name === "badge")); });
test("mood switch changes palette and stickers; meta kept for relayout", () => {
  const a = instantiate(TEMPLATES[0], { emotion: "love" }), b = instantiate(TEMPLATES[0], { emotion: "urgency" });
  assert.notEqual(a.meta?.palette.primary, b.meta?.palette.primary); assert.notDeepEqual(a.meta?.emojis, b.meta?.emojis); assert.equal(a.meta?.style, TEMPLATES[0].style); });
test("recommend, emotion and hooks", () => {
  assert.equal(recommendTemplate("Mama Pima bakery fresh bread").category, "food"); assert.equal(recommendTemplate("3 bedroom house to rent").category, "real-estate");
  assert.equal(recommendTemplate("Python classes", { photo: true }).needsPhoto, true); assert.equal(recommendTemplate("Python classes").needsPhoto, false); assert.equal(recommendTemplate("xyz").category, "product-launch");
  assert.equal(emotionFor("big sale 30% off", "joy"), "urgency"); assert.equal(emotionFor("wedding cakes", "craving"), "love"); assert.equal(emotionFor("plain text", "trust"), "trust");
  assert.ok(hooksFor("food", "craving").length >= 3); });
test("search and categories", () => { assert.ok(searchTemplates("restaurant").some(t => t.category === "food")); assert.equal(searchTemplates("", "events").length, 7); assert.equal(searchTemplates("zzz").length, 0); });

test("text block never overlaps the photo card or hero circle (square, tall, wide)", () => {
  for (const style of ["split", "burst", "circle", "magazine", "showcase", "studio", "clean"] as const) for (const [W, H] of [[1080, 1080], [1080, 1350], [1080, 1920]] as const) {
    const { layers } = layoutFor({ illo: "bread", style, palette: EMOTION_LIST[0].palette, emojis: ["😍", "🎉", "✨"], W, H, art: "confetti", copy: { headline: "Fresh Bread", subtitle: "Baked this morning.", cta: "Order now", hook: "Taste the moment." } });
    const chip = layers.find(l => l.name === "hook-bg")!; if (style === "magazine") { const card = layers.find(l => l.name === "accent")!; assert.ok(chip.y >= card.y && chip.y + chip.h <= card.y + card.h, `magazine ${W}x${H} chip outside card`); continue; }
    const above = layers.find(l => l.name === (style === "split" ? "image" : ["showcase", "studio", "clean"].includes(style) ? "illo" : "ring"))!; const ab = boundingBox(above); assert.ok(ab.y + ab.h <= chip.y + 1, `${style} ${W}x${H}: ${ab.y + ab.h} > ${chip.y}`); } });

test("illoFor: keywords, category fallback, every mapped illustration exists", () => {
  assert.equal(illoFor("fresh bread", "food"), "bread"); assert.equal(illoFor("braids hair salon", "services"), "scissors"); assert.equal(illoFor("plumbing repair", "services"), "toolbox"); assert.equal(illoFor("xyz", "real-estate", 1), "key");
  for (const list of Object.values(ILLOS_BY_CAT)) for (const k of list) assert.ok(ILLUSTRATIONS[k], k); });
test("recommendTemplate can vary graphic layouts with pick", () => { const a = new Set([0, 1, 2, 3, 4].map(n => recommendTemplate("bakery bread", { pick: n }).style)); assert.equal(a.size, 5); assert.ok([...a].every(s => !["hero", "split", "magazine", "circle"].includes(s))); });
