// AdForge project format. UNITS: all geometry in canvas pixels (design space), origin top-left.
// rotation: degrees clockwise about element center. opacity: 0..1. colors: #RRGGBB or #RRGGBBAA.
// Layers reference assets by ID; file paths are resolved per platform and never stored in the project.
export const SCHEMA_VERSION = 2;
export type ProjectType = "image" | "video";
export interface Fill { kind: "solid" | "gradient"; color?: string; stops?: { offset: number; color: string }[]; angle?: number }
export interface Border { color: string; width: number }
export interface Shadow { dx: number; dy: number; blur: number; color: string }
interface Base { border?: Border; shadow?: Shadow; id: string; name: string; x: number; y: number; w: number; h: number; rotation: number; opacity: number; locked?: boolean; visible?: boolean; startMs?: number; endMs?: number }
export interface TextLayer extends Base { type: "text"; text: string; fontFamily: string; fontSize: number; color: string; align: "left"|"center"|"right"; lineHeight: number; letterSpacing: number; background?: string; autoFit?: boolean; fitMax?: number }
export interface ImageLayer extends Base { type: "image"; assetId: string; fit: "cover"|"contain"; focusX?: number; focusY?: number }
export interface ShapeLayer extends Base { type: "shape"; shape: "rect"|"ellipse"; fill: Fill; cornerRadius?: number }
export type Layer = TextLayer | ImageLayer | ShapeLayer;
export interface AssetRef { id: string; kind: "image"|"video"|"audio"|"font"; mime: string; name: string; bytes?: number }
export interface Project {
  schemaVersion: number; id: string; type: ProjectType; name: string;
  canvas: { width: number; height: number; background: Fill };
  brandKitId?: string; layers: Layer[]; assets: AssetRef[];
  createdAt: string; updatedAt: string;
}
