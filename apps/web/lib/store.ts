import { migrate, validateProject, type Project } from "@adforge/creative-schema";
import { idbClear, idbDel, idbGet, idbPut } from "./idb";
import type { BrandKit } from "./brand";
export interface ProjectMeta { id: string; name: string; updatedAt: string; width: number; height: number }
export type Assets = Record<string, string>;
export interface Settings { onlineEnabled: boolean; endpoint: string; apiKey: string }
export const defaultSettings: Settings = { onlineEnabled: false, endpoint: "", apiKey: "" };
export const listProjects = async (): Promise<ProjectMeta[]> => (await idbGet<ProjectMeta[]>("index")) ?? [];
export async function saveProject(p: Project, assets: Assets): Promise<void> {
  await idbPut("project:" + p.id, { project: p, assets });
  const idx = (await listProjects()).filter(m => m.id !== p.id); idx.push({ id: p.id, name: p.name, updatedAt: p.updatedAt, width: p.canvas.width, height: p.canvas.height });
  await idbPut("index", idx.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
}
export async function loadProject(id: string): Promise<{ project: Project; assets: Assets } | null> {
  const d = await idbGet<{ project: unknown; assets?: Assets }>("project:" + id); if (!d) return null;
  try { const r = validateProject(migrate(d.project)); return r.ok ? { project: r.project, assets: d.assets ?? {} } : null; } catch { return null; }
}
export async function deleteProject(id: string): Promise<void> {
  await idbDel("project:" + id); await idbPut("index", (await listProjects()).filter(m => m.id !== id)); if ((await getLastId()) === id) await idbDel("lastId");
}
export const getLastId = () => idbGet<string>("lastId"); export const setLastId = (id: string) => idbPut("lastId", id);
export const loadKits = async (): Promise<BrandKit[]> => (await idbGet<BrandKit[]>("brandkits")) ?? [];
export const saveKits = (k: BrandKit[]) => idbPut("brandkits", k);
export const loadSettings = async (): Promise<Settings> => ({ ...defaultSettings, ...(await idbGet<Partial<Settings>>("settings")) });
export const saveSettings = (s: Settings) => idbPut("settings", s);
export const clearAll = () => idbClear();

export interface Pkg { format: "adforge-package"; version: 1; project: Project; assets: Assets }
export const toPackage = (project: Project, assets: Assets): Pkg => ({ format: "adforge-package", version: 1, project, assets });
export function parsePackage(json: unknown): { ok: true; project: Project; assets: Assets; warnings: string[] } | { ok: false; error: string } {
  try { const j = json as any, raw = j?.format === "adforge-package" ? j.project : j, assets: Assets = j?.format === "adforge-package" && j.assets && typeof j.assets === "object" ? j.assets : {};
    const r = validateProject(migrate(raw)); if (!r.ok) return { ok: false, error: `${r.issues[0].path}: ${r.issues[0].message}` };
    const missing = r.project.assets.filter(a => a.kind === "image" && a.id !== "placeholder" && !assets[a.id]).length;
    return { ok: true, project: r.project, assets, warnings: missing ? [`${missing} image(s) missing from the file; placeholders shown`] : [] };
  } catch (e) { return { ok: false, error: (e as Error).message }; }
}
export const saveCaptions = (id: string, text: string) => idbPut("captions:" + id, text);
export const loadCaptions = (id: string) => idbGet<string>("captions:" + id);
