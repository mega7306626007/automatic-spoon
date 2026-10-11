import { test } from "node:test"; import assert from "node:assert/strict";
import { deterministicProvider as d, onlineProvider, generateCopyWithFallback, validateCopy, parseModelOutput, type Brief } from "../src/index.ts";
const brief: Brief = { product: "Mama Pima Bakery", tone: "friendly", language: "en", audience: "families" };
const good = JSON.stringify({ headlines: ["Fresh bread daily"], supporting: ["Baked for families."], hooks: ["Hungry?"], ctas: ["Visit us"], captions: ["Come by!"], hashtags: ["#bakery"] });
const stub = (fn: () => Promise<Response>) => { let calls = 0; return { calls: () => calls, f: (async () => { calls++; return fn(); }) as unknown as typeof fetch }; };
test("offline fallback works with no network (fetch never touched)", async () => {
  const orig = globalThis.fetch; let hit = false; globalThis.fetch = (() => { hit = true; throw new Error("net"); }) as any;
  try { const r = await generateCopyWithFallback([d], brief); assert.equal(r.providerId, "deterministic"); assert.ok(r.copy.headlines.length); assert.equal(hit, false); } finally { globalThis.fetch = orig; } });
test("no consent => online provider never calls network, falls back", async () => {
  const s = stub(async () => new Response(good)); const r = await generateCopyWithFallback([onlineProvider({ endpoint: "https://x", consentGranted: () => false, fetchImpl: s.f })], brief);
  assert.equal(s.calls(), 0); assert.equal(r.providerId, "deterministic"); assert.ok(r.notes[0].includes("unavailable")); });
test("with consent, valid online output is used", async () => {
  const s = stub(async () => new Response(good)); const r = await generateCopyWithFallback([onlineProvider({ endpoint: "https://x", consentGranted: () => true, fetchImpl: s.f })], brief);
  assert.equal(s.calls(), 1); assert.equal(r.providerId, "online"); });
test("provider failure and HTTP error fall back", async () => {
  for (const fn of [async () => { throw new Error("offline"); }, async () => new Response("no", { status: 500 })]) {
    const r = await generateCopyWithFallback([onlineProvider({ endpoint: "https://x", consentGranted: () => true, fetchImpl: stub(fn as any).f })], brief); assert.equal(r.providerId, "deterministic"); } });
test("invalid model output rejected", async () => {
  assert.equal(parseModelOutput("not json"), null); assert.equal(parseModelOutput(JSON.stringify({ headlines: [1] })), null);
  const r = await generateCopyWithFallback([onlineProvider({ endpoint: "https://x", consentGranted: () => true, fetchImpl: stub(async () => new Response("garbage")).f })], brief); assert.equal(r.providerId, "deterministic"); });
test("invented prices, discounts and guarantees are rejected unless the user supplied them", () => {
  const bad = parseModelOutput(JSON.stringify({ headlines: ["50% off today"], supporting: ["Guaranteed best bread"], hooks: [], ctas: [], captions: [], hashtags: [] }))!;
  const issues = validateCopy(bad, brief); assert.ok(issues.some(i => i.includes("50")) && issues.some(i => /guarantee/i.test(i)));
  assert.deepEqual(validateCopy(bad, { ...brief, offer: "50% off today", constraints: "Guaranteed best" }), []); });
test("deterministic output invents no figures, and uses given ones", async () => {
  const c = await d.generateCopy(brief); assert.deepEqual(validateCopy(c, brief), []); assert.ok(![...c.headlines, ...c.supporting, ...c.captions].some(s => /\d/.test(s)));
  const b2 = { ...brief, price: "KES 500", offer: "Buy 2 get 1 at KES 500" }; const w = await d.generateCopy(b2); assert.ok(w.supporting.includes("KES 500")); assert.deepEqual(validateCopy(w, b2), []); });
test("Kiswahili supported; Sheng flagged as unevaluated; unsupported language noted", async () => {
  assert.ok((await d.generateCopy({ ...brief, language: "sw" })).headlines.join(" ").match(/Karibu|kwa|Jaribu|Gundua|imewasili|tayari|usikose/));
  assert.ok((await d.generateCopy({ ...brief, language: "sheng" })).notes[0].includes("not evaluated"));
  assert.ok((await d.generateCopy({ ...brief, language: "fr" })).notes[0].includes("not supported")); });
test("campaign, video script and layouts", async () => {
  const c = await d.generateCampaign(brief); assert.deepEqual(c.assets.map(a => a.kind), ["poster", "square", "story", "banner", "video"]);
  assert.equal((await d.generateVideoScript(brief)).length, 3); assert.ok((await d.suggestLayouts({ ...brief, platform: "TikTok" })).includes("retail-weekend")); });
