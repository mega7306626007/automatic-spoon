import { Project, Layer, SCHEMA_VERSION, ART_KINDS } from "./types.ts";
import { ILLUSTRATIONS } from "./illustrations.ts";
export interface Issue { path: string; message: string }
const HEX = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const num = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const str = (v: unknown): v is string => typeof v === "string";

export function validateProject(input: unknown): { ok: true; project: Project } | { ok: false; issues: Issue[] } {
  const issues: Issue[] = [];
  const bad = (path: string, message: string) => { issues.push({ path, message }); };
  const p = input as any;
  if (!p || typeof p !== "object") return { ok: false, issues: [{ path: "", message: "not an object" }] };
  if (p.schemaVersion !== SCHEMA_VERSION) bad("schemaVersion", `expected ${SCHEMA_VERSION}, got ${p.schemaVersion}`);
  if (!str(p.id) || !p.id) bad("id", "required string");
  if (p.type !== "image" && p.type !== "video") bad("type", "must be image|video");
  if (!str(p.name)) bad("name", "required string");
  const c = p.canvas;
  if (!c || !num(c.width) || !num(c.height) || c.width < 1 || c.height < 1 || c.width > 8192 || c.height > 8192) bad("canvas", "width/height must be 1..8192");
  if (!Array.isArray(p.layers)) bad("layers", "must be array");
  if (!Array.isArray(p.assets)) bad("assets", "must be array");
  if (!str(p.createdAt) || isNaN(Date.parse(p.createdAt))) bad("createdAt", "invalid ISO date");
  if (!str(p.updatedAt) || isNaN(Date.parse(p.updatedAt))) bad("updatedAt", "invalid ISO date");
  if (Array.isArray(p.layers)) {
    const ids = new Set<string>(); const assetIds = new Set<string>((p.assets ?? []).map((a: any) => a?.id));
    p.layers.forEach((l: any, i: number) => {
      const at = `layers[${i}]`;
      if (!l || typeof l !== "object") return bad(at, "not an object");
      if (!str(l.id) || !l.id) bad(`${at}.id`, "required");
      else if (ids.has(l.id)) bad(`${at}.id`, `duplicate id ${l.id}`); else ids.add(l.id);
      for (const k of ["x","y","w","h","rotation"]) if (!num(l[k])) bad(`${at}.${k}`, "must be finite number");
      if (num(l.w) && l.w < 0) bad(`${at}.w`, "negative");
      if (num(l.h) && l.h < 0) bad(`${at}.h`, "negative");
      if (!num(l.opacity) || l.opacity < 0 || l.opacity > 1) bad(`${at}.opacity`, "must be 0..1");
      if (l.type === "text") {
        if (!str(l.text)) bad(`${at}.text`, "required");
        if (!num(l.fontSize) || l.fontSize <= 0) bad(`${at}.fontSize`, "must be >0");
        if (!str(l.color) || !HEX.test(l.color)) bad(`${at}.color`, "invalid hex");
      } else if (l.type === "image") {
        if (!str(l.assetId)) bad(`${at}.assetId`, "required");
        else if (!assetIds.has(l.assetId)) bad(`${at}.assetId`, `missing asset ${l.assetId}`);
      } else if (l.type === "shape") {
        if (l.shape !== "rect" && l.shape !== "ellipse" && l.shape !== "burst") bad(`${at}.shape`, "must be rect|ellipse|burst");
      } else if (l.type === "illo") {
        if (!str(l.kind) || !ILLUSTRATIONS[l.kind]) bad(`${at}.kind`, "unknown illustration");
      } else if (l.type === "art") {
        if (!ART_KINDS.includes(l.kind)) bad(`${at}.kind`, "unknown art kind"); if (!str(l.color) || !HEX.test(l.color)) bad(`${at}.color`, "invalid hex"); if (!num(l.seed)) bad(`${at}.seed`, "must be number");
      } else bad(`${at}.type`, `unknown layer type ${String(l.type)}`);
    });
  }
  return issues.length ? { ok: false, issues } : { ok: true, project: p as Project };
}

/** Image layers whose asset IDs are absent from the project's asset list. */
export function findMissingAssets(p: Project): string[] {
  const have = new Set(p.assets.map(a => a.id));
  return p.layers.flatMap((l: Layer) => (l.type === "image" && !have.has(l.assetId) ? [l.assetId] : []));
}
