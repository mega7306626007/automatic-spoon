import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Project } from "@adforge/creative-schema";
import { Scene } from "../components/Scene";
import type { Assets } from "./store";
/** Render a project to an image Blob without touching the on-screen editor. */
export async function renderProjectToBlob(p: Project, assets: Assets, fmt: "png" | "jpeg", scale = 1): Promise<Blob> {
  const W = Math.round(p.canvas.width * scale), H = Math.round(p.canvas.height * scale); if (W * H > 64e6) throw new Error("Image is too large to export; use standard quality");
  await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
  const svg = renderToStaticMarkup(createElement(Scene, { project: p, assets })).replace("<svg ", `<svg width="${p.canvas.width}" height="${p.canvas.height}" `);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try { const img = new Image(); await new Promise<void>((ok, no) => { img.onload = () => ok(); img.onerror = () => no(new Error("The design could not be rendered")); img.src = url; });
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d"); if (!g) throw new Error("Canvas is not available");
    if (fmt === "jpeg") { g.fillStyle = "#fff"; g.fillRect(0, 0, W, H); } g.drawImage(img, 0, 0, W, H);
    const blob = await new Promise<Blob | null>(r => c.toBlob(r, `image/${fmt}`, 0.95)); if (!blob) throw new Error("Encoding failed (image may be too large)"); return blob;
  } finally { URL.revokeObjectURL(url); }
}
