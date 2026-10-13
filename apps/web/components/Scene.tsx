"use client";
import { useId, type ReactNode, type Ref, type PointerEvent as RPE } from "react";
import { ILLUSTRATIONS, resolvePaint, type ArtLayer, type Fill, type IlloLayer, type Layer, type Project, type ShapeLayer } from "@adforge/creative-schema";
import { wrapLines } from "../lib/text";
import type { Assets } from "../lib/store";

const stopOf = (c: string) => (/^#[0-9a-f]{8}$/i.test(c) ? { c: c.slice(0, 7), o: parseInt(c.slice(7, 9), 16) / 255 } : { c, o: 1 });
function paint(f: Fill, id: string, defs: ReactNode[]): string {
  if (f.kind === "gradient" && f.stops && f.stops.length >= 2) { const t = ((f.angle ?? 90) * Math.PI) / 180, dx = Math.sin(t), dy = -Math.cos(t);
    defs.push(<linearGradient key={id} id={id} x1={0.5 - dx / 2} y1={0.5 - dy / 2} x2={0.5 + dx / 2} y2={0.5 + dy / 2}>{f.stops.map((s, i) => { const k = stopOf(s.color); return <stop key={i} offset={s.offset} stopColor={k.c} stopOpacity={k.o} />; })}</linearGradient>);
    return `url(#${id})`; }
  return f.color ?? f.stops?.[0]?.color ?? "#000000";
}
const rng = (seed: number) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
function art(l: ArtLayer): ReactNode {
  const { w, h } = l, r = rng(l.seed), c2 = l.color2 ?? l.color, m = Math.min(w, h), out: ReactNode[] = [];
  if (l.kind === "rays") { const cx = (l.cx ?? 0.5) * w, cy = (l.cy ?? 0.5) * h, R = Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy)) * 1.06, N = 24;
    for (let i = 0; i < N; i += 2) { const a0 = (i * 2 * Math.PI) / N, a1 = ((i + 1) * 2 * Math.PI) / N; out.push(<polygon key={i} points={`${cx},${cy} ${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} ${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)}`} fill={l.color} />); } }
  else if (l.kind === "waves") { for (let k = 0; k < 3; k++) { const y = h * (0.12 + 0.24 * k), a = h * 0.07;
    out.push(<path key={k} d={`M0 ${y} C ${w * 0.2} ${y - a}, ${w * 0.35} ${y - a}, ${w * 0.5} ${y} S ${w * 0.8} ${y + a}, ${w} ${y - a * 0.5} L ${w} ${h} L 0 ${h} Z`} fill={k % 2 ? c2 : l.color} opacity={0.45 + 0.27 * k} />); } }
  else if (l.kind === "dots") { const sp = m / 9; for (let y = sp / 2; y < h; y += sp) for (let x = sp / 2 + ((Math.round(y / sp) % 2) * sp) / 2; x < w; x += sp) out.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={sp * 0.11} fill={l.color} />); }
  else if (l.kind === "confetti") { const cols = [l.color, c2, "#FFFFFF"], sp = m / 40; for (let i = 0; i < 46; i++) { const x = r() * w, y = r() * h, col = cols[i % 3], s2 = sp * (1.5 + r() * 2.2);
    out.push(i % 3 === 1 ? <circle key={i} cx={x} cy={y} r={s2 * 0.6} fill={col} /> : <rect key={i} x={x} y={y} width={s2 * 1.6} height={s2 * 0.7} fill={col} transform={`rotate(${Math.round(r() * 180)} ${x} ${y})`} />); } }
  else { for (let i = 0; i < 14; i++) out.push(<circle key={i} cx={r() * w} cy={r() * h} r={m * (0.03 + r() * 0.1)} fill={i % 2 ? c2 : l.color} opacity={0.12 + r() * 0.22} />); }
  return out;
}
function illo(l: IlloLayer, pid: string, defs: ReactNode[]): ReactNode {
  const prims = ILLUSTRATIONS[l.kind]; if (!prims) return null; const k = Math.min(l.w, l.h) / 100, ox = l.x + (l.w - 100 * k) / 2, oy = l.y + (l.h - 100 * k) / 2, col = l.colors ?? {};
  const fillOf = (spec: string, id: string): { fill: string; fo?: number } => { const r = resolvePaint(spec, col); if (!r || r.none) return { fill: "none" };
    if (r.grad) { defs.push(<linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={r.grad[0]} /><stop offset="1" stopColor={r.grad[1]} /></linearGradient>); return { fill: `url(#${id})` }; } return { fill: r.color!, fo: r.opacity }; };
  return <g transform={`translate(${ox} ${oy}) scale(${k})`}>{prims.map((p, i) => { const f = fillOf(p.f, `${pid}i${l.id}${i}`), o = (p.o ?? 1) * (f.fo ?? 1), st = "s" in p && p.s ? resolvePaint(p.s, col) : null, sp = st?.color ? { stroke: st.color, strokeWidth: ("sw" in p && p.sw) || 1, strokeLinecap: "round" as const, strokeLinejoin: "round" as const } : {}, common = { fill: f.fill, opacity: o, ...sp };
    if (p.t === "rect") return <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.r ?? 0} {...common} />; if (p.t === "circle") return <circle key={i} cx={p.x} cy={p.y} r={p.r} {...common} />;
    if (p.t === "ellipse") return <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} transform={p.rot ? `rotate(${p.rot} ${p.x} ${p.y})` : undefined} {...common} />; return <path key={i} d={p.d} {...common} />; })}</g>;
}
const burstPath = (l: ShapeLayer) => { const n = l.points ?? 14, cx = l.x + l.w / 2, cy = l.y + l.h / 2, R = Math.min(l.w, l.h) / 2, r = R * 0.84; let d = "";
  for (let i = 0; i < n * 2; i++) { const a = (i * Math.PI) / n - Math.PI / 2, rad = i % 2 ? r : R; d += `${i ? "L" : "M"}${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)} `; } return d + "Z"; };
const pos = (v: number | undefined, a: string, b: string, c: string) => (v === undefined ? b : v < 0.34 ? a : v > 0.66 ? c : b);
interface Props { project: Project; assets: Assets; svgRef?: Ref<SVGSVGElement>; onLayerDown?: (e: RPE, l: Layer) => void; onBackgroundDown?: (e: RPE) => void; onMove?: (e: RPE) => void; onUp?: (e: RPE) => void; overlay?: ReactNode; style?: React.CSSProperties }
export function Scene({ project: p, assets, svgRef, onLayerDown, onBackgroundDown, onMove, onUp, overlay, style }: Props) {
  const pid = useId().replace(/:/g, ""), defs: ReactNode[] = [], W = p.canvas.width, H = p.canvas.height;
  const bg = paint(p.canvas.background, `${pid}bg`, defs);
  const nodes = p.layers.filter(l => l.visible !== false).map(l => {
    const cx = l.x + l.w / 2, cy = l.y + l.h / 2, sw = l.border?.width ?? 0, stroke = l.border ? { stroke: l.border.color, strokeWidth: sw } : {};
    let filter: string | undefined;
    if (l.shadow) { const fid = `${pid}sh${l.id}`; defs.push(<filter key={fid} id={fid} x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx={l.shadow.dx} dy={l.shadow.dy} stdDeviation={Math.max(0, l.shadow.blur) / 2} floodColor={stopOf(l.shadow.color).c} floodOpacity={stopOf(l.shadow.color).o} /></filter>); filter = `url(#${fid})`; }
    let body: ReactNode = null;
    if (l.type === "shape") { const fill = paint(l.fill, `${pid}f${l.id}`, defs);
      body = l.shape === "burst" ? <path d={burstPath(l)} fill={fill} {...stroke} /> : l.shape === "rect" ? <rect x={l.x} y={l.y} width={l.w} height={l.h} rx={l.cornerRadius ?? 0} fill={fill} {...stroke} /> : <ellipse cx={cx} cy={cy} rx={l.w / 2} ry={l.h / 2} fill={fill} {...stroke} />; }
    else if (l.type === "illo") body = illo(l, pid, defs);
    else if (l.type === "art") { const aid = `${pid}a${l.id}`; defs.push(<clipPath key={aid} id={aid}><rect x={l.x} y={l.y} width={l.w} height={l.h} /></clipPath>); body = <g clipPath={`url(#${aid})`}><g transform={`translate(${l.x} ${l.y})`}>{art(l)}</g></g>; }
    else if (l.type === "image") { const src = assets[l.assetId], rad = l.radius ?? 0, cid = `${pid}c${l.id}`;
      defs.push(<clipPath key={cid} id={cid}><rect x={l.x} y={l.y} width={l.w} height={l.h} rx={rad} /></clipPath>);
      const frame = l.border ? <rect x={l.x} y={l.y} width={l.w} height={l.h} rx={rad} fill="none" {...stroke} /> : null;
      if (src) body = <><g clipPath={`url(#${cid})`}><image x={l.x} y={l.y} width={l.w} height={l.h} href={src} preserveAspectRatio={`x${pos(l.focusX, "Min", "Mid", "Max")}Y${pos(l.focusY, "Min", "Mid", "Max")} ${l.fit === "cover" ? "slice" : "meet"}`} /></g>{frame}</>;
      else { const gid = `${pid}ph${l.id}`, k = Math.min(l.w, l.h);
        defs.push(<linearGradient key={gid} id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4C3A8E" /><stop offset="0.6" stopColor="#E0705A" /><stop offset="1" stopColor="#F5B461" /></linearGradient>);
        body = <><g clipPath={`url(#${cid})`}><g transform={`translate(${l.x} ${l.y})`}><rect width={l.w} height={l.h} fill={`url(#${gid})`} /><circle cx={l.w * 0.68} cy={l.h * 0.42} r={k * 0.14} fill="#FFE9A8" opacity="0.95" />
          <path d={`M0 ${l.h * 0.78} Q ${l.w * 0.25} ${l.h * 0.58} ${l.w * 0.5} ${l.h * 0.76} T ${l.w} ${l.h * 0.7} L ${l.w} ${l.h} L 0 ${l.h} Z`} fill="#2B1B4F" opacity="0.85" /><path d={`M0 ${l.h * 0.9} Q ${l.w * 0.3} ${l.h * 0.74} ${l.w * 0.6} ${l.h * 0.88} T ${l.w} ${l.h * 0.84} L ${l.w} ${l.h} L 0 ${l.h} Z`} fill="#150D2B" />
          <text x={l.w / 2} y={l.h * 0.2} textAnchor="middle" fontSize={k * 0.075} fill="#FFFFFF" fontFamily="Arial, sans-serif" opacity="0.9">📷 Your photo goes here</text></g></g>{frame}</>; } }
    else { const lines = wrapLines(l.text, l.w, l.fontSize, l.bold ? "@b " + l.fontFamily : l.fontFamily, l.letterSpacing), ax = l.align === "left" ? l.x : l.align === "center" ? cx : l.x + l.w;
      body = <>{l.background && <rect x={l.x} y={l.y} width={l.w} height={l.h} fill={l.background} />}<text fontFamily={l.fontFamily} fontWeight={l.bold ? 700 : 400} fontSize={l.fontSize} fill={l.color} textAnchor={l.align === "left" ? "start" : l.align === "center" ? "middle" : "end"} letterSpacing={l.letterSpacing}>
        {lines.map((s, i) => <tspan key={i} x={ax} y={l.y + l.fontSize + i * l.fontSize * l.lineHeight}>{s || "\u00A0"}</tspan>)}</text></>; }
    return <g key={l.id} transform={`rotate(${l.rotation} ${cx} ${cy})`} opacity={l.opacity} filter={filter} onPointerDown={onLayerDown ? e => onLayerDown(e, l) : undefined} style={onLayerDown ? { cursor: l.locked ? "default" : "move" } : undefined}>
      {body}{onLayerDown && <rect x={l.x} y={l.y} width={l.w} height={l.h} fill="transparent" />}</g>; });
  return <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} style={{ aspectRatio: `${W}/${H}`, ...style }} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
    <defs>{defs}</defs><rect className="bg" width={W} height={H} fill={bg} onPointerDown={onBackgroundDown} />{nodes}{overlay}</svg>;
}
