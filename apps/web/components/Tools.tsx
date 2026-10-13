"use client";
import { useRef, useState } from "react";
import { deterministicProvider, generateCopyWithFallback, onlineProvider, type Brief, type CopyResult, type CreativeProvider, type Tone } from "@adforge/ai-orchestrator";
import { emotionFor, hooksFor, illoFor, instantiate, recommendTemplate } from "@adforge/template-library";
import { setPillText } from "../lib/pill";
import type { Project } from "@adforge/creative-schema";
import { applyBrandKit, kitColorsFromPalette, type BrandKit } from "../lib/brand";
import { extractPalette, imagePixels } from "../lib/palette";
import { fitAll, otherSizes } from "../lib/smart";
import { FONTS } from "../lib/fonts";
import { saveKits, clearAll, saveSettings, saveProject, saveCaptions, type Settings } from "../lib/store";
import { downscale, type Studio } from "../lib/useStudio";
import { uid } from "../lib/sample";

export function BrandKits({ kits, setKits, s, go }: { kits: BrandKit[]; setKits: (k: BrandKit[]) => void; s: Studio; go: (v: string) => void }) {
  const [id, setId] = useState<string | null>(kits[0]?.id ?? null), logo = useRef<HTMLInputElement>(null), [msg, setMsg] = useState("");
  const k = kits.find(x => x.id === id) ?? null;
  const save = (next: BrandKit[]) => { setKits(next); saveKits(next).catch(() => setMsg("Could not save brand kits")); };
  const create = () => { const n: BrandKit = { id: uid(), name: "My brand", primary: "#7C3AED", secondary: "#22D3EE", accent: "#D4AF37", background: "#0B1026", text: "#FFFFFF", fontFamily: FONTS[0].stack }; save([...kits, n]); setId(n.id); };
  const edit = (patch: Partial<BrandKit>) => k && save(kits.map(x => x.id === k.id ? { ...x, ...patch } : x));
  const autoColours = async (logoUrl: string | undefined = k?.logo) => { if (!logoUrl) return; try { const c = kitColorsFromPalette(extractPalette(await imagePixels(logoUrl), 6)); edit(c); setMsg("Colours picked from your logo. Adjust them if you like."); } catch { setMsg("Could not read colours from that image"); } };
  const applyToDesign = () => { if (k) { s.mutate(p => applyBrandKit(p, k)); setMsg("Applied colours and fonts to the open design (undo with Ctrl+Z)."); } };
  const addLogo = () => { if (k?.logo) { const id2 = s.registerAsset(k.logo, `${k.name} logo`); const im = new Image(); im.onload = () => s.addImageLayer(id2, im.width, im.height, "logo"); im.src = k.logo; go("create"); } };
  const color = (key: "primary" | "secondary" | "accent" | "background" | "text", lab: string) => k && <label key={key} className="row" style={{ justifyContent: "space-between" }}>{lab}<input type="color" value={k[key]} onChange={e => edit({ [key]: e.target.value })} /></label>;
  return <div className="page"><h1>Brand kits</h1><p className="sub">Colours, fonts and a logo you can apply to any design.</p>
    <div className="row">{kits.map(x => <button key={x.id} className={"chip" + (x.id === id ? " on" : "")} onClick={() => setId(x.id)}>{x.name}</button>)}<button className="btn" onClick={create}>+ New brand kit</button></div>
    {k ? <div className="card" style={{ marginTop: 14, display: "grid", gap: 10, maxWidth: 520 }}>
      <input className="input" aria-label="Business name" value={k.name} onChange={e => edit({ name: e.target.value })} placeholder="Business name" />
      {color("primary", "Primary")}{color("secondary", "Secondary")}{color("accent", "Accent (buttons)")}{color("background", "Background")}{color("text", "Heading text")}
      <select className="input" aria-label="Font" value={k.fontFamily} onChange={e => edit({ fontFamily: e.target.value })}>{FONTS.map(f => <option key={f.label} value={f.stack}>{f.label}</option>)}</select>
      <input className="input" placeholder="Slogan (optional)" value={k.slogan ?? ""} onChange={e => edit({ slogan: e.target.value })} />
      <input className="input" placeholder="Website or contact (optional)" value={k.website ?? ""} onChange={e => edit({ website: e.target.value })} />
      <textarea className="input" rows={2} placeholder="Approved messaging (optional)" value={k.messaging ?? ""} onChange={e => edit({ messaging: e.target.value })} />
      <div className="row">{k.logo ? <img src={k.logo} alt="Logo" style={{ height: 48, background: "#fff2", borderRadius: 6 }} /> : <span className="muted">No logo</span>}
        <button className="btn" onClick={() => logo.current?.click()}>{k.logo ? "Replace logo" : "Upload logo"}</button><input ref={logo} hidden type="file" accept="image/*" onChange={async e => { const f = e.target.files?.[0]; e.target.value = ""; if (f) try { { const url = (await downscale(f, 512)).dataUrl; let extra = {}; if (!k?.logo) { try { extra = kitColorsFromPalette(extractPalette(await imagePixels(url), 6)); setMsg("Colours picked from your logo. Adjust them if you like."); } catch { /* keep current colours */ } } edit({ logo: url, ...extra }); } } catch (er) { setMsg((er as Error).message); } }} />{k.logo && <button className="btn" onClick={() => autoColours()}>✨ Auto-colours from logo</button>}{k.logo && <button className="btn" onClick={() => edit({ logo: undefined })}>Remove</button>}</div>
      <div className="row"><button className="btn primary" onClick={applyToDesign}>Apply to open design</button><button className="btn" disabled={!k.logo} onClick={addLogo}>Add logo to design</button>
        <button className="btn danger" onClick={() => { if (confirm(`Delete brand kit “${k.name}”?`)) { save(kits.filter(x => x.id !== k.id)); setId(null); } }}>Delete</button></div>
      <span className="muted">{msg}</span></div> : <p className="muted" style={{ marginTop: 14 }}>No brand kits yet.</p>}</div>;
}

const TONES: Tone[] = ["professional", "friendly", "urgent", "luxury", "playful"];
export function AiStudio({ s, kits, settings, go }: { s: Studio; kits: BrandKit[]; settings: Settings; go: (v: string) => void }) {
  const [b, setB] = useState<Brief>({ product: "", tone: "friendly", language: "en" }), [res, setRes] = useState<{ copy: CopyResult; providerId: string; notes: string[] } | null>(null), [busy, setBusy] = useState(false), [kit, setKit] = useState(""), [msg, setMsg] = useState("");
  const set = (patch: Partial<Brief>) => setB(x => ({ ...x, ...patch }));
  async function generate() {
    if (!b.product.trim()) { setMsg("Enter a product or service first."); return; } setBusy(true); setMsg("");
    try { const providers: CreativeProvider[] = [];
      if (settings.onlineEnabled && settings.endpoint) { const ok = confirm(`Send this brief's text (product, audience, tone, offer, etc.) to ${settings.endpoint}? No images or projects are sent.`);
        if (ok) providers.push(onlineProvider({ endpoint: settings.endpoint, apiKey: settings.apiKey || undefined, consentGranted: () => true })); }
      providers.push(deterministicProvider); setRes(await generateCopyWithFallback(providers, b)); } catch (e) { setMsg("Generation failed: " + (e as Error).message); } finally { setBusy(false); } }
  const put = (name: "hook" | "headline" | "subtitle" | "cta", text: string) => { const l = s.p.layers.find(x => x.name === name && x.type === "text"); if (!l) { setMsg(`The open design has no “${name}” text layer. Select a text layer in Create and use “Selected”.`); return; } if ((name === "hook" || name === "cta") && s.p.meta) s.mutate(q => setPillText(q, name, text)); else s.upd(l.id, { text } as never); setMsg(`Applied to ${name} (undo with Ctrl+Z).`); };
  const putSel = (text: string) => { const l = s.p.layers.find(x => x.id === s.sel); if (!l || l.type !== "text") { setMsg("Select a text layer in Create first."); return; } s.upd(l.id, { text } as never); setMsg("Applied to selected text."); };
  const baseDesign = (headline: string) => { const k = kits.find(x => x.id === kit), tpl = recommendTemplate(`${b.product} ${b.audience ?? ""}`), emo = emotionFor(`${b.product} ${b.offer ?? ""}`, tpl.emotion), hooks = hooksFor(tpl.category, emo);
    let d = instantiate(tpl, { id: uid(), name: b.product, emotion: emo, illo: illoFor(`${b.product} ${b.audience ?? ""}`, tpl.category), copy: { headline, subtitle: [b.offer, b.price].filter(Boolean).join(" · ") || res!.copy.supporting[0], cta: res!.copy.ctas[0], hook: hooks[0], badge: b.offer || undefined } }); if (k) d = applyBrandKit(d, k); return fitAll(d); };
  const captionsText = () => [...res!.copy.captions, "", res!.copy.hashtags.join(" ")].join("\n");
  async function campaign() {
    if (!res) return; const base = baseDesign(res.copy.headlines[0]), all = [base, ...otherSizes(base)];
    for (const d of all) await saveProject(d, {}); await saveCaptions(base.id, captionsText()); s.openProject(base, {}); setMsg(`Created ${all.length} designs (${all.map(d => d.name.split(" — ").pop() === d.name ? "Post" : d.name.split(" — ").pop()).join(", ")}) in Projects.`); go("projects"); }
  async function variants() {
    if (!res) return; const heads = res.copy.headlines.slice(0, 3); for (const [i, h] of heads.entries()) { const d = { ...baseDesign(h), name: `${b.product} — Variant ${"ABC"[i]}` }; await saveProject(d, {}); }
    setMsg(`Created ${heads.length} A/B variants with different headlines in Projects.`); go("projects"); }
  const tplForHooks = recommendTemplate(b.product), hookIdeas = b.product.trim() ? hooksFor(tplForHooks.category, emotionFor(b.product, tplForHooks.emotion)) : [];
  const list = (title: string, items: string[], target?: "hook" | "headline" | "subtitle" | "cta") => items.length > 0 && <div><h2>{title}</h2>{items.map(t => <div key={t} className="card" style={{ marginBottom: 6, display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}><span>{t}</span>
    <span className="row">{target && <button className="btn" onClick={() => put(target, t)}>Use as {target === "cta" ? "button" : target}</button>}<button className="btn" onClick={() => putSel(t)}>Selected text</button><button className="btn" onClick={() => navigator.clipboard?.writeText(t)}>Copy</button></span></div>)}</div>;
  return <div className="page"><h1>AI Studio</h1><p className="sub">Offline copy suggestions. Nothing changes your design until you press an “apply” button.</p>
    <div className="card" style={{ display: "grid", gap: 8, maxWidth: 640 }}>
      <input className="input" aria-label="Product or service" placeholder="Product or service *" value={b.product} onChange={e => set({ product: e.target.value })} />
      <input className="input" placeholder="Target audience" value={b.audience ?? ""} onChange={e => set({ audience: e.target.value })} />
      <div className="row"><select className="input" style={{ flex: 1 }} aria-label="Tone" value={b.tone} onChange={e => set({ tone: e.target.value as Tone })}>{TONES.map(t => <option key={t}>{t}</option>)}</select>
        <select className="input" style={{ flex: 1 }} aria-label="Language" value={b.language} onChange={e => set({ language: e.target.value })}><option value="en">English</option><option value="sw">Kiswahili</option><option value="sheng">Sheng (not evaluated)</option></select></div>
      <input className="input" placeholder="Platform (e.g. Instagram story)" value={b.platform ?? ""} onChange={e => set({ platform: e.target.value })} />
      <input className="input" placeholder="Offer — only if real (optional)" value={b.offer ?? ""} onChange={e => set({ offer: e.target.value })} />
      <input className="input" placeholder="Price — only if real (optional)" value={b.price ?? ""} onChange={e => set({ price: e.target.value })} />
      <input className="input" placeholder="Call to action (optional)" value={b.cta ?? ""} onChange={e => set({ cta: e.target.value })} />
      <div className="row"><button className="btn primary" disabled={busy} onClick={generate}>{busy ? "Generating…" : "Generate copy"}</button><span className="muted">{msg}</span></div>
      <span className="muted">Prices, discounts and claims are never invented: they appear only if you type them above.</span></div>
    {res && <><p className="muted" style={{ marginTop: 14 }}>Source: {res.providerId === "deterministic" ? "offline engine" : res.providerId}{res.notes.length ? " · " + res.notes.join(" · ") : ""}</p>
      <div className="row"><select className="input" style={{ maxWidth: 220 }} value={kit} onChange={e => setKit(e.target.value)}><option value="">No brand kit</option>{kits.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}</select><button className="btn gold" onClick={campaign}>Create campaign (Post + Story + Banner)</button><button className="btn" onClick={variants}>Create A/B variants</button><button className="btn" onClick={() => navigator.clipboard?.writeText(captionsText())}>Copy all captions</button></div>
      {list("Headlines", res.copy.headlines, "headline")}{list("Emotional hooks", hookIdeas, "hook")}{list("Supporting copy", res.copy.supporting, "subtitle")}{list("Hooks", res.copy.hooks)}{list("Calls to action", res.copy.ctas, "cta")}{list("Captions", res.copy.captions)}
      {res.copy.hashtags.length > 0 && <><h2>Hashtags</h2><div className="row">{res.copy.hashtags.map(h => <span key={h} className="chip">{h}</span>)}</div></>}</>}</div>;
}

export function SettingsView({ settings, setSettings }: { settings: Settings; setSettings: (s: Settings) => void }) {
  const [msg, setMsg] = useState(""); const upd = (p: Partial<Settings>) => { const n = { ...settings, ...p }; setSettings(n); saveSettings(n).catch(() => setMsg("Could not save settings")); };
  return <div className="page"><h1>Settings</h1><p className="sub">AdForge works fully offline. Online AI is optional and off by default.</p>
    <div className="card" style={{ display: "grid", gap: 10, maxWidth: 560 }}><b>Online AI provider (optional)</b>
      <label className="row"><input type="checkbox" checked={settings.onlineEnabled} onChange={e => { if (e.target.checked && !confirm("Online AI sends the text of your brief (product, audience, tone, offer, price…) to the endpoint you set. Images and projects are never sent. You will be asked again before each request. Enable?")) return; upd({ onlineEnabled: e.target.checked }); }} />Allow online AI</label>
      <input className="input" placeholder="Endpoint URL (https://…)" value={settings.endpoint} onChange={e => upd({ endpoint: e.target.value.trim() })} />
      <input className="input" type="password" placeholder="API key (optional)" value={settings.apiKey} onChange={e => upd({ apiKey: e.target.value })} />
      <span className="muted">The key is stored only in this browser (not encrypted). The endpoint must accept POST {"{ brief }"} and return JSON with headlines, supporting, hooks, ctas, captions, hashtags. Output is validated before use. No provider is bundled; quotas and privacy depend on the one you choose.</span></div>
    <div className="card" style={{ marginTop: 14, display: "grid", gap: 10, maxWidth: 560 }}><b>Real photos (optional)</b>
      <span className="muted"><b>Offline library:</b> run <code>PEXELS_API_KEY=your_key npm run photos -w @adforge/web</code> once. Photos are saved on this computer and used without internet. <b>Search inside AdForge:</b> turn on below with a free Pexels key.</span>
      <label className="row"><input type="checkbox" checked={settings.photosEnabled} onChange={e => { if (e.target.checked && !confirm("Photo search sends your search words and your Pexels API key to api.pexels.com. Your designs and images are never uploaded. You are asked before each search. Enable?")) return; upd({ photosEnabled: e.target.checked }); }} />Allow Pexels photo search</label>
      <input className="input" type="password" placeholder="Pexels API key (free at pexels.com/api)" value={settings.pexelsKey} onChange={e => upd({ pexelsKey: e.target.value })} />
      <span className="muted">Photos are from Pexels (free licence). Photographer credits are saved with each photo and added to your ZIP downloads. The key is stored only in this browser.</span></div>
    <div className="card" style={{ marginTop: 14, maxWidth: 560 }}><b>Local data</b><p className="muted">Projects, images, brand kits and settings are stored in this browser only.</p>
      <button className="btn danger" onClick={async () => { if (confirm("Delete ALL projects, images, brand kits and settings from this device?")) { await clearAll(); location.reload(); } }}>Delete all local data</button><span className="muted"> {msg}</span></div></div>;
}
