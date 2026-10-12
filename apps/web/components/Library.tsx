"use client";
import { useEffect, useRef, useState } from "react";
import { TEMPLATES, instantiate, searchTemplates, type Category, type Template } from "@adforge/template-library";
import type { Project } from "@adforge/creative-schema";
import { Scene } from "./Scene";
import { saveBlob } from "./Editor";
import { deleteProject, listProjects, loadProject, parsePackage, toPackage, type Assets, type ProjectMeta } from "../lib/store";
import { applyBrandKit, type BrandKit } from "../lib/brand";
import { blankProject, uid } from "../lib/sample";
import { autoCreate } from "../lib/auto";
import { saveProject, saveCaptions } from "../lib/store";
import { downscale, type Studio } from "../lib/useStudio";

export const CATEGORIES: Category[] = ["product-launch", "retail", "food", "fashion", "events", "education", "technology", "real-estate", "services", "offers"];
const label = (c: string) => c.replace("-", " ");
export const Thumb = ({ p, assets = {} }: { p: Project; assets?: Assets }) => <div className="thumb"><Scene project={p} assets={assets} style={{ maxHeight: 170, maxWidth: "100%" }} /></div>;

export type Fmt = "square" | "story" | "landscape";
const fmtOf = (t: { width: number; height: number }): Fmt => (t.width === t.height ? "square" : t.height > t.width ? "story" : "landscape");
export function Home({ s, go, kits, online }: { s: Studio; go: (v: string, cat?: Category, fmt?: Fmt) => void; kits: BrandKit[]; online: boolean }) {
  const [photo, setPhoto] = useState<{ dataUrl: string; w: number; h: number; name: string } | null>(null), photoRef = useRef<HTMLInputElement>(null), [idea, setIdea] = useState(""), [busy, setBusy] = useState(false), [allSizes, setAllSizes] = useState(true), [note, setNote] = useState("");
  const quick = async () => { if (!idea.trim() || busy) return; setBusy(true); setNote(""); try { const r = await autoCreate(idea, { kit: kits[0], allSizes, photo: photo ?? undefined });
    for (const e of r.extras) await saveProject(e, r.assets); await saveCaptions(r.project.id, r.captions); s.openProject(r.project, r.assets); go("create"); } catch (e) { setNote("Could not create the ad: " + (e as Error).message); } finally { setBusy(false); } };
  const [recent, setRecent] = useState<{ p: Project; a: Assets }[]>([]);
  useEffect(() => { (async () => { const out: { p: Project; a: Assets }[] = []; for (const m of (await listProjects()).slice(0, 4)) { const r = await loadProject(m.id); if (r) out.push({ p: r.project, a: r.assets }); } setRecent(out); })().catch(() => {}); }, []);
  const blank = () => { s.openProject(blankProject(1080, 1080)); go("create"); };
  const formats: [Fmt, string, string, string][] = [["square", "▢", "Post", "Instagram, Facebook or WhatsApp post · 1080×1080"], ["story", "▯", "Story / Status", "Instagram or WhatsApp story, TikTok cover · 1080×1920"], ["landscape", "▭", "Banner", "YouTube thumbnail, website or event banner · 1920×1080"]];
  return <div className="page"><h1>Make an ad in 3 steps</h1><p className="sub">No account and no internet needed. Everything is saved on this device.</p>
    <div className="card" style={{ marginBottom: 16, borderColor: "var(--violet)" }}><b>✨ Describe your ad. We build it for you.</b>
      <div className="muted" style={{ margin: "4px 0 10px" }}>Example: “Mama Pima bakery fresh bread 20% off this weekend”. Add a photo for a full-photo ad, or skip it for a bold emoji design. We pick the mood, write a hook, fit the text and make Story and Banner sizes. Prices and discounts appear only if you type them.</div>
      <div className="row"><input className="input" style={{ flex: 1, minWidth: 240 }} aria-label="Describe your ad" placeholder="What are you advertising?" value={idea} onChange={e => setIdea(e.target.value)} onKeyDown={e => e.key === "Enter" && quick()} /><button className="btn" onClick={() => photoRef.current?.click()}>{photo ? `📷 ${photo.name.slice(0, 18)} ✓` : "📷 Add your photo"}</button><input ref={photoRef} hidden type="file" accept="image/*" onChange={async e => { const f = e.target.files?.[0]; e.target.value = ""; if (f) try { const d = await downscale(f); setPhoto({ ...d, name: f.name }); } catch (er) { setNote((er as Error).message); } }} /><button className="btn primary" disabled={busy || !idea.trim()} onClick={quick}>{busy ? "Creating…" : "Create my ad"}</button></div>
      <label className="row muted" style={{ marginTop: 8 }}><input type="checkbox" checked={allSizes} onChange={e => setAllSizes(e.target.checked)} />Also make Story and Banner sizes{kits[0] ? ` · uses brand kit “${kits[0].name}”` : ""}</label>{note && <div className="warn">{note}</div>}</div>
    <div className="steps">{[["Pick a design", "Choose a ready-made layout below."], ["Change the words", "Type your product, offer and button text. Add your photo or logo."], ["Download", "Get a PNG or JPG to post anywhere."]].map(([t, d], i) => <div key={t} className="card step"><span className="n">{i + 1}</span><div><b>{t}</b><div className="muted">{d}</div></div></div>)}</div>
    <h2>What are you making?</h2>
    <div className="grid">{formats.map(([f, icon, t, d]) => <button key={f} className="fmt" onClick={() => go("templates", undefined, f)}><span className="big">{icon}</span><b>{t}</b><span className="muted">{d}</span></button>)}
      <button className="fmt" onClick={blank}><span className="big">＋</span><b>Blank design</b><span className="muted">Start from an empty canvas</span></button></div>
    <div className="row" style={{ marginTop: 14 }}><button className="btn" onClick={() => go("ai")}>✨ Need words? Write my ad copy</button></div>
    {s.recovered && <div className="card" style={{ marginTop: 16 }}><b>Welcome back</b><p className="muted" style={{ margin: "4px 0 10px" }}>Your last design “{s.p.name}” was restored.</p><button className="btn primary" onClick={() => go("create")}>Continue editing</button></div>}
    {recent.length > 0 && <><h2>Your recent designs</h2><div className="grid">{recent.map(({ p, a }) => <div key={p.id} className="card"><Thumb p={p} assets={a} /><b>{p.name}</b><div className="muted">{p.canvas.width}×{p.canvas.height}</div>
      <button className="btn" style={{ marginTop: 8 }} onClick={() => { s.openProject(p, a); go("create"); }}>Open</button></div>)}</div></>}
    <h2>Browse by business type</h2><div className="row">{CATEGORIES.map(c => <button key={c} className="chip" onClick={() => go("templates", c)}>{label(c)}</button>)}</div>
    <p className="muted" style={{ marginTop: 22 }}>{online ? "Online AI is on (you are asked before text is sent)." : "AI copy runs offline on your device."} · {kits.length} brand kit{kits.length === 1 ? "" : "s"} · Video ads and the Android app are not available yet.</p></div>;
}

export function Templates({ s, go, kits, initialCat, initialFmt }: { s: Studio; go: (v: string) => void; kits: BrandKit[]; initialCat?: Category; initialFmt?: Fmt }) {
  const [q, setQ] = useState(""), [cat, setCat] = useState<Category | undefined>(initialCat), [kit, setKit] = useState("");
  const [fmt, setFmt] = useState<Fmt | undefined>(initialFmt);
  useEffect(() => { setCat(initialCat); setFmt(initialFmt); }, [initialCat, initialFmt]);
  const use = (t: Template) => { let p = instantiate(t, { id: uid() }); const k = kits.find(x => x.id === kit); if (k) p = applyBrandKit(p, k); s.openProject(p, {}); go("create"); };
  const list = searchTemplates(q, cat).filter(t => !fmt || fmtOf(t) === fmt);
  return <div className="page"><h1>Pick a design</h1><p className="sub">Click “Use this design”, then change the words and photos. Everything stays editable.</p>
    <div className="row" style={{ marginBottom: 10 }}>{([["", "Any size"], ["square", "Post (square)"], ["story", "Story (tall)"], ["landscape", "Banner (wide)"]] as [string, string][]).map(([k, l]) => <button key={k} className={"chip" + ((fmt ?? "") === k ? " on" : "")} onClick={() => setFmt((k || undefined) as Fmt | undefined)}>{l}</button>)}</div>
    <div className="row"><input className="input" style={{ maxWidth: 260 }} placeholder="Search templates" value={q} onChange={e => setQ(e.target.value)} />
      <select className="input" style={{ maxWidth: 200 }} value={kit} onChange={e => setKit(e.target.value)}><option value="">No brand kit</option>{kits.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}</select></div>
    <div className="row" style={{ margin: "12px 0" }}><button className={"chip" + (!cat ? " on" : "")} onClick={() => setCat(undefined)}>all</button>{CATEGORIES.map(c => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{label(c)}</button>)}</div>
    {list.length ? <div className="grid">{list.map(t => <div key={t.id} className="card"><Thumb p={instantiate(t, { id: t.id })} /><b>{t.name}</b><div className="muted">{label(t.category)} · {t.width}×{t.height}</div><button className="btn primary" style={{ marginTop: 8 }} onClick={() => use(t)}>Use this design</button></div>)}</div> : <p className="muted">No templates match “{q}”.</p>}
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
