import { test } from "node:test"; import assert from "node:assert/strict";
import { validateProject, estimateTextOverflow } from "@adforge/creative-schema";
import { TEMPLATES, instantiate, searchTemplates, recommendTemplate } from "../src/index.ts";
test("at least 10 templates, unique ids, all required categories covered", () => {
  assert.ok(TEMPLATES.length >= 10); assert.equal(new Set(TEMPLATES.map(t => t.id)).size, TEMPLATES.length);
  for (const c of ["product-launch","retail","food","fashion","events","education","technology","real-estate","services","offers"]) assert.ok(TEMPLATES.some(t => t.category === c), c); });
test("every template instantiates to a valid project with no default text overflow", () => {
  for (const t of TEMPLATES) { const p = instantiate(t), r = validateProject(p); assert.ok(r.ok, t.id + JSON.stringify(!r.ok && r.issues));
    for (const l of p.layers) if (l.type === "text") assert.equal(estimateTextOverflow(l), false, `${t.id}/${l.name}`); } });
test("elements stay inside canvas", () => {
  for (const t of TEMPLATES) for (const l of instantiate(t).layers) { if (l.name === "accent") continue;
    assert.ok(l.x >= 0 && l.y >= 0 && l.x + l.w <= t.width + 1 && l.y + l.h <= t.height + 1, `${t.id}/${l.name}`); } });
test("copy override and search", () => {
  const head = instantiate(TEMPLATES[0], { copy: { headline: "Hi" } }).layers.find(l => l.name === "headline");
  assert.equal(head?.type === "text" ? head.text : null, "Hi");
  assert.ok(searchTemplates("restaurant").some(t => t.id === "food-fresh")); assert.equal(searchTemplates("", "events").length, 1); assert.equal(searchTemplates("zzz").length, 0); });

test("recommendTemplate maps keywords to categories with a safe default", () => {
  assert.equal(recommendTemplate("Mama Pima bakery fresh bread").category, "food"); assert.equal(recommendTemplate("3 bedroom house to rent").category, "real-estate");
  assert.equal(recommendTemplate("Python classes for students").category, "education"); assert.equal(recommendTemplate("Big sale 30% off").category, "offers"); assert.equal(recommendTemplate("xyz").category, "product-launch"); });
test("headline and subtitle opt in to auto-fit", () => {
  const p = instantiate(TEMPLATES[0]); for (const n of ["headline", "subtitle"]) { const l = p.layers.find(x => x.name === n); assert.ok(l?.type === "text" && l.autoFit === true && (l.fitMax ?? 0) > 0); } });
