"use client";
import { useEffect, useRef, useState } from "react";
import { TEMPLATES, instantiate, searchTemplates, type Category, type Template } from "@adforge/template-library";
import type { Project } from "@adforge/creative-schema";
import { Scene } from "./Scene";
import { saveBlob } from "./Editor";
import { deleteProject, listProjects, loadProject, parsePackage, toPackage, type Assets, type ProjectMeta } from "../lib/store";
import { applyBrandKit, type BrandKit } from "../lib/brand";
import { blankProject, uid } from "../lib/sample";
import type { Studio } from "../lib/useStudio";

export const CATEGORIES: Category[] = ["product-launch", "retail", "food", "fashion", "events", "education", "technology", "real-estate", "services", "offers"];
const label = (c: string) => c.replace("-", " ");
export const Thumb = ({ p, assets = {} }: { p: Project; assets?: Assets }) => <div className="thumb"><Scene project={p} assets={assets} style={{ maxHeight: 170, maxWidth: "100%" }} /></div>;

export function Home({ s, go, kits, online }: { s: Studio; go: (v: string, cat?: Category) => void; kits: BrandKit[]; online: boolean }) {
  const [recent, setRecent] = useState<{ p: Project; a: Assets }[]>([]);
  useEffect(() => { (async () => { const out: { p: Project; a: Assets }[] = []; for (const m of (await listProjects()).slice(0, 4)) { const r = await loadProject(m.id); if (r) out.push({ p: r.project, a: r.assets }); } setRecent(out); })().catch(() => {}); }, []);
  const create = (w: number, h: number) => { s.openProject(blankProject(w, h)); go("create"); };
  return <div className="page"><h1>AdForge</h1><p className="sub">Design advertisements in your browser. Everything is saved on this device.</p>
    <div className="row"><button className="btn primary" onClick={() => create(1080, 1080)}>Create image ad</button><button className="btn" onClick={() => create(1080, 1920)}>Story / status ad</button><button className="btn" onClick={() => go("ai")}>Create campaign</button><button className="btn" onClick={() => go("templates")}>Browse templates</button></div>
    {s.recovered && <div className="card" style={{ marginTop: 16 }}><b>Draft recovered</b><p className="muted" style={{ margin: "4px 0 10px" }}>“{s.p.name}” was restored from your last session.</p><button className="btn" onClick={() => go("create")}>Continue editing</button></div>}
    <h2>Recent projects</h2>{recent.length ? <div className="grid">{recent.map(({ p, a }) => <div key={p.id} className="card"><Thumb p={p} assets={a} /><b>{p.name}</b><div className="muted">{p.canvas.width}×{p.canvas.height}</div>
      <button className="btn" style={{ marginTop: 8 }} onClick={() => { s.openProject(p, a); go("create"); }}>Open</button></div>)}</div> : <p className="muted">Nothing yet. Start from a template or a blank design.</p>}
    <h2>Template categories</h2><div className="row">{CATEGORIES.map(c => <button key={c} className="chip" onClick={() => go("templates", c)}>{label(c)}</button>)}</div>
    <h2>Status</h2><div className="card"><div className="ok">● Offline editor ready (works without internet)</div><div className="muted" style={{ marginTop: 4 }}>{online ? "Online AI is enabled. You are asked before any text is sent." : "Online AI is off. The built-in offline copy engine is used."} · {kits.length} brand kit{kits.length === 1 ? "" : "s"}</div>
      <div className="muted" style={{ marginTop: 4 }}>Not available yet: video ads, Android app.</div></div></div>;
}

export function Templates({ s, go, kits, initialCat }: { s: Studio; go: (v: string) => void; kits: BrandKit[]; initialCat?: Category }) {
  const [q, setQ] = useState(""), [cat, setCat] = useState<Category | undefined>(initialCat), [kit, setKit] = useState("");
  useEffect(() => setCat(initialCat), [initialCat]);
  const use = (t: Template) => { let p = instantiate(t, { id: uid() }); const k = kits.find(x => x.id === kit); if (k) p = applyBrandKit(p, k); s.openProject(p, {}); go("create"); };
  const list = searchTemplates(q, cat);
  return <div className="page"><h1>Templates</h1><p className="sub">Every element is an editable layer.</p>
    <div className="row"><input className="input" style={{ maxWidth: 260 }} placeholder="Search templates" value={q} onChange={e => setQ(e.target.value)} />
      <select className="input" style={{ maxWidth: 200 }} value={kit} onChange={e => setKit(e.target.value)}><option value="">No brand kit</option>{kits.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}</select></div>
    <div className="row" style={{ margin: "12px 0" }}><button className={"chip" + (!cat ? " on" : "")} onClick={() => setCat(undefined)}>all</button>{CATEGORIES.map(c => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{label(c)}</button>)}</div>
    {list.length ? <div className="grid">{list.map(t => <div key={t.id} className="card"><Thumb p={instantiate(t, { id: t.id })} /><b>{t.name}</b><div className="muted">{label(t.category)} · {t.width}×{t.height}</div><button className="btn primary" style={{ marginTop: 8 }} onClick={() => use(t)}>Use template</button></div>)}</div> : <p className="muted">No templates match “{q}”.</p>}
    <p className="muted" style={{ marginTop: 16 }}>{TEMPLATES.length} templates available.</p></div>;
}

export function Projects({ s, go }: { s: Studio; go: (v: string) => void }) {
  const [items, setItems] = useState<{ m: ProjectMeta; p: Project; a: Assets }[]>([]), [msg, setMsg] = useState(""), file = useRef<HTMLInputElement>(null), [tick, setTick] = useState(0);
  useEffect(() => { (async () => { const out: typeof items = []; for (const m of (await listProjects()).slice(0, 60)) { const r = await loadProject(m.id); if (r) out.push({ m, p: r.project, a: r.assets }); } setItems(out); })().catch(() => setMsg("Could not read projects")); }, [tick]);
  const open = (p: Project, a: Assets) => { s.openProject(p, a); go("create"); };
  const dup = (p: Project, a: Assets) => { const c = { ...p, id: uid(), name: p.name + " copy", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; s.openProject(c, a); go("create"); };
  const remove = async (id: string, name: string) => { if (!confirm(`Delete “${name}” and its images from this device? This cannot be undone.`)) return; await deleteProject(id); if (s.p.id === id) s.openProject(blankProject()); setTick(t => t + 1); };
  const imp = async (f?: File) => { if (!f) return; try { const r = parsePackage(JSON.parse(await f.text())); if (!r.ok) { setMsg("Import failed: " + r.error); return; }
    const p = { ...r.project, id: uid() }; setMsg(r.warnings.join("; ")); open(p, r.assets); } catch { setMsg("Import failed: not a valid project file"); } };
  return <div className="page"><h1>Projects</h1><p className="sub">Saved automatically on this device.</p>
    <div className="row"><button className="btn" onClick={() => file.current?.click()}>Import project file</button><input ref={file} hidden type="file" accept=".json" onChange={e => { imp(e.target.files?.[0]); e.target.value = ""; }} /><span className="muted">{msg}</span></div>
    {items.length ? <div className="grid" style={{ marginTop: 14 }}>{items.map(({ m, p, a }) => <div key={m.id} className="card"><Thumb p={p} assets={a} /><b>{p.name}</b><div className="muted">{m.width}×{m.height} · {new Date(m.updatedAt).toLocaleDateString()}</div>
      <div className="row" style={{ marginTop: 8 }}><button className="btn primary" onClick={() => open(p, a)}>Open</button><button className="btn" onClick={() => dup(p, a)}>Duplicate</button>
        <button className="btn" onClick={() => saveBlob(new Blob([JSON.stringify(toPackage(p, a))], { type: "application/json" }), `${p.name}.adforge.json`)}>Export</button><button className="btn danger" onClick={() => remove(m.id, p.name)}>Delete</button></div></div>)}</div> : <p className="muted" style={{ marginTop: 14 }}>No saved projects yet.</p>}</div>;
}
