"use client";
import { useEffect, useRef, useState } from "react";
import { validateProject, migrate, resizeLayers, estimateTextOverflow, reorder, type Layer, type Project, type TextLayer } from "@adforge/creative-schema";
import { init, commit, replace, checkpoint, undo, redo } from "../lib/history";
import { idbGet, idbPut } from "../lib/idb";
import { sampleProject, uid } from "../lib/sample";

const SIZES: Record<string, [number, number]> = { "Square 1080×1080": [1080, 1080], "Story 1080×1920": [1080, 1920], "Banner 1920×1080": [1920, 1080] };
const btn: React.CSSProperties = { background: "#1B2347", color: "#E5E7EB", border: "1px solid #2E3A6B", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 13 };
const prim: React.CSSProperties = { ...btn, background: "#7C3AED", borderColor: "#7C3AED" };

export default function Studio() {
  const [h, setH] = useState(() => init(sampleProject()));
  const [sel, setSel] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [loaded, setLoaded] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number; k: number } | null>(null);
  const p = h.present, layer = p.layers.find(l => l.id === sel) ?? null;

  useEffect(() => { idbGet<unknown>("draft").then(d => { if (d) { try { const r = validateProject(migrate(d)); if (r.ok) { setH(init(r.project)); setMsg("Draft recovered"); } } catch {} } }).finally(() => setLoaded(true)); }, []);
  useEffect(() => { if (!loaded) return; const t = setTimeout(() => { idbPut("draft", p).catch(() => setMsg("Autosave failed")); }, 500); return () => clearTimeout(t); }, [p, loaded]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); setH(x => e.shiftKey ? redo(x) : undo(x)); }
    if ((e.key === "Delete" || e.key === "Backspace") && sel && !(e.target instanceof HTMLInputElement)) del(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); });

  const set = (next: Project) => setH(x => commit(x, { ...next, updatedAt: new Date().toISOString() }));
  const upd = (id: string, patch: Partial<Layer>) => set({ ...p, layers: p.layers.map(l => l.id === id ? ({ ...l, ...patch } as Layer) : l) });
  const add = (l: Layer) => { set({ ...p, layers: [...p.layers, l] }); setSel(l.id); };
  const del = () => { if (sel) { set({ ...p, layers: p.layers.filter(l => l.id !== sel) }); setSel(null); } };
  const base = { rotation: 0, opacity: 1 };
  const addText = () => add({ ...base, id: uid(), name: "Text", type: "text", text: "New text", x: 100, y: 100, w: 600, h: 120, fontFamily: "Inter, Arial, sans-serif", fontSize: 64, color: "#FFFFFF", align: "left", lineHeight: 1.2, letterSpacing: 0 });
  const addShape = (shape: "rect" | "ellipse") => add({ ...base, id: uid(), name: shape, type: "shape", shape, x: 200, y: 200, w: 300, h: 300, fill: { kind: "solid", color: "#22D3EE" } });
  const resize = (key: string) => { const [w, hh] = SIZES[key]; set({ ...p, canvas: { ...p.canvas, width: w, height: hh }, layers: resizeLayers(p.layers, p.canvas, { width: w, height: hh }) }); };

  const down = (e: React.PointerEvent, l: Layer) => {
    e.stopPropagation(); setSel(l.id); const r = svgRef.current!.getBoundingClientRect();
    drag.current = { id: l.id, sx: e.clientX, sy: e.clientY, ox: l.x, oy: l.y, k: p.canvas.width / r.width }; setH(checkpoint); (e.target as Element).setPointerCapture(e.pointerId); };
  const move = (e: React.PointerEvent) => { const d = drag.current; if (!d) return;
    setH(x => replace(x, { ...x.present, layers: x.present.layers.map(l => l.id === d.id ? { ...l, x: d.ox + (e.clientX - d.sx) * d.k, y: d.oy + (e.clientY - d.sy) * d.k } : l) })); };

  async function exportImage(fmt: "png" | "jpeg") {
    try { setMsg("Exporting…"); const svg = svgRef.current!.cloneNode(true) as SVGSVGElement; svg.querySelectorAll(".ui").forEach(n => n.remove());
      svg.setAttribute("width", String(p.canvas.width)); svg.setAttribute("height", String(p.canvas.height)); svg.removeAttribute("style");
      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" }));
      const img = new Image(); await new Promise((ok, no) => { img.onload = ok; img.onerror = () => no(new Error("render failed")); img.src = url; });
      const c = document.createElement("canvas"); c.width = p.canvas.width; c.height = p.canvas.height; const g = c.getContext("2d")!;
      if (fmt === "jpeg") { g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); } g.drawImage(img, 0, 0); URL.revokeObjectURL(url);
      const blob = await new Promise<Blob | null>(r => c.toBlob(r, `image/${fmt}`, 0.95)); if (!blob) throw new Error("encode failed");
      save(blob, `${p.name}.${fmt === "jpeg" ? "jpg" : "png"}`); setMsg(`Exported ${c.width}×${c.height} ${fmt.toUpperCase()}`);
    } catch (e) { setMsg("Export failed: " + (e as Error).message); } }
  const save = (b: Blob, name: string) => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
  const importFile = async (f?: File) => { if (!f) return; try { const r = validateProject(migrate(JSON.parse(await f.text())));
    if (r.ok) { setH(x => commit(x, r.project)); setSel(null); setMsg("Project imported"); } else setMsg("Invalid project: " + r.issues[0].path + " " + r.issues[0].message); } catch (e) { setMsg("Import failed: " + (e as Error).message); } };

  const fillOf = (f: Project["canvas"]["background"]) => f.color ?? "#000";
  const warn = (l: Layer) => l.type === "text" && estimateTextOverflow(l);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", height: "100vh" }}>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", gap: 8, padding: 10, flexWrap: "wrap", borderBottom: "1px solid #1B2347", alignItems: "center" }}>
          <b style={{ color: "#D4AF37", marginRight: 8 }}>AdForge</b>
          <button style={btn} onClick={addText}>+ Text</button><button style={btn} onClick={() => addShape("rect")}>+ Rect</button><button style={btn} onClick={() => addShape("ellipse")}>+ Ellipse</button>
          <button style={btn} disabled={!h.past.length} onClick={() => setH(undo)}>Undo</button><button style={btn} disabled={!h.future.length} onClick={() => setH(redo)}>Redo</button>
          <select style={btn} value="" onChange={e => e.target.value && resize(e.target.value)}><option value="">Resize…</option>{Object.keys(SIZES).map(k => <option key={k}>{k}</option>)}</select>
          <button style={prim} onClick={() => exportImage("png")}>Export PNG</button><button style={btn} onClick={() => exportImage("jpeg")}>Export JPG</button>
          <button style={btn} onClick={() => save(new Blob([JSON.stringify(p, null, 2)], { type: "application/json" }), `${p.name}.adforge.json`)}>Save project</button>
          <label style={btn}>Open project<input type="file" accept=".json" hidden onChange={e => importFile(e.target.files?.[0])} /></label>
          <button style={btn} onClick={() => { setH(init(sampleProject())); setSel(null); }}>New</button>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>{msg}</span>
        </div>
        <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 16, overflow: "auto" }} onPointerDown={() => setSel(null)}>
          <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${p.canvas.width} ${p.canvas.height}`} style={{ maxWidth: "100%", maxHeight: "calc(100vh - 90px)", aspectRatio: `${p.canvas.width}/${p.canvas.height}`, boxShadow: "0 8px 40px #0008" }} onPointerMove={move} onPointerUp={() => (drag.current = null)}>
            <rect width={p.canvas.width} height={p.canvas.height} fill={fillOf(p.canvas.background)} />
            {p.layers.filter(l => l.visible !== false).map(l => { const cx = l.x + l.w / 2, cy = l.y + l.h / 2; return (
              <g key={l.id} transform={`rotate(${l.rotation} ${cx} ${cy})`} opacity={l.opacity} onPointerDown={e => down(e, l)} style={{ cursor: "move" }}>
                {l.type === "shape" && (l.shape === "rect" ? <rect x={l.x} y={l.y} width={l.w} height={l.h} rx={l.cornerRadius ?? 0} fill={fillOf(l.fill)} /> : <ellipse cx={cx} cy={cy} rx={l.w / 2} ry={l.h / 2} fill={fillOf(l.fill)} />)}
                {l.type === "text" && <><rect x={l.x} y={l.y} width={l.w} height={l.h} fill="transparent" /><text x={l.align === "left" ? l.x : l.align === "center" ? cx : l.x + l.w} y={l.y + l.fontSize} fontFamily={l.fontFamily} fontSize={l.fontSize} fill={l.color} textAnchor={l.align === "left" ? "start" : l.align === "center" ? "middle" : "end"} letterSpacing={l.letterSpacing}>{l.text}</text></>}
                {l.type === "image" && <rect x={l.x} y={l.y} width={l.w} height={l.h} fill="#444" />}
                {sel === l.id && <rect className="ui" x={l.x} y={l.y} width={l.w} height={l.h} fill="none" stroke={warn(l) ? "#F59E0B" : "#22D3EE"} strokeWidth={p.canvas.width / 400} strokeDasharray="8 6" pointerEvents="none" />}
              </g>); })}
          </svg>
        </div>
      </div>
      <aside style={{ borderLeft: "1px solid #1B2347", padding: 12, overflow: "auto", fontSize: 13 }}>
        <input value={p.name} onChange={e => set({ ...p, name: e.target.value })} style={{ ...btn, width: "100%", boxSizing: "border-box", marginBottom: 8 }} aria-label="Project name" />
        <div style={{ color: "#9CA3AF", marginBottom: 12 }}>{p.canvas.width}×{p.canvas.height}px · autosaved locally</div>
        {layer ? <div style={{ display: "grid", gap: 8 }}>
          <b>{layer.name}</b>
          {layer.type === "text" && <><textarea value={layer.text} onChange={e => upd(layer.id, { text: e.target.value } as Partial<TextLayer>)} rows={3} style={{ ...btn, resize: "vertical" }} />
            <label>Size <input type="number" value={Math.round(layer.fontSize)} onChange={e => upd(layer.id, { fontSize: Math.max(1, +e.target.value) } as Partial<TextLayer>)} style={{ ...btn, width: 70 }} /></label>
            <label>Colour <input type="color" value={layer.color.slice(0, 7)} onChange={e => upd(layer.id, { color: e.target.value } as Partial<TextLayer>)} /></label>
            <label>Align <select style={btn} value={layer.align} onChange={e => upd(layer.id, { align: e.target.value } as Partial<TextLayer>)}><option>left</option><option>center</option><option>right</option></select></label>
            {warn(layer) && <div style={{ color: "#F59E0B" }}>⚠ Text may not fit its box. Enlarge the box or reduce the size. (Text does not auto-wrap yet.)</div>}</>}
          {layer.type === "shape" && <label>Fill <input type="color" value={(layer.fill.color ?? "#000000").slice(0, 7)} onChange={e => upd(layer.id, { fill: { kind: "solid", color: e.target.value } } as Partial<Layer>)} /></label>}
          {(["x", "y", "w", "h", "rotation"] as const).map(k => <label key={k}>{k} <input type="number" value={Math.round(layer[k])} onChange={e => upd(layer.id, { [k]: +e.target.value })} style={{ ...btn, width: 80 }} /></label>)}
          <label>Opacity <input type="range" min={0} max={1} step={0.05} value={layer.opacity} onChange={e => upd(layer.id, { opacity: +e.target.value })} /></label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button style={btn} onClick={() => { const i = p.layers.findIndex(l => l.id === layer.id); set({ ...p, layers: reorder(p.layers, layer.id, i + 1) }); }}>Forward</button>
            <button style={btn} onClick={() => { const i = p.layers.findIndex(l => l.id === layer.id); set({ ...p, layers: reorder(p.layers, layer.id, i - 1) }); }}>Back</button>
            <button style={btn} onClick={() => add({ ...layer, id: uid(), name: layer.name + " copy", x: layer.x + 30, y: layer.y + 30 })}>Duplicate</button>
            <button style={{ ...btn, borderColor: "#B91C1C" }} onClick={del}>Delete</button></div>
        </div> : <div style={{ color: "#9CA3AF" }}>Select a layer to edit it. Drag layers on the canvas to move them.</div>}
        <hr style={{ borderColor: "#1B2347", margin: "16px 0" }} /><b>Layers</b>
        {[...p.layers].reverse().map(l => <div key={l.id} onClick={() => setSel(l.id)} style={{ padding: "4px 6px", cursor: "pointer", background: sel === l.id ? "#1B2347" : "none", borderRadius: 4 }}>{l.type === "text" ? "T" : "▢"} {l.name}</div>)}
      </aside>
    </div>);
}
