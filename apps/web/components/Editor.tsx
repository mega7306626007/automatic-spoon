"use client";
import { useEffect, useRef, useState } from "react";
import { ILLO_LABELS, type AssetCredit, alignTo, boundingBox, reorder, resizeLayers, type Align, type Layer, type Project, type TextLayer, type ImageLayer, type Fill } from "@adforge/creative-schema";
import { Scene } from "./Scene";
import { snapMove, type Guide } from "../lib/snap";
import { textOverflows } from "../lib/text";
import { brandWarnings, fixContrast } from "../lib/brand";
import { fitFontSize } from "../lib/autofit";
import { otherSizes, relayout } from "../lib/smart";
import { setPillText } from "../lib/pill";
import { EMOTION_LIST, TEMPLATES, hooksFor, type Category, type EmotionId } from "@adforge/template-library";
import { renderProjectToBlob } from "../lib/render";
import { makeZip } from "../lib/zip";
import { toPackage, saveProject, loadCaptions, type Settings } from "../lib/store";
import { PhotoPicker } from "./PhotoPicker";
import { creditLine } from "../lib/photos";
import { FONTS } from "../lib/fonts";
import { uid } from "../lib/sample";
import { downscale, type Studio } from "../lib/useStudio";

const SIZES: Record<string, [number, number]> = { "Square 1080×1080": [1080, 1080], "Portrait 1080×1350": [1080, 1350], "Story 1080×1920": [1080, 1920], "Landscape 1920×1080": [1920, 1080], "Banner 1500×500": [1500, 500] };
type Drag = { mode: "move" | "resize" | "rotate"; id: string; l: Layer; sx: number; sy: number; k: number; hx: number; hy: number };
export const saveBlob = (b: Blob, name: string) => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name.replace(/[\\/:*?"<>|]+/g, "_"); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
const STICKERS = ["😍", "😋", "🔥", "🎉", "✨", "💎", "❤️", "🥰", "🌿", "🚀", "🏡", "👗", "📚", "🛍️", "💡", "🤝", "⏰", "💥", "🎶", "🙌"];
const LAYOUT_LABEL: Record<string, string> = { hero: "Full photo", split: "Photo card", magazine: "Magazine", circle: "Round photo", showcase: "Showcase", studio: "Studio", clean: "Clean card", burst: "Emoji burst", poster: "Bold poster" };
const NICE: Record<string, string> = { illo: "Illustration", hook: "Hook line", "hook-bg": "Hook chip", emoji: "Sticker", emoji2: "Sticker 2", emoji3: "Sticker 3", badge: "Offer badge", "badge-text": "Offer text", art: "Background art", art2: "Art overlay", scrim: "Photo shade", ring: "Glow ring", "hero-circle": "Hero circle", headline: "Headline", subtitle: "Subtitle", cta: "Button text", "cta-bg": "Button", accent: "Accent shape", image: "Photo" };
const nice = (n: string) => NICE[n] ?? n;
const solid = (c: string): Fill => ({ kind: "solid", color: c });
const FillEditor = ({ f, onChange }: { f: Fill; onChange: (f: Fill) => void }) => {
  const c1 = f.kind === "gradient" ? f.stops?.[0]?.color ?? "#000000" : f.color ?? "#000000", c2 = f.stops?.[1]?.color ?? "#7C3AED";
  const grad = (a: string, b: string, ang = f.angle ?? 160): Fill => ({ kind: "gradient", angle: ang, stops: [{ offset: 0, color: a }, { offset: 1, color: b }] });
  return <div style={{ display: "grid", gap: 6 }}><label>Fill<select className="input" value={f.kind} onChange={e => onChange(e.target.value === "solid" ? solid(c1) : grad(c1, c2))}><option value="solid">Solid</option><option value="gradient">Gradient</option></select></label>
    <label>Colour<span className="row"><input type="color" value={c1.slice(0, 7)} onChange={e => onChange(f.kind === "solid" ? solid(e.target.value) : grad(e.target.value, c2))} />
      {f.kind === "gradient" && <><input type="color" value={c2.slice(0, 7)} onChange={e => onChange(grad(c1, e.target.value))} /><input className="input" style={{ width: 64 }} type="number" aria-label="Angle" value={f.angle ?? 160} onChange={e => onChange(grad(c1, c2, +e.target.value))} /></>}</span></label></div>; };

export function Editor({ s, settings }: { s: Studio; settings: Settings }) {
  const { p, assets, sel, setSel } = s, layer = p.layers.find(l => l.id === sel) ?? null;
  const svgRef = useRef<SVGSVGElement>(null), drag = useRef<Drag | null>(null), fileRef = useRef<HTMLInputElement>(null), replaceRef = useRef<HTMLInputElement>(null);
  const [guides, setGuides] = useState<Guide[]>([]), [msg, setMsg] = useState(""), [scale, setScale] = useState(1), [busy, setBusy] = useState(false), [help, setHelp] = useState(false), [picker, setPicker] = useState(false);
  useEffect(() => { try { if (localStorage.getItem("adforge-tips") !== "1") setHelp(true); } catch {} }, []);
  const closeHelp = () => { setHelp(false); try { localStorage.setItem("adforge-tips", "1"); } catch {} };
  const [cw, setCw] = useState(p.canvas.width), [ch, setCh] = useState(p.canvas.height);
  useEffect(() => { setCw(p.canvas.width); setCh(p.canvas.height); }, [p.canvas.width, p.canvas.height]);
  const duplicate = () => { if (layer) s.add({ ...layer, id: uid(), name: layer.name + " copy", x: layer.x + 30, y: layer.y + 30 }); };
  useEffect(() => { const k = (e: KeyboardEvent) => { const t = e.target as HTMLElement; if (/INPUT|TEXTAREA|SELECT/.test(t.tagName)) return; const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? s.redo() : s.undo(); } else if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); s.redo(); }
    else if (mod && e.key.toLowerCase() === "d") { e.preventDefault(); duplicate(); } else if (e.key === "Delete" || e.key === "Backspace") s.del();
    else if (layer && !layer.locked && e.key.startsWith("Arrow")) { e.preventDefault(); const n = e.shiftKey ? 10 : 1; s.upd(layer.id, { x: layer.x + (e.key === "ArrowRight" ? n : e.key === "ArrowLeft" ? -n : 0), y: layer.y + (e.key === "ArrowDown" ? n : e.key === "ArrowUp" ? -n : 0) }); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); });

  const begin = (e: React.PointerEvent, l: Layer, mode: Drag["mode"], hx = 0, hy = 0) => { e.stopPropagation(); setSel(l.id); if (l.locked) return;
    const svg = svgRef.current!, r = svg.getBoundingClientRect(); drag.current = { mode, id: l.id, l: { ...l }, sx: e.clientX, sy: e.clientY, k: p.canvas.width / r.width, hx, hy }; s.beginDrag(); svg.setPointerCapture(e.pointerId); };
  const onMove = (e: React.PointerEvent) => { const d = drag.current; if (!d) return; const dx = (e.clientX - d.sx) * d.k, dy = (e.clientY - d.sy) * d.k;
    if (d.mode === "move") { let nx = d.l.x + dx, ny = d.l.y + dy; const others = p.layers.filter(o => o.id !== d.id && o.visible !== false).map(boundingBox);
      const sn = e.altKey ? { dx: 0, dy: 0, guides: [] as Guide[] } : snapMove(boundingBox({ ...d.l, x: nx, y: ny }), { w: p.canvas.width, h: p.canvas.height }, others, 8 * d.k); nx += sn.dx; ny += sn.dy; setGuides(sn.guides); s.liveLayer(d.id, { x: nx, y: ny }); }
    else if (d.mode === "resize") { const a = (d.l.rotation * Math.PI) / 180, lx = dx * Math.cos(-a) - dy * Math.sin(-a), ly = dx * Math.sin(-a) + dy * Math.cos(-a);
      let dw = d.hx * lx, dh = d.hy * ly; if ((e.shiftKey || d.l.type === "image") && d.hx && d.hy) dh = (dw * d.l.h) / d.l.w;
      const w = Math.max(10, d.l.w + dw), h = Math.max(10, d.l.h + dh); dw = w - d.l.w; dh = h - d.l.h; const ox = (d.hx * dw) / 2, oy = (d.hy * dh) / 2;
      const cx = d.l.x + d.l.w / 2 + ox * Math.cos(a) - oy * Math.sin(a), cy = d.l.y + d.l.h / 2 + ox * Math.sin(a) + oy * Math.cos(a); const fs = d.l.type === "text" && d.l.autoFit ? { fontSize: fitFontSize({ ...d.l, w, h }) } : {}; s.liveLayer(d.id, { w, h, x: cx - w / 2, y: cy - h / 2, ...fs } as Partial<Layer>); }
    else { const r = svgRef.current!.getBoundingClientRect(), px = (e.clientX - r.left) * d.k, py = (e.clientY - r.top) * d.k, cx = d.l.x + d.l.w / 2, cy = d.l.y + d.l.h / 2;
      let ang = (Math.atan2(py - cy, px - cx) * 180) / Math.PI + 90; if (e.shiftKey) ang = Math.round(ang / 15) * 15; s.liveLayer(d.id, { rotation: Math.round(((ang % 360) + 360) % 360 * 10) / 10 }); } };
  const onUp = () => { drag.current = null; setGuides([]); };

  const hs = Math.max(p.canvas.width, p.canvas.height) / 55, lw = Math.max(p.canvas.width, p.canvas.height) / 500;
  const warns = layer && layer.type === "text" && textOverflows(layer);
  const overlay = <>
    {guides.map((g, i) => g.axis === "x" ? <line key={i} x1={g.pos} x2={g.pos} y1={0} y2={p.canvas.height} stroke="#22D3EE" strokeWidth={lw} /> : <line key={i} y1={g.pos} y2={g.pos} x1={0} x2={p.canvas.width} stroke="#22D3EE" strokeWidth={lw} />)}
    {layer && layer.visible !== false && (() => { const cx = layer.x + layer.w / 2, cy = layer.y + layer.h / 2, hp: [number, number][] = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
      return <g transform={`rotate(${layer.rotation} ${cx} ${cy})`}><rect x={layer.x} y={layer.y} width={layer.w} height={layer.h} fill="none" stroke={warns ? "#F59E0B" : "#22D3EE"} strokeWidth={lw} strokeDasharray={`${lw * 5} ${lw * 4}`} pointerEvents="none" />
        {!layer.locked && <>{hp.map(([hx, hy]) => <rect key={`${hx}${hy}`} x={cx + (hx * layer.w) / 2 - hs / 2} y={cy + (hy * layer.h) / 2 - hs / 2} width={hs} height={hs} fill="#fff" stroke="#7C3AED" strokeWidth={lw} style={{ cursor: "nwse-resize" }} onPointerDown={e => begin(e, layer, "resize", hx, hy)} />)}
          <line x1={cx} x2={cx} y1={layer.y} y2={layer.y - hs * 2} stroke="#22D3EE" strokeWidth={lw} pointerEvents="none" /><circle cx={cx} cy={layer.y - hs * 2.4} r={hs * 0.7} fill="#22D3EE" style={{ cursor: "grab" }} onPointerDown={e => begin(e, layer, "rotate")} /></>}</g>; })()}</>;

  const stamp = () => p.name.replace(/[^\w\- ]+/g, "").trim() || "ad";
  async function exportImage(fmt: "png" | "jpeg") {
    if (busy || !okToExport()) return; setBusy(true);
    try { setMsg("Rendering…"); const blob = await renderProjectToBlob(p, assets, fmt, scale); saveBlob(blob, `${stamp()}.${fmt === "jpeg" ? "jpg" : "png"}`); setMsg(`Downloaded ${Math.round(p.canvas.width * scale)}×${Math.round(p.canvas.height * scale)} ${fmt.toUpperCase()} (${Math.round(blob.size / 1024)} KB)`);
    } catch (e) { setMsg("Export failed: " + (e as Error).message); } finally { setBusy(false); } }
  async function allSizesZip() {
    if (busy || !okToExport()) return; setBusy(true);
    try { const designs = [{ label: "current", d: p }, ...otherSizes(p).map(d => ({ label: d.name.split(" — ").pop()!, d }))], files: { name: string; data: Uint8Array }[] = [];
      for (let i = 0; i < designs.length; i++) { const { label, d } = designs[i]; setMsg(`Rendering ${i + 1}/${designs.length}…`); const blob = await renderProjectToBlob(d, assets, "png", scale);
        files.push({ name: `${stamp()}-${label.toLowerCase()}-${d.canvas.width}x${d.canvas.height}.png`, data: new Uint8Array(await blob.arrayBuffer()) }); }
      const cap = await loadCaptions(p.id).catch(() => undefined), credits = p.assets.filter(a => a.credit && assets[a.id]).map(a => creditLine(a.credit!)), txt = [cap ?? "", credits.length ? "\nCredits:\n" + credits.join("\n") : ""].join("\n").trim(); if (txt) files.push({ name: "captions.txt", data: new TextEncoder().encode(txt) });
      saveBlob(new Blob([makeZip(files) as BlobPart], { type: "application/zip" }), `${stamp()}-all-sizes.zip`); setMsg(`Downloaded ZIP with ${files.length} files`);
    } catch (e) { setMsg("ZIP failed: " + (e as Error).message); } finally { setBusy(false); } }
  async function makeSizes() {
    try { const list = otherSizes(p); for (const d of list) await saveProject(d, assets); setMsg(`Created ${list.length} designs (${list.map(d => d.name.split(" — ").pop()).join(", ")}). Find them in Projects.`); } catch (e) { setMsg("Could not create sizes: " + (e as Error).message); } }
  const placePhoto = (d: { dataUrl: string; w: number; h: number }, name: string, credit?: AssetCredit, replace?: boolean) => { const id = s.registerAsset(d.dataUrl, name, credit);
    const target = replace && layer?.type === "image" ? layer : p.layers.find(l => l.type === "image" && !assets[l.assetId]);
    if (target) s.upd(target.id, { assetId: id } as Partial<ImageLayer>); else s.addImageLayer(id, d.w, d.h, name.replace(/\.[^.]+$/, "")); };
  async function pickImage(f: File | undefined, replace?: boolean) { if (!f) return; try { setMsg("Importing photo…"); const d = await downscale(f); placePhoto(d, f.name, undefined, replace); setMsg(""); } catch (e) { setMsg((e as Error).message); } }
  const emptyPhoto = p.layers.some(l => l.type === "image" && !assets[l.assetId]);
  const okToExport = () => !emptyPhoto || confirm("This design still has an empty photo area. Add your photo first (press 📷 Add photo), or download anyway?");
  const base = { rotation: 0, opacity: 1 };
  const addText = () => s.add({ ...base, id: uid(), name: "Text", type: "text", text: "New text", x: p.canvas.width * 0.1, y: p.canvas.height * 0.1, w: p.canvas.width * 0.6, h: p.canvas.height * 0.12, fontFamily: FONTS[0].stack, fontSize: p.canvas.width * 0.06, color: "#FFFFFF", align: "left", lineHeight: 1.2, letterSpacing: 0 });
  const addShape = (shape: "rect" | "ellipse") => s.add({ ...base, id: uid(), name: shape, type: "shape", shape, x: p.canvas.width * 0.2, y: p.canvas.height * 0.2, w: p.canvas.width * 0.3, h: p.canvas.width * 0.3, fill: solid("#22D3EE") });
  const applySize = (w: number, h: number) => { if (w < 16 || h < 16 || w > 8192 || h > 8192) { setMsg("Size must be 16–8192 px"); return; } s.mutate(q => ({ ...q, canvas: { ...q.canvas, width: w, height: h }, layers: resizeLayers(q.layers, q.canvas, { width: w, height: h }) })); };
  const reorderBy = (d: number) => { if (layer) s.mutate(q => ({ ...q, layers: reorder(q.layers, layer.id, q.layers.findIndex(l => l.id === layer.id) + d) })); };
  const num = (k: "x" | "y" | "w" | "h" | "rotation", lab: string) => layer && <label key={k}>{lab}<input className="input" type="number" value={Math.round(layer[k] * 10) / 10} onChange={e => s.upd(layer.id, { [k]: +e.target.value })} /></label>;
  const bw = brandWarnings(p);
  const hookList = p.meta ? hooksFor((TEMPLATES.find(t => t.id === p.meta?.templateId)?.category ?? "product-launch") as Category, p.meta.emotion as EmotionId) : [];
  const setText = (l: TextLayer, text: string) => p.meta && (l.name === "hook" || l.name === "cta") ? s.mutate(q => setPillText(q, l.name as "hook" | "cta", text)) : s.upd(l.id, (l.autoFit ? { text, fontSize: fitFontSize({ ...l, text }) } : { text }) as Partial<TextLayer>);
  const setSize = (l: TextLayer, v: number) => s.upd(l.id, (l.autoFit ? { fitMax: v, fontSize: fitFontSize({ ...l, fitMax: v }) } : { fontSize: v }) as Partial<TextLayer>);
  const doAlign = (how: Align) => { if (layer && !layer.locked) s.upd(layer.id, alignTo(layer, p.canvas, how)); };

  return <div className="editor">
    <div className="stage">
      <div className="toolbar">
        <button className="btn" title="Add a text box" onClick={addText}>＋ Text</button><button className="btn" title="Add a rectangle" onClick={() => addShape("rect")}>▭ Rectangle</button><button className="btn" title="Add a circle" onClick={() => addShape("ellipse")}>◯ Circle</button>
        <button className="btn" title="Add your photo or logo from your device" onClick={() => fileRef.current?.click()}>📷 Add photo</button><button className="btn" title="Find a real photo: your offline library or Pexels" onClick={() => setPicker(true)}>🔎 Stock photos</button><input ref={fileRef} type="file" accept="image/*" hidden onChange={e => { pickImage(e.target.files?.[0]); e.target.value = ""; }} />
        <span className="sep" /><button className="btn" title="Undo (Ctrl+Z)" disabled={!s.canUndo} onClick={s.undo}>↶ Undo</button><button className="btn" title="Redo (Ctrl+Y)" disabled={!s.canRedo} onClick={s.redo}>↷ Redo</button>
        <span style={{ flex: 1 }} /><button className="btn" onClick={() => (help ? closeHelp() : setHelp(true))}>? How it works</button>
        <button className="btn" title="Save an editable copy of this design as a file" onClick={() => saveBlob(new Blob([JSON.stringify(toPackage(p, assets))], { type: "application/json" }), `${p.name}.adforge.json`)}>Save file</button>
        <select className="btn" aria-label="Image quality" title="Image quality" value={scale} onChange={e => setScale(+e.target.value)}><option value={1}>Standard quality</option><option value={2}>High quality (2×)</option></select>
        <button className="btn primary" disabled={busy} onClick={() => exportImage("png")}>⬇ Download PNG</button><button className="btn" disabled={busy} onClick={() => exportImage("jpeg")}>JPG</button>
        <button className="btn gold" disabled={busy} title="Re-lays out this design for Post, Story and Banner and downloads them together with your captions" onClick={allSizesZip}>⬇ All sizes (ZIP)</button><button className="btn" title="Creates Story and Banner versions as new designs in Projects" onClick={makeSizes}>⚡ Make other sizes</button></div>
      {(msg || s.status) && <div className="muted" style={{ padding: "4px 12px", fontSize: 12 }}>{msg || s.status}</div>}
      {help && <div className="tips"><div><b>How it works</b><ol><li><b>Change the words:</b> type in the “Edit your text” boxes on the right.</li><li><b>Move things:</b> click an item on the design, then drag it. Drag the white squares to resize, the round dot to rotate.</li><li><b>Add things:</b> use ＋ Text, shapes or 🖼 Photo at the top.</li><li><b>Finish:</b> press ⬇ Download PNG. Your work is saved automatically on this device.</li></ol></div><button className="btn" onClick={closeHelp}>Got it</button></div>}
      <div className="canvasWrap"><Scene project={p} assets={assets} svgRef={svgRef} onLayerDown={(e, l) => begin(e, l, "move")} onBackgroundDown={() => setSel(null)} onMove={onMove} onUp={onUp} overlay={overlay}
        style={{ maxWidth: "100%", maxHeight: "100%", width: p.canvas.width >= p.canvas.height ? "min(100%, 900px)" : undefined, height: p.canvas.height > p.canvas.width ? "min(100%, 760px)" : undefined, boxShadow: "0 10px 50px #000a", touchAction: "none" }} /></div>
    </div>
    <aside className="panel">
      <input className="input" aria-label="Project name" value={p.name} onChange={e => s.mutate(q => ({ ...q, name: e.target.value }))} />
      <div className="row"><select className="input" style={{ flex: 1 }} value="" onChange={e => e.target.value && applySize(...SIZES[e.target.value])}><option value="">{p.canvas.width}×{p.canvas.height} — resize…</option>{Object.keys(SIZES).map(k => <option key={k}>{k}</option>)}</select></div>
      <div className="row"><input className="input" style={{ width: 80 }} type="number" aria-label="Width" value={cw} onChange={e => setCw(+e.target.value)} /><span>×</span><input className="input" style={{ width: 80 }} type="number" aria-label="Height" value={ch} onChange={e => setCh(+e.target.value)} /><button className="btn" onClick={() => applySize(cw, ch)}>Set</button></div>
      <details><summary className="muted">Background</summary><div style={{ marginTop: 8 }}><FillEditor f={p.canvas.background} onChange={f => s.mutate(q => ({ ...q, canvas: { ...q.canvas, background: f } }))} /></div></details>
      {p.meta && <details open><summary className="muted">Mood, hook & stickers</summary><div style={{ display: "grid", gap: 8, marginTop: 8 }}>
        <div className="muted">Mood changes colours, stickers and background art. It rebuilds the arrangement (Ctrl+Z undoes it).</div>
        <div className="row">{EMOTION_LIST.map(e => <button key={e.id} className={"chip" + (p.meta!.emotion === e.id ? " on" : "")} onClick={() => s.mutate(q => relayout(q, { emotion: e.id, palette: e.palette, emojis: e.emojis, art: e.art }))}>{e.emojis[0]} {e.label}</button>)}</div>
        <div className="muted">Hook line: tap one to use it</div><div className="row">{hookList.map(h => <button key={h} className="chip" onClick={() => s.mutate(q => setPillText(q, "hook", h))}>{h}</button>)}</div>
        <div className="muted">Main sticker</div><div className="row">{STICKERS.map(e => <button key={e} className="chip" style={{ fontSize: 16 }} onClick={() => s.mutate(q => relayout(q, { emojis: [e, ...(q.meta?.emojis.slice(1) ?? [])] }))}>{e}</button>)}</div>
        {["showcase", "studio", "clean"].includes(p.meta.style) && <><div className="muted">Illustration</div><div className="row">{Object.entries(ILLO_LABELS).map(([k, l]) => <button key={k} className={"chip" + (p.meta!.illo === k ? " on" : "")} onClick={() => s.mutate(q => relayout(q, { illo: k }))}>{l}</button>)}</div></>}
        <div className="row"><span className="muted">Layout</span>{(p.meta.needsPhoto ? ["hero", "split", "magazine", "circle"] : ["showcase", "studio", "clean", "burst", "poster"]).map(st => <button key={st} className={"chip" + (p.meta!.style === st ? " on" : "")} onClick={() => s.mutate(q => relayout(q, { style: st }))}>{LAYOUT_LABEL[st]}</button>)}</div></div></details>}
      {bw.map(w => <div key={w} className="warn">⚠ {w}</div>)}{bw.length > 0 && <button className="btn" onClick={() => s.mutate(fixContrast)}>✨ Fix contrast automatically</button>}
      {layer ? <div style={{ display: "grid", gap: 8, borderTop: "1px solid var(--line)", paddingTop: 8 }}>
        <b>{nice(layer.name)}</b>
        {layer.type === "text" && <>
          <textarea className="input" rows={3} value={layer.text} onChange={e => setText(layer, e.target.value)} />
          <label>Font<select className="input" value={FONTS.find(f => f.stack === layer.fontFamily) ? layer.fontFamily : ""} onChange={e => e.target.value && s.upd(layer.id, { fontFamily: e.target.value } as Partial<TextLayer>)}>{!FONTS.find(f => f.stack === layer.fontFamily) && <option value="">(custom)</option>}{FONTS.map(f => <option key={f.label} value={f.stack}>{f.label}</option>)}</select></label>
          <label>Size<input className="input" type="number" value={Math.round(layer.fontSize)} onChange={e => setSize(layer, Math.max(1, +e.target.value))} /></label>
          <label>Colour<span className="row"><input type="color" value={layer.color.slice(0, 7)} onChange={e => s.upd(layer.id, { color: e.target.value } as Partial<TextLayer>)} />
            <select className="input" style={{ flex: 1 }} value={layer.align} onChange={e => s.upd(layer.id, { align: e.target.value } as Partial<TextLayer>)}><option>left</option><option>center</option><option>right</option></select></span></label>
          <label>Spacing<span className="row"><input className="input" style={{ width: 70 }} type="number" step="0.5" title="Letter spacing" value={layer.letterSpacing} onChange={e => s.upd(layer.id, { letterSpacing: +e.target.value } as Partial<TextLayer>)} /><input className="input" style={{ width: 70 }} type="number" step="0.05" title="Line height" value={layer.lineHeight} onChange={e => s.upd(layer.id, { lineHeight: Math.max(0.6, +e.target.value) } as Partial<TextLayer>)} /></span></label>
          <label>Text bg<span className="row"><input type="color" value={(layer.background ?? "#000000").slice(0, 7)} onChange={e => s.upd(layer.id, { background: e.target.value } as Partial<TextLayer>)} /><button className="btn" onClick={() => s.upd(layer.id, { background: undefined } as Partial<TextLayer>)}>None</button></span></label>
          <label>Bold<input type="checkbox" checked={!!layer.bold} onChange={e => s.upd(layer.id, { bold: e.target.checked } as Partial<TextLayer>)} /></label>
          <label>Auto-fit<span className="row"><input type="checkbox" checked={!!layer.autoFit} onChange={e => s.upd(layer.id, (e.target.checked ? { autoFit: true, fitMax: layer.fontSize, fontSize: fitFontSize({ ...layer, fitMax: layer.fontSize }) } : { autoFit: false }) as Partial<TextLayer>)} /><span className="muted">shrink text to fit the box</span></span></label>
          {warns && <button className="btn" onClick={() => s.upd(layer.id, { fontSize: fitFontSize({ ...layer, fitMax: layer.fontSize }) } as Partial<TextLayer>)}>Shrink to fit now</button>}
          {warns && <div className="warn">⚠ Text doesn’t fit its box. Enlarge the box or reduce the size.</div>}</>}
        {layer.type === "shape" && <><FillEditor f={layer.fill} onChange={f => s.upd(layer.id, { fill: f } as Partial<Layer>)} />{layer.shape === "rect" && <label>Corners<input className="input" type="number" value={layer.cornerRadius ?? 0} onChange={e => s.upd(layer.id, { cornerRadius: Math.max(0, +e.target.value) } as Partial<Layer>)} /></label>}</>}
        {layer.type === "art" && <><label>Pattern<select className="input" value={layer.kind} onChange={e => s.upd(layer.id, { kind: e.target.value } as Partial<Layer>)}>{["rays", "waves", "dots", "confetti", "bokeh"].map(k => <option key={k}>{k}</option>)}</select></label>
          <label>Colours<span className="row"><input type="color" value={layer.color.slice(0, 7)} onChange={e => s.upd(layer.id, { color: e.target.value } as Partial<Layer>)} /><input type="color" value={(layer.color2 ?? layer.color).slice(0, 7)} onChange={e => s.upd(layer.id, { color2: e.target.value } as Partial<Layer>)} /><button className="btn" onClick={() => s.upd(layer.id, { seed: Math.floor(Math.random() * 1e6) } as Partial<Layer>)}>Shuffle</button></span></label></>}
        {layer.type === "image" && <>
          <label>Fit<select className="input" value={layer.fit} onChange={e => s.upd(layer.id, { fit: e.target.value } as Partial<ImageLayer>)}><option value="cover">Crop to fill</option><option value="contain">Fit inside</option></select></label>
          <label>Focus<span className="row"><select className="input" style={{ flex: 1 }} aria-label="Horizontal focus" value={layer.focusX ?? 0.5} onChange={e => s.upd(layer.id, { focusX: +e.target.value } as Partial<ImageLayer>)}><option value={0}>Left</option><option value={0.5}>Centre</option><option value={1}>Right</option></select>
            <select className="input" style={{ flex: 1 }} aria-label="Vertical focus" value={layer.focusY ?? 0.5} onChange={e => s.upd(layer.id, { focusY: +e.target.value } as Partial<ImageLayer>)}><option value={0}>Top</option><option value={0.5}>Middle</option><option value={1}>Bottom</option></select></span></label>
          {(() => { const c = p.assets.find(a => a.id === layer.assetId)?.credit; return c ? <div className="muted">📷 {creditLine(c)}</div> : null; })()}
          <button className="btn" onClick={() => replaceRef.current?.click()}>Replace image…</button><button className="btn" onClick={() => setPicker(true)}>Find stock photo…</button><input ref={replaceRef} type="file" accept="image/*" hidden onChange={e => { pickImage(e.target.files?.[0], true); e.target.value = ""; }} /></>}
        {num("x", "X")}{num("y", "Y")}{num("w", "Width")}{num("h", "Height")}{num("rotation", "Rotate")}
        <label>Opacity<input type="range" min={0} max={1} step={0.05} value={layer.opacity} onChange={e => s.upd(layer.id, { opacity: +e.target.value })} /></label>
        {layer.type !== "text" && <label>Border<span className="row"><input type="color" value={(layer.border?.color ?? "#FFFFFF").slice(0, 7)} onChange={e => s.upd(layer.id, { border: { color: e.target.value, width: layer.border?.width ?? 6 } })} /><input className="input" style={{ width: 70 }} type="number" min={0} value={layer.border?.width ?? 0} onChange={e => s.upd(layer.id, { border: +e.target.value > 0 ? { color: layer.border?.color ?? "#FFFFFF", width: +e.target.value } : undefined })} /></span></label>}
        <label>Shadow<span className="row"><input type="checkbox" checked={!!layer.shadow} onChange={e => s.upd(layer.id, { shadow: e.target.checked ? { dx: 0, dy: 12, blur: 24, color: "#000000aa" } : undefined })} />
          {layer.shadow && <input className="input" style={{ width: 70 }} type="number" title="Blur" value={layer.shadow.blur} onChange={e => s.upd(layer.id, { shadow: { ...layer.shadow!, blur: Math.max(0, +e.target.value) } })} />}</span></label>
        <div className="row" aria-label="Align to canvas">{([["left", "⇤"], ["center", "↔"], ["right", "⇥"], ["top", "⤒"], ["middle", "↕"], ["bottom", "⤓"]] as [Align, string][]).map(([a, i]) => <button key={a} className="btn" title={`Align ${a}`} onClick={() => doAlign(a)}>{i}</button>)}</div>
        <div className="row"><button className="btn" onClick={() => reorderBy(1)}>Forward</button><button className="btn" onClick={() => reorderBy(-1)}>Back</button><button className="btn" onClick={duplicate}>Duplicate</button><button className="btn danger" onClick={s.del}>Delete</button></div>
      </div> : <div style={{ display: "grid", gap: 8, borderTop: "1px solid var(--line)", paddingTop: 8 }}><b>Edit your text</b>{emptyPhoto && <button className="btn gold" onClick={() => fileRef.current?.click()}>📷 Add your photo</button>}<span className="muted">Type here. Or click anything on the design to change its colour, size and position.</span>
        {p.layers.filter((l): l is TextLayer => l.type === "text").map(l => <div key={l.id} style={{ display: "grid", gap: 3 }}><span className="muted">{nice(l.name)}</span><textarea className="input" rows={2} value={l.text} onChange={e => setText(l, e.target.value)} /></div>)}
        {!p.layers.some(l => l.type === "text") && <span className="muted">This design has no text yet. Press ＋ Text at the top.</span>}</div>}
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 8 }}><b>Layers</b>
        {[...p.layers].reverse().map(l => <div key={l.id} className={"layer" + (sel === l.id ? " on" : "")} onClick={() => setSel(l.id)}><span style={{ opacity: l.visible === false ? 0.4 : 1 }}>{l.type === "text" ? "T" : l.type === "image" ? "▣" : l.type === "art" ? "✦" : "◆"} {nice(l.name)}</span>
          <span className="row" style={{ gap: 2 }}><button className="chip" title="Show/hide" onClick={e => { e.stopPropagation(); s.upd(l.id, { visible: l.visible === false }); }}>{l.visible === false ? "show" : "hide"}</button><button className="chip" title="Lock/unlock" onClick={e => { e.stopPropagation(); s.upd(l.id, { locked: !l.locked }); }}>{l.locked ? "unlock" : "lock"}</button></span></div>)}</div>
    </aside>{picker && <PhotoPicker settings={settings} onClose={() => setPicker(false)} onPick={f => { placePhoto(f, f.name, f.credit, layer?.type === "image"); setPicker(false); }} />}</div>;
}
