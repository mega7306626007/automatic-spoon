"use client";
import { useCallback, useEffect, useState } from "react";
import type { Layer, Project } from "@adforge/creative-schema";
import { init, commit, replace, checkpoint, undo, redo, type History } from "./history";
import { saveProject, loadProject, getLastId, setLastId, type Assets } from "./store";
import { blankProject, uid } from "./sample";

export function downscale(file: File, max = 2048): Promise<{ dataUrl: string; w: number; h: number }> {
  return new Promise((res, rej) => { const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)), w = Math.round(img.width * k), h = Math.round(img.height * k), c = document.createElement("canvas"); c.width = w; c.height = h;
      c.getContext("2d")!.drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url); res({ dataUrl: c.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.9), w, h }); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("Could not read that image")); }; img.src = url; });
}
export function useStudio() {
  const [h, setH] = useState<History<Project>>(() => init(blankProject()));
  const [assets, setAssets] = useState<Assets>({});
  const [sel, setSel] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [ready, setReady] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const p = h.present;
  useEffect(() => { (async () => { try { const id = await getLastId(); if (id) { const r = await loadProject(id); if (r) { setH(init(r.project)); setAssets(r.assets); setRecovered(true); } } } catch { setStatus("Could not read saved drafts"); } setReady(true); })(); }, []);
  useEffect(() => { if (!ready) return; const t = setTimeout(() => { saveProject(p, assets).then(() => setLastId(p.id)).catch(() => setStatus("Autosave failed (storage full or blocked)")); }, 500); return () => clearTimeout(t); }, [p, assets, ready]);
  const mutate = useCallback((fn: (p: Project) => Project) => setH(x => commit(x, { ...fn(x.present), updatedAt: new Date().toISOString() })), []);
  const live = useCallback((fn: (p: Project) => Project) => setH(x => replace(x, fn(x.present))), []);
  const upd = useCallback((id: string, patch: Partial<Layer>) => mutate(q => ({ ...q, layers: q.layers.map(l => l.id === id ? ({ ...l, ...patch } as Layer) : l) })), [mutate]);
  const liveLayer = useCallback((id: string, patch: Partial<Layer>) => live(q => ({ ...q, layers: q.layers.map(l => l.id === id ? ({ ...l, ...patch } as Layer) : l) })), [live]);
  const add = useCallback((l: Layer) => { mutate(q => ({ ...q, layers: [...q.layers, l] })); setSel(l.id); }, [mutate]);
  const del = useCallback(() => { if (sel) { mutate(q => ({ ...q, layers: q.layers.filter(l => l.id !== sel) })); setSel(null); } }, [mutate, sel]);
  const openProject = useCallback((pr: Project, a: Assets = {}) => { setH(init(pr)); setAssets(a); setSel(null); setRecovered(false); }, []);
  const registerAsset = useCallback((dataUrl: string, name: string) => { const id = uid(); setAssets(a => ({ ...a, [id]: dataUrl }));
    mutate(q => ({ ...q, assets: [...q.assets, { id, kind: "image", mime: dataUrl.slice(5, dataUrl.indexOf(";")), name }] })); return id; }, [mutate]);
  const addImageLayer = useCallback((assetId: string, w: number, h2: number, name: string) => { const cw = p.canvas.width, k = Math.min(cw * 0.5 / w, p.canvas.height * 0.5 / h2);
    add({ id: uid(), name, type: "image", assetId, fit: "cover", x: (cw - w * k) / 2, y: (p.canvas.height - h2 * k) / 2, w: w * k, h: h2 * k, rotation: 0, opacity: 1 }); }, [add, p.canvas.width, p.canvas.height]);
  return { h, p, assets, sel, setSel, status, setStatus, recovered, ready, mutate, live, upd, liveLayer, add, del, openProject, registerAsset, addImageLayer,
    undo: () => setH(undo), redo: () => setH(redo), beginDrag: () => setH(checkpoint), canUndo: h.past.length > 0, canRedo: h.future.length > 0 };
}
export type Studio = ReturnType<typeof useStudio>;
