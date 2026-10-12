type RGB = [number, number, number];
const hex = ([r, g, b]: RGB) => "#" + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("").toUpperCase();
const dist = (a: RGB, b: RGB) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
/** Dominant colours from RGBA pixel data (4-bit bucketing, near-duplicates merged, transparent pixels ignored). */
export function extractPalette(px: ArrayLike<number>, count = 5): string[] {
  const m = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i + 3 < px.length; i += 4) { if (px[i + 3] < 128) continue; const k = ((px[i] >> 4) << 8) | ((px[i + 1] >> 4) << 4) | (px[i + 2] >> 4), e = m.get(k) ?? { n: 0, r: 0, g: 0, b: 0 }; e.n++; e.r += px[i]; e.g += px[i + 1]; e.b += px[i + 2]; m.set(k, e); }
  const out: RGB[] = []; for (const e of [...m.values()].sort((a, b) => b.n - a.n)) { const c: RGB = [Math.round(e.r / e.n), Math.round(e.g / e.n), Math.round(e.b / e.n)]; if (out.every(o => dist(o, c) > 48)) out.push(c); if (out.length >= count) break; }
  return out.map(hex);
}
export function imagePixels(dataUrl: string, size = 64): Promise<Uint8ClampedArray> {
  return new Promise((res, rej) => { const img = new Image(); img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = size; const g = c.getContext("2d"); if (!g) return rej(new Error("no canvas")); g.drawImage(img, 0, 0, size, size); res(g.getImageData(0, 0, size, size).data); }; img.onerror = () => rej(new Error("Could not read the image")); img.src = dataUrl; });
}
