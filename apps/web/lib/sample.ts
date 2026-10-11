import type { Project } from "@adforge/creative-schema";
export const uid = () => crypto.randomUUID();
export function sampleProject(): Project {
  const now = new Date().toISOString(), t = (o: object) => ({ rotation: 0, opacity: 1, ...o });
  return { schemaVersion: 2, id: uid(), type: "image", name: "Untitled ad", createdAt: now, updatedAt: now, assets: [],
    canvas: { width: 1080, height: 1080, background: { kind: "solid", color: "#0B1026" } },
    layers: [
      t({ id: uid(), name: "Accent", type: "shape", shape: "ellipse", x: 620, y: 560, w: 560, h: 560, fill: { kind: "solid", color: "#7C3AED" }, opacity: 0.9 }),
      t({ id: uid(), name: "Headline", type: "text", text: "Your Offer Here", x: 80, y: 120, w: 920, h: 220, fontFamily: "Inter, Arial, sans-serif", fontSize: 110, color: "#FFFFFF", align: "left", lineHeight: 1.1, letterSpacing: 0 }),
      t({ id: uid(), name: "Subtitle", type: "text", text: "Describe it. Design it. Export it.", x: 80, y: 380, w: 760, h: 100, fontFamily: "Inter, Arial, sans-serif", fontSize: 44, color: "#22D3EE", align: "left", lineHeight: 1.2, letterSpacing: 0 }),
    ] as Project["layers"] };
}
