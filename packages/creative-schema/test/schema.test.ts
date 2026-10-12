import { test } from "node:test"; import assert from "node:assert/strict";
import { alignTo, validateProject, findMissingAssets, migrate, boundingBox, reorder, resizeLayers, estimateTextOverflow, Project } from "../src/index.ts";
const base = (): Project => ({ schemaVersion: 2, id: "p1", type: "image", name: "T",
  canvas: { width: 1080, height: 1080, background: { kind: "solid", color: "#0B1026" } },
  layers: [{ id: "t1", name: "Headline", type: "text", x: 80, y: 80, w: 900, h: 200, rotation: 0, opacity: 1, text: "Big Sale", fontFamily: "Inter", fontSize: 96, color: "#FFFFFF", align: "left", lineHeight: 1.1, letterSpacing: 0 }],
  assets: [], createdAt: "2026-10-11T00:00:00Z", updatedAt: "2026-10-11T00:00:00Z" });
test("valid project passes and round-trips JSON", () => { assert.equal(validateProject(JSON.parse(JSON.stringify(base()))).ok, true); });
test("invalid fields reported with paths", () => {
  const p: any = base(); p.layers[0].opacity = 2; p.layers[0].color = "red"; p.canvas.width = 0;
  const r = validateProject(p); assert.ok(!r.ok); const paths = r.issues.map(i => i.path);
  assert.ok(paths.includes("layers[0].opacity") && paths.includes("layers[0].color") && paths.includes("canvas")); });
test("duplicate IDs and unknown layer types rejected", () => {
  const p: any = base(); p.layers.push({ ...p.layers[0] }, { id: "z", type: "script", x:0,y:0,w:1,h:1,rotation:0,opacity:1 });
  const r = validateProject(p); assert.ok(!r.ok);
  assert.ok(r.issues.some(i => /duplicate/.test(i.message)) && r.issues.some(i => /unknown layer/.test(i.message))); });
test("missing assets detected", () => {
  const p: any = base(); p.layers.push({ id: "i1", name: "Pic", type: "image", assetId: "nope", fit: "cover", x:0,y:0,w:10,h:10,rotation:0,opacity:1 });
  assert.ok(!validateProject(p).ok); assert.deepEqual(findMissingAssets(p), ["nope"]); });
test("v1 migrates to v2", () => {
  const l: any = { ...base().layers[0], width: 900, height: 200, rotation: Math.PI / 2 }; delete l.w; delete l.h;
  const m = migrate({ ...base(), schemaVersion: 1, layers: [l] });
  assert.equal(m.schemaVersion, 2); assert.equal(m.layers[0].w, 900); assert.ok(Math.abs(m.layers[0].rotation - 90) < 1e-9); assert.ok(validateProject(m).ok); });
test("newer schema refused", () => assert.throws(() => migrate({ schemaVersion: 99 })));
test("rotated bounding box", () => {
  const b = boundingBox({ x: 100, y: 100, w: 200, h: 100, rotation: 90 });
  assert.ok(Math.abs(b.w - 100) < 1e-9 && Math.abs(b.h - 200) < 1e-9 && Math.abs(b.x - 150) < 1e-9); });
test("reorder", () => assert.deepEqual(reorder([{id:"a"},{id:"b"},{id:"c"}], "a", 2).map(l => l.id), ["b","c","a"]));
test("resize 1080² -> 1080x1920", () => {
  const [l] = resizeLayers(base().layers, { width: 1080, height: 1080 }, { width: 1080, height: 1920 });
  assert.equal(l.w, 900); assert.equal(l.y, 80 + 420); });
test("text overflow warning", () => {
  assert.equal(estimateTextOverflow({ text: "x".repeat(500), fontSize: 40, w: 300, h: 100, lineHeight: 1.2 }), true);
  assert.equal(estimateTextOverflow({ text: "Sale", fontSize: 40, w: 300, h: 100, lineHeight: 1.2 }), false); });

test("alignTo centres and edges using the rotated bounding box", () => {
  const l = base().layers[0]; assert.equal(alignTo(l, { width: 1080, height: 1080 }, "center").x, (1080 - 900) / 2);
  assert.equal(alignTo(l, { width: 1080, height: 1080 }, "right").x, 180); assert.equal(alignTo(l, { width: 1080, height: 1080 }, "left").x, 0);
  assert.equal(alignTo(l, { width: 1080, height: 1080 }, "middle").y, 440); const r = { ...l, rotation: 90 }; const a = alignTo(r, { width: 1000, height: 1000 }, "left"); assert.equal(a.x + (900 - 200) / 2, 0 + 0 + (900 - 200) / 2 + a.x - a.x + 0 * 1 + (a.x - a.x)); assert.ok(Math.abs(boundingBox({ ...r, ...a }).x) < 1e-9); });
