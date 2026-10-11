"use client";
import { useId, type ReactNode, type Ref, type PointerEvent as RPE } from "react";
import type { Fill, Layer, Project } from "@adforge/creative-schema";
import { wrapLines } from "../lib/text";
import type { Assets } from "../lib/store";

function paint(f: Fill, id: string, defs: ReactNode[]): string {
  if (f.kind === "gradient" && f.stops && f.stops.length >= 2) { const t = ((f.angle ?? 90) * Math.PI) / 180, dx = Math.sin(t), dy = -Math.cos(t);
    defs.push(<linearGradient key={id} id={id} x1={0.5 - dx / 2} y1={0.5 - dy / 2} x2={0.5 + dx / 2} y2={0.5 + dy / 2}>{f.stops.map((s, i) => <stop key={i} offset={s.offset} stopColor={s.color} />)}</linearGradient>);
    return `url(#${id})`; }
  return f.color ?? f.stops?.[0]?.color ?? "#000000";
}
const pos = (v: number | undefined, a: string, b: string, c: string) => (v === undefined ? b : v < 0.34 ? a : v > 0.66 ? c : b);
interface Props { project: Project; assets: Assets; svgRef?: Ref<SVGSVGElement>; onLayerDown?: (e: RPE, l: Layer) => void; onBackgroundDown?: (e: RPE) => void; onMove?: (e: RPE) => void; onUp?: (e: RPE) => void; overlay?: ReactNode; style?: React.CSSProperties }
export function Scene({ project: p, assets, svgRef, onLayerDown, onBackgroundDown, onMove, onUp, overlay, style }: Props) {
  const pid = useId().replace(/:/g, ""), defs: ReactNode[] = [], W = p.canvas.width, H = p.canvas.height;
  const bg = paint(p.canvas.background, `${pid}bg`, defs);
  const nodes = p.layers.filter(l => l.visible !== false).map(l => {
    const cx = l.x + l.w / 2, cy = l.y + l.h / 2, sw = l.border?.width ?? 0, stroke = l.border ? { stroke: l.border.color, strokeWidth: sw } : {};
    let filter: string | undefined;
    if (l.shadow) { const fid = `${pid}sh${l.id}`; defs.push(<filter key={fid} id={fid} x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx={l.shadow.dx} dy={l.shadow.dy} stdDeviation={Math.max(0, l.shadow.blur) / 2} floodColor={l.shadow.color} /></filter>); filter = `url(#${fid})`; }
    let body: ReactNode = null;
    if (l.type === "shape") { const fill = paint(l.fill, `${pid}f${l.id}`, defs);
      body = l.shape === "rect" ? <rect x={l.x} y={l.y} width={l.w} height={l.h} rx={l.cornerRadius ?? 0} fill={fill} {...stroke} /> : <ellipse cx={cx} cy={cy} rx={l.w / 2} ry={l.h / 2} fill={fill} {...stroke} />; }
    else if (l.type === "image") { const src = assets[l.assetId];
      body = src ? <><svg x={l.x} y={l.y} width={l.w} height={l.h} overflow="hidden"><image href={src} width="100%" height="100%" preserveAspectRatio={`x${pos(l.focusX, "Min", "Mid", "Max")}Y${pos(l.focusY, "Min", "Mid", "Max")} ${l.fit === "cover" ? "slice" : "meet"}`} /></svg>{l.border && <rect x={l.x} y={l.y} width={l.w} height={l.h} fill="none" {...stroke} />}</>
        : <><rect x={l.x} y={l.y} width={l.w} height={l.h} fill="#2A3358" {...stroke} /><text x={cx} y={cy} textAnchor="middle" fill="#9CA3AF" fontSize={Math.min(l.w, l.h) / 8} fontFamily="Arial, sans-serif">Image placeholder</text></>; }
    else { const lines = wrapLines(l.text, l.w, l.fontSize, l.fontFamily, l.letterSpacing), ax = l.align === "left" ? l.x : l.align === "center" ? cx : l.x + l.w;
      body = <>{l.background && <rect x={l.x} y={l.y} width={l.w} height={l.h} fill={l.background} />}<text fontFamily={l.fontFamily} fontSize={l.fontSize} fill={l.color} textAnchor={l.align === "left" ? "start" : l.align === "center" ? "middle" : "end"} letterSpacing={l.letterSpacing}>
        {lines.map((s, i) => <tspan key={i} x={ax} y={l.y + l.fontSize + i * l.fontSize * l.lineHeight}>{s || "\u00A0"}</tspan>)}</text></>; }
    return <g key={l.id} transform={`rotate(${l.rotation} ${cx} ${cy})`} opacity={l.opacity} filter={filter} onPointerDown={onLayerDown ? e => onLayerDown(e, l) : undefined} style={onLayerDown ? { cursor: l.locked ? "default" : "move" } : undefined}>
      {body}{onLayerDown && <rect x={l.x} y={l.y} width={l.w} height={l.h} fill="transparent" />}</g>; });
  return <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} style={{ aspectRatio: `${W}/${H}`, ...style }} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
    <defs>{defs}</defs><rect className="bg" width={W} height={H} fill={bg} onPointerDown={onBackgroundDown} />{nodes}{overlay}</svg>;
}
