import { SCHEMA_VERSION } from "./types.ts";
// v1 -> v2: layers used {width,height} and rotation in radians; v2 uses w/h and degrees.
const steps: Record<number, (p: any) => any> = {
  1: (p) => ({ ...p, schemaVersion: 2,
    layers: (p.layers ?? []).map((l: any) => { const { width, height, ...rest } = l;
      return { ...rest, w: width ?? l.w, h: height ?? l.h, rotation: ((l.rotation ?? 0) * 180) / Math.PI }; }) }),
};
export function migrate(input: any): any {
  if (!input || typeof input.schemaVersion !== "number") throw new Error("missing schemaVersion");
  if (input.schemaVersion > SCHEMA_VERSION) throw new Error(`project is newer (v${input.schemaVersion}) than this app (v${SCHEMA_VERSION})`);
  let p = input;
  while (p.schemaVersion < SCHEMA_VERSION) { const s = steps[p.schemaVersion]; if (!s) throw new Error(`no migration from v${p.schemaVersion}`); p = s(p); }
  return p;
}
