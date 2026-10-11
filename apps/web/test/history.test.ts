import { test } from "node:test"; import assert from "node:assert/strict";
import { init, commit, replace, checkpoint, undo, redo } from "../lib/history.ts";
test("commit/undo/redo", () => {
  let h = init(1); h = commit(h, 2); h = commit(h, 3);
  assert.equal(undo(h).present, 2); assert.equal(undo(undo(h)).present, 1); assert.equal(undo(undo(undo(h))).present, 1);
  assert.equal(redo(undo(h)).present, 3); });
test("new commit clears redo", () => { let h = commit(init(1), 2); h = undo(h); h = commit(h, 9); assert.equal(h.future.length, 0); });
test("drag = one checkpoint + many replaces => single undo step", () => {
  let h = init(0); h = checkpoint(h); for (const v of [1,2,3,4]) h = replace(h, v);
  assert.equal(h.present, 4); assert.equal(undo(h).present, 0); });
