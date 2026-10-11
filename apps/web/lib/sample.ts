import type { Project } from "@adforge/creative-schema";
export const uid = (): string => (globalThis.crypto?.randomUUID?.() ?? `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
const t = (o: object) => ({ rotation: 0, opacity: 1, ...o });
export function blankProject(w = 1080, h = 1080, name = "Untitled ad"): Project {
  const now = new Date().toISOString();
  return { schemaVersion: 2, id: uid(), type: "image", name, createdAt: now, updatedAt: now, assets: [], canvas: { width: w, height: h, background: { kind: "gradient", angle: 160, stops: [{ offset: 0, color: "#0B1026" }, { offset: 1, color: "#1E1B4B" }] } },
    layers: [
      t({ id: "accent", name: "accent", type: "shape", shape: "ellipse", x: w * 0.55, y: h * 0.55, w: w * 0.5, h: w * 0.5, fill: { kind: "solid", color: "#7C3AED" }, opacity: 0.9 }),
      t({ id: "headline", name: "headline", type: "text", text: "Your Offer Here", x: w * 0.08, y: h * 0.1, w: w * 0.84, h: h * 0.24, fontFamily: "Inter, Arial, sans-serif", fontSize: w * 0.095, color: "#FFFFFF", align: "left", lineHeight: 1.1, letterSpacing: 0 }),
      t({ id: "subtitle", name: "subtitle", type: "text", text: "Describe it. Design it. Export it.", x: w * 0.08, y: h * 0.38, w: w * 0.7, h: h * 0.12, fontFamily: "Inter, Arial, sans-serif", fontSize: w * 0.04, color: "#22D3EE", align: "left", lineHeight: 1.2, letterSpacing: 0 }),
    ] as Project["layers"] };
}
export const sampleProject = () => blankProject();
