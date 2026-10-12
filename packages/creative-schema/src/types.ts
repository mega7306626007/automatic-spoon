// AdForge project format. UNITS: all geometry in canvas pixels (design space), origin top-left.
// rotation: degrees clockwise about element center. opacity: 0..1. colors: #RRGGBB or #RRGGBBAA.
// Layers reference assets by ID; file paths are resolved per platform and never stored in the project.
export const SCHEMA_VERSION = 2;
export type ProjectType = "image" | "video";
export interface Fill { kind: "solid" | "gradient"; color?: string; stops?: { offset: number; color: string }[]; angle?: number }
export interface Border { color: string; width: number }
export interface Shadow { dx: number; dy: number; blur: number; color: string }
interface Base { border?: Border; shadow?: Shadow; id: string; name: string; x: number; y: number; w: number; h: number; rotation: number; opacity: number; locked?: boolean; visible?: boolean; startMs?: number; endMs?: number }
export interface TextLayer extends Base { bold?: boolean; type: "text"; text: string; fontFamily: string; fontSize: number; color: string; align: "left"|"center"|"right"; lineHeight: number; letterSpacing: number; background?: string; autoFit?: boolean; fitMax?: number }
export interface ImageLayer extends Base { radius?: number; type: "image"; assetId: string; fit: "cover"|"contain"; focusX?: number; focusY?: number }
export type ArtKind = "rays" | "waves" | "dots" | "confetti" | "bokeh";
export const ART_KINDS: ArtKind[] = ["rays", "waves", "dots", "confetti", "bokeh"];
export interface ArtLayer extends Base { type: "art"; kind: ArtKind; color: string; color2?: string; seed: number; cx?: number; cy?: number }
export interface ShapeLayer extends Base { type: "shape"; shape: "rect"|"ellipse"|"burst"; points?: number; fill: Fill; cornerRadius?: number }
export type Layer = TextLayer | ImageLayer | ShapeLayer | ArtLayer;
export interface Palette { bg: string; primary: string; secondary: string; text: string; gold: string }
/** Design-system info for template-built ads, so a design can be re-laid out (resize, mood change, brand kit). */
export interface ProjectMeta { templateId?: string; style: string; emotion: string; emojis: string[]; palette: Palette; art: ArtKind; needsPhoto: boolean; font?: string }
export interface AssetRef { id: string; kind: "image"|"video"|"audio"|"font"; mime: string; name: string; bytes?: number }
export interface Project {
  schemaVersion: number; id: string; type: ProjectType; name: string;
  canvas: { width: number; height: number; background: Fill };
  brandKitId?: string; layers: Layer[]; assets: AssetRef[];
  createdAt: string; updatedAt: string; meta?: ProjectMeta;
}
