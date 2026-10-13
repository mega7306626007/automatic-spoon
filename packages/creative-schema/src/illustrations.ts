// Original flat-vector product illustrations drawn on a 100x100 canvas. Colour specs: "#RRGGBB[AA]", brand tokens
// c1..c4 (+ d = darker, l = lighter), "none", or a vertical gradient "g:TOP:BOTTOM". Platform renderers draw these primitives.
export type Prim =
  | { t: "rect"; x: number; y: number; w: number; h: number; r?: number; f: string; o?: number }
  | { t: "circle"; x: number; y: number; r: number; f: string; o?: number; s?: string; sw?: number }
  | { t: "ellipse"; x: number; y: number; rx: number; ry: number; f: string; o?: number; rot?: number }
  | { t: "path"; d: string; f: string; o?: number; s?: string; sw?: number };
export type IlloColors = Partial<Record<"c1" | "c2" | "c3" | "c4", string>>;
const R = (x: number, y: number, w: number, h: number, f: string, r = 0, o?: number): Prim => ({ t: "rect", x, y, w, h, f, r, ...(o === undefined ? {} : { o }) });
const C = (x: number, y: number, r: number, f: string, o?: number): Prim => ({ t: "circle", x, y, r, f, ...(o === undefined ? {} : { o }) });
const Cs = (x: number, y: number, r: number, s: string, sw: number): Prim => ({ t: "circle", x, y, r, f: "none", s, sw });
const E = (x: number, y: number, rx: number, ry: number, f: string, o?: number, rot?: number): Prim => ({ t: "ellipse", x, y, rx, ry, f, ...(o === undefined ? {} : { o }), ...(rot === undefined ? {} : { rot }) });
const P = (d: string, f: string, o?: number): Prim => ({ t: "path", d, f, ...(o === undefined ? {} : { o }) });
const S = (d: string, s: string, sw: number, o?: number): Prim => ({ t: "path", d, f: "none", s, sw, ...(o === undefined ? {} : { o }) });
const SH = E(50, 91, 36, 4.5, "#000000", 0.28);
export const ILLUSTRATIONS: Record<string, Prim[]> = {
  bread: [SH, P("M12 62 C12 38 30 24 50 24 C70 24 88 38 88 62 C88 78 74 86 50 86 C26 86 12 78 12 62 Z", "g:#EDAE62:#B8692A"), P("M16 66 C20 80 34 86 50 86 C66 86 80 80 84 66 C74 76 60 78 50 78 C38 78 24 76 16 66 Z", "#8F4F1E", 0.35),
    S("M28 47 Q36 35 44 49", "#F7DDB0", 4.5), S("M45 43 Q53 31 61 45", "#F7DDB0", 4.5), S("M62 49 Q69 39 76 51", "#F7DDB0", 4.5), E(40, 34, 17, 5, "#FFFFFF", 0.22, -15)],
  burger: [SH, R(14, 68, 72, 15, "g:#E8A75C:#C27A33", 7), R(10, 58, 80, 12, "#5A3420", 6), P("M12 57 L88 57 L80 67 L70 59 L58 69 L46 59 L30 67 Z", "#F7C531"), P("M10 52 Q18 44 26 52 T42 52 T58 52 T74 52 T90 52 L90 58 L10 58 Z", "#6CBF4B"), R(16, 47, 68, 6, "#E5493A", 3),
    P("M12 47 C12 22 30 14 50 14 C70 14 88 22 88 47 Z", "g:#F2B768:#D58A3C"), E(34, 29, 3, 1.6, "#FFF3D6", undefined, -20), E(50, 22, 3, 1.6, "#FFF3D6"), E(66, 29, 3, 1.6, "#FFF3D6", undefined, 20), E(42, 37, 3, 1.6, "#FFF3D6", undefined, 10), E(58, 37, 3, 1.6, "#FFF3D6", undefined, -10), E(36, 26, 13, 4, "#FFFFFF", 0.25, -20)],
  coffee: [E(50, 91, 38, 4.5, "#000000", 0.25), E(50, 85, 40, 7, "g:#FFFFFF:#CBD0D8"), S("M77 42 Q95 42 92 58 Q89 71 72 68", "#D6DAE2", 6), P("M22 36 L78 36 L72 76 Q71 84 63 84 L37 84 Q29 84 28 76 Z", "g:#FFFFFF:#DDE1E8"), E(50, 36, 28, 6, "#4A2C1C"), E(50, 36, 22, 4, "#B98B65"),
    P("M26.2 52 L73.8 52 L72.6 62 L27.4 62 Z", "c1"), S("M41 28 Q37 20 42 14 Q46 8 42 3", "#FFFFFF", 3, 0.55), S("M56 28 Q52 20 57 14 Q61 8 57 3", "#FFFFFF", 3, 0.55)],
  bag: [SH, S("M36 30 Q36 10 50 10 Q64 10 64 30", "c3", 4), P("M20 28 L80 28 L85 86 L15 86 Z", "g:c1l:c1d"), P("M70 28 L80 28 L85 86 L70 86 Z", "#000000", 0.14), R(20, 28, 60, 4, "#FFFFFF", 0, 0.28), C(50, 58, 12, "#FFFFFF", 0.92), C(50, 58, 6, "c1")],
  shirt: [SH, P("M32 16 L16 26 L6 46 L22 54 L28 46 L28 86 L72 86 L72 46 L78 54 L94 46 L84 26 L68 16 Q60 28 50 28 Q40 28 32 16 Z", "g:c1l:c1d"), S("M32 16 Q40 30 50 30 Q60 30 68 16", "c1d", 3.5), R(28, 58, 44, 6, "#FFFFFF", 0, 0.35), P("M28 46 L22 54 L6 46 L16 26 L32 16 Z", "#000000", 0.1), E(40, 40, 14, 3, "#FFFFFF", 0.18, -30)],
  balloons: [S("M30 52 Q36 74 50 92", "#FFFFFF", 1.4, 0.7), S("M50 46 Q48 70 50 92", "#FFFFFF", 1.4, 0.7), S("M70 52 Q64 74 50 92", "#FFFFFF", 1.4, 0.7), E(30, 36, 15, 18, "g:c1l:c1d"), E(70, 36, 15, 18, "g:c2l:c2d"), E(50, 28, 15, 19, "g:c3l:c3d"),
    P("M27 53 L33 53 L30 58 Z", "c1d"), P("M67 53 L73 53 L70 58 Z", "c2d"), P("M47 47.5 L53 47.5 L50 52.5 Z", "c3d"), E(24, 28, 3, 6, "#FFFFFF", 0.45, -20), E(64, 28, 3, 6, "#FFFFFF", 0.45, -20), E(44, 19, 3, 6, "#FFFFFF", 0.45, -20)],
  book: [SH, P("M8 34 L8 84 Q30 78 50 88 Q70 78 92 84 L92 34 Q70 28 50 36 Q30 28 8 34 Z", "c1d"), P("M50 32 Q32 22 12 28 L12 78 Q32 72 50 82 Z", "g:#FFFFFF:#E6E9EE"), P("M50 32 Q68 22 88 28 L88 78 Q68 72 50 82 Z", "g:#FFFFFF:#DCE0E6"),
    S("M19 40 Q31 36 43 42", "#C7CDD8", 1.8), S("M19 48 Q31 44 43 50", "#C7CDD8", 1.8), S("M19 56 Q31 52 43 58", "#C7CDD8", 1.8), S("M19 64 Q31 60 43 66", "#C7CDD8", 1.8), S("M57 42 Q69 36 81 40", "#C7CDD8", 1.8), S("M57 50 Q69 44 81 48", "#C7CDD8", 1.8), S("M57 58 Q69 52 81 56", "#C7CDD8", 1.8), R(64, 24, 5, 24, "c3", 1)],
  laptop: [SH, R(18, 18, 64, 46, "g:#2B3245:#1B2030", 4), R(22, 22, 56, 38, "g:c1l:c2d", 2), R(26, 27, 22, 4, "#FFFFFF", 2, 0.85), R(26, 34, 36, 3, "#FFFFFF", 1.5, 0.5), R(26, 40, 30, 3, "#FFFFFF", 1.5, 0.5), C(67, 48, 7, "#FFFFFF", 0.25), P("M8 66 L92 66 L86 78 Q85 80 82 80 L18 80 Q15 80 14 78 Z", "g:#D2D7E0:#9AA1B0"), R(40, 66, 20, 3, "#8A91A0", 1.5)],
  phone: [SH, R(30, 7, 40, 85, "g:#2B3245:#12151F", 8), R(33, 12, 34, 75, "g:c1l:c2d", 5), R(43, 14, 14, 3, "#12151F", 1.5), C(50, 38, 9, "#FFFFFF", 0.9), R(38, 54, 24, 4, "#FFFFFF", 2, 0.85), R(38, 62, 18, 3, "#FFFFFF", 1.5, 0.55), R(40, 74, 20, 7, "c3", 3.5), P("M33 12 L52 12 L33 40 Z", "#FFFFFF", 0.1)],
  house: [SH, R(68, 20, 8, 20, "c1d"), R(20, 46, 60, 40, "g:#FFF6E6:#EAD9BC", 2), P("M8 50 L50 14 L92 50 Z", "g:c1l:c1d"), S("M8 50 L50 14 L92 50", "#FFFFFF", 1.4, 0.3), R(42, 60, 16, 26, "g:c2:c2d", 2), C(54, 73, 1.4, "#FFFFFF"),
    R(26, 54, 12, 12, "g:#C8E7FF:#7FB7E8", 1.5), R(62, 54, 12, 12, "g:#C8E7FF:#7FB7E8", 1.5), R(31.5, 54, 1.2, 12, "#FFFFFF", 0, 0.7), R(67.5, 54, 1.2, 12, "#FFFFFF", 0, 0.7)],
  key: [SH, Cs(28, 48, 14, "c3", 8), R(40, 44, 50, 9, "g:c3l:c3d", 4.5), R(72, 52, 7, 12, "c3d", 2), R(83, 52, 7, 16, "c3d", 2), R(42, 45, 44, 2, "#FFFFFF", 1, 0.4)],
  scissors: [SH, P("M28 8 L56 54 L50 58 L20 14 Z", "g:#F2F5FA:#A7B0C0"), P("M72 8 L44 54 L50 58 L80 14 Z", "g:#F2F5FA:#9AA3B5"), Cs(32, 78, 12, "c1", 6), Cs(68, 78, 12, "c1", 6), P("M44 62 L38 68 L42 70 L50 62 Z", "#9AA3B5"), P("M56 62 L62 68 L58 70 L50 62 Z", "#8E97A9"), C(50, 57, 4.5, "c3")],
  toolbox: [SH, S("M38 36 L38 26 Q38 22 42 22 L58 22 Q62 22 62 26 L62 36", "#3A3F4D", 4), R(12, 40, 76, 44, "g:c1l:c1d", 5), R(12, 34, 76, 14, "c1", 4), R(44, 44, 12, 9, "c3", 2), R(14, 62, 72, 2, "#FFFFFF", 0, 0.22), R(12, 34, 76, 3, "#FFFFFF", 0, 0.25)],
  tag: [SH, P("M52 8 L90 8 L90 46 L48 88 Q44 91 40 88 L10 58 Q7 54 10 50 Z", "g:c3l:c3d"), C(76, 22, 5, "#00000055"), S("M76 22 Q70 6 56 4", "#FFFFFF", 2, 0.7), Cs(42, 40, 5, "c4", 3), Cs(60, 58, 5, "c4", 3), S("M63 36 L39 62", "c4", 4)],
  gift: [SH, R(16, 44, 68, 42, "g:c1l:c1d", 3), R(12, 34, 76, 14, "c1", 3), R(44, 34, 12, 52, "c3"), P("M50 34 Q30 10 27 25 Q28 36 50 34 Z", "c3"), P("M50 34 Q70 10 73 25 Q72 36 50 34 Z", "c3"), C(50, 34, 5, "c3d"), R(12, 34, 76, 3, "#FFFFFF", 0, 0.25)],
  rocket: [P("M42 70 Q50 99 58 70 Z", "g:#FFD54A:#FF6B35"), P("M34 54 L18 78 L34 70 Z", "c1"), P("M66 54 L82 78 L66 70 Z", "c1"), P("M50 5 C68 20 70 46 66 70 L34 70 C30 46 32 20 50 5 Z", "g:#FFFFFF:#D9DEE8"), P("M50 5 C58 11 63 19 65 30 L35 30 C37 19 42 11 50 5 Z", "c1"), C(50, 46, 9, "g:#BFE3FF:#4B8CD1"), Cs(50, 46, 9, "c1d", 3), R(38, 68, 24, 4, "c1d", 2)],
};
export const ILLO_LABELS: Record<string, string> = { bread: "Bread", burger: "Burger", coffee: "Coffee", bag: "Shopping bag", shirt: "T-shirt", balloons: "Balloons", book: "Book", laptop: "Laptop", phone: "Phone", house: "House", key: "Key", scissors: "Scissors", toolbox: "Toolbox", tag: "Price tag", gift: "Gift", rocket: "Rocket" };
const HEXC = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;
const rgb = (h: string): [number, number, number] => { const n = parseInt(h.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (c: number[]) => "#" + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase();
const DEFAULTS: Record<string, string> = { c1: "#7C3AED", c2: "#22D3EE", c3: "#D4AF37", c4: "#FFFFFF" };
export interface ResolvedPaint { none?: true; color?: string; opacity?: number; grad?: [string, string] }
function solid(spec: string, colors: IlloColors): { color: string; opacity: number } | null {
  let base = spec, mod = ""; const m = /^(c[1-4])([dl])?$/.exec(spec); if (m) { base = colors[m[1] as "c1"] ?? DEFAULTS[m[1]]; mod = m[2] ?? ""; }
  if (!HEXC.test(base)) return null; const [r, g, b] = rgb(base), a = base.length === 9 ? parseInt(base.slice(7, 9), 16) / 255 : 1;
  const c = mod === "d" ? toHex([r * 0.72, g * 0.72, b * 0.72]) : mod === "l" ? toHex([r + (255 - r) * 0.3, g + (255 - g) * 0.3, b + (255 - b) * 0.3]) : base.slice(0, 7); return { color: c, opacity: a };
}
/** Resolve a colour spec to a solid colour, a vertical gradient, or none. Returns null for an invalid spec. */
export function resolvePaint(spec: string, colors: IlloColors = {}): ResolvedPaint | null {
  if (spec === "none") return { none: true };
  if (spec.startsWith("g:")) { const [, a, b] = spec.split(":"), x = solid(a ?? "", colors), y = solid(b ?? "", colors); return x && y ? { grad: [x.color, y.color] } : null; }
  const s = solid(spec, colors); return s ? { color: s.color, opacity: s.opacity } : null;
}
