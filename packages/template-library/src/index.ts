import type { ArtKind, ArtLayer, Fill, Layer, Palette, Project, ProjectMeta, ShapeLayer, TextLayer } from "@adforge/creative-schema";
export type { Palette };
export type Category = "product-launch" | "retail" | "food" | "fashion" | "events" | "education" | "technology" | "real-estate" | "services" | "offers";
export type Style = "hero" | "split" | "burst" | "poster";
export type EmotionId = "joy" | "craving" | "excitement" | "trust" | "luxury" | "urgency" | "fresh" | "love";
export const isPhotoStyle = (s: string) => s === "hero" || s === "split";
export interface Copy { headline: string; subtitle: string; cta: string; hook: string; badge?: string }
export interface Emotion { id: EmotionId; label: string; palette: Palette; emojis: string[]; art: ArtKind; hooks: string[] }
export const EMOTIONS: Record<EmotionId, Emotion> = {
  joy: { id: "joy", label: "Joy", palette: { bg: "#2D0A4E", primary: "#FF4DA6", secondary: "#FFD23F", text: "#FFFFFF", gold: "#FFD23F" }, emojis: ["😍", "🎉", "✨"], art: "confetti", hooks: ["Make today special.", "Smiles guaranteed? Come see.", "Because you deserve joy."] },
  craving: { id: "craving", label: "Craving", palette: { bg: "#2A0E05", primary: "#FF6B35", secondary: "#FFD166", text: "#FFF8EE", gold: "#FFD166" }, emojis: ["😋", "🍽️", "✨"], art: "bokeh", hooks: ["Hungry? Look no further.", "Taste the moment.", "Come hungry."] },
  excitement: { id: "excitement", label: "Excitement", palette: { bg: "#0A0F3D", primary: "#6C4BFF", secondary: "#00E0FF", text: "#FFFFFF", gold: "#FFD23F" }, emojis: ["🎉", "🙌", "⚡"], art: "rays", hooks: ["Let's go!", "Be there. Feel it.", "Bring your friends."] },
  trust: { id: "trust", label: "Trust", palette: { bg: "#062B3A", primary: "#0EA5A4", secondary: "#9AE6D4", text: "#F2FFFC", gold: "#FFD166" }, emojis: ["🤝", "👍", "✨"], art: "waves", hooks: ["Leave it to us.", "Sorted, simply.", "Here when you need us."] },
  luxury: { id: "luxury", label: "Luxury", palette: { bg: "#14110F", primary: "#C8A24A", secondary: "#E8D8A8", text: "#FAF7F0", gold: "#D4AF37" }, emojis: ["✨", "💎", "🥂"], art: "bokeh", hooks: ["You deserve this.", "Quiet luxury, loud taste.", "Treat yourself."] },
  urgency: { id: "urgency", label: "Urgency", palette: { bg: "#2A0A0A", primary: "#FF3B30", secondary: "#FFD60A", text: "#FFFFFF", gold: "#FFD60A" }, emojis: ["🔥", "⏰", "💥"], art: "rays", hooks: ["Don't miss this.", "Grab it while you can.", "Today's the day."] },
  fresh: { id: "fresh", label: "Fresh", palette: { bg: "#062A1E", primary: "#2EC27E", secondary: "#C7F9CC", text: "#F2FFF8", gold: "#FFE66D" }, emojis: ["🌿", "😊", "✨"], art: "dots", hooks: ["A fresh start.", "Feel good about it.", "Simple. Good. Yours."] },
  love: { id: "love", label: "Love", palette: { bg: "#3A0A1E", primary: "#FF4D6D", secondary: "#FFC2D1", text: "#FFF5F7", gold: "#FFD6A5" }, emojis: ["❤️", "🥰", "✨"], art: "bokeh", hooks: ["Share the love.", "Made for someone special.", "Give them a smile."] },
};
export const EMOTION_LIST = Object.values(EMOTIONS);
const CATS: { cat: Category; name: string; tags: string[]; emotion: EmotionId; hooks: string[]; copy: Omit<Copy, "badge"> }[] = [
  { cat: "food", name: "Food", tags: ["restaurant", "menu", "meal", "bakery"], emotion: "craving", hooks: ["Hungry? Look no further.", "Taste the moment.", "Come hungry."], copy: { headline: "Made To Be Enjoyed", subtitle: "Tell people what's on the menu today.", cta: "Order now", hook: "Hungry? Look no further." } },
  { cat: "fashion", name: "Fashion", tags: ["style", "clothing", "collection"], emotion: "love", hooks: ["Wear your confidence.", "Find your look.", "Style starts here."], copy: { headline: "Find Your Look", subtitle: "Describe the collection and where to find it.", cta: "Shop the look", hook: "Wear your confidence." } },
  { cat: "events", name: "Event", tags: ["event", "party", "tickets"], emotion: "excitement", hooks: ["Be there. Feel it.", "Save the date.", "Bring your friends."], copy: { headline: "Join Us Live", subtitle: "Add the date, venue and time.", cta: "Reserve a spot", hook: "Be there. Feel it." } },
  { cat: "education", name: "Education", tags: ["school", "course", "class"], emotion: "fresh", hooks: ["Learn something new today.", "Start where you are.", "Your future begins here."], copy: { headline: "Start Learning Today", subtitle: "Share the course, start date and level.", cta: "Enrol today", hook: "Start where you are." } },
  { cat: "technology", name: "Tech", tags: ["app", "software", "gadget"], emotion: "excitement", hooks: ["Work smarter.", "See what's possible.", "The future is closer."], copy: { headline: "Built For How You Work", subtitle: "Explain the one feature that matters most.", cta: "Get started", hook: "See what's possible." } },
  { cat: "real-estate", name: "Property", tags: ["property", "house", "rent"], emotion: "luxury", hooks: ["Home is waiting.", "Picture yourself here.", "Your next chapter starts here."], copy: { headline: "Find Your Next Home", subtitle: "Add the location, size and key features.", cta: "Book a viewing", hook: "Picture yourself here." } },
  { cat: "services", name: "Service", tags: ["business", "repair", "salon"], emotion: "trust", hooks: ["Leave it to us.", "Sorted, simply.", "Here when you need us."], copy: { headline: "Reliable Service Near You", subtitle: "Say what you do and how to reach you.", cta: "Contact us", hook: "Leave it to us." } },
  { cat: "offers", name: "Offer", tags: ["sale", "discount", "deal"], emotion: "urgency", hooks: ["Don't miss this.", "Grab it while you can.", "Today's the day."], copy: { headline: "Your Offer Here", subtitle: "Only add an offer you can honour.", cta: "Claim offer", hook: "Don't miss this." } },
  { cat: "retail", name: "Retail", tags: ["shop", "store", "promotion"], emotion: "joy", hooks: ["Come see what's new.", "Treat yourself today.", "Find your next favourite."], copy: { headline: "This Weekend In Store", subtitle: "Add your products and opening hours.", cta: "Visit us", hook: "Treat yourself today." } },
  { cat: "product-launch", name: "Launch", tags: ["launch", "new", "product"], emotion: "excitement", hooks: ["Meet something new.", "Your next favourite is here.", "Ready when you are."], copy: { headline: "Meet Your New Product", subtitle: "Introduce what makes it different.", cta: "Learn more", hook: "Meet something new." } },
];
export function hooksFor(cat: Category, emotion: EmotionId): string[] { return [...new Set([...(CATS.find(c => c.cat === cat)?.hooks ?? []), ...EMOTIONS[emotion].hooks])]; }

export interface Template { id: string; name: string; category: Category; tags: string[]; width: number; height: number; style: Style; needsPhoto: boolean; emotion: EmotionId; palette: Palette; emojis: string[]; art: ArtKind; hooks: string[]; copy: Copy; fields: string[]; animation: "fade-up" | "slide-left" | "zoom-in" }
const SIZE: Record<Style, [number, number]> = { hero: [1080, 1350], split: [1080, 1080], burst: [1080, 1080], poster: [1080, 1920] };
const STYLE_LABEL: Record<Style, string> = { hero: "Photo hero", split: "Photo + card", burst: "Emoji burst", poster: "Bold poster" };
export const TEMPLATES: Template[] = CATS.flatMap((c, i) => {
  const e = EMOTIONS[c.emotion], mk = (style: Style): Template => ({ id: `${c.cat}-${style}`, name: `${c.name} — ${STYLE_LABEL[style]}`, category: c.cat, tags: c.tags, width: SIZE[style][0], height: SIZE[style][1], style, needsPhoto: isPhotoStyle(style), emotion: c.emotion, palette: e.palette, emojis: e.emojis, art: e.art, hooks: c.hooks, copy: c.copy, fields: ["hook", "headline", "subtitle", "cta"], animation: "zoom-in" });
  return [mk(i % 2 ? "split" : "hero"), mk(i % 2 ? "poster" : "burst")]; });

// ---------------- layout engine ----------------
export const pillWidth = (text: string, size: number, maxW: number) => Math.round(Math.min(maxW, Array.from(text).length * size * 0.62 + size * 2));
const FONT = "Inter, Arial, sans-serif", EMOJI_FONT = "'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif";
export const ROLE_NAMES = new Set(["image", "scrim", "art", "art2", "accent", "ring", "hero-circle", "emoji", "emoji2", "emoji3", "badge", "badge-text", "hook", "hook-bg", "headline", "subtitle", "cta", "cta-bg"]);
const S = (c: string): Fill => ({ kind: "solid", color: c });
const G = (angle: number, ...stops: string[]): Fill => ({ kind: "gradient", angle, stops: stops.map((c, i) => ({ offset: stops.length === 1 ? 0 : i / (stops.length - 1), color: c })) });
const shade = (hex: string, k: number) => { const n = parseInt(hex.slice(1, 7), 16), f = (v: number) => Math.round(v * k).toString(16).padStart(2, "0"); return `#${f((n >> 16) & 255)}${f((n >> 8) & 255)}${f(n & 255)}`; };
export interface LayoutInput { style: Style; palette: Palette; emojis: string[]; W: number; H: number; copy: Copy; art: ArtKind; font?: string; photo?: { assetId?: string; fit?: "cover" | "contain"; focusX?: number; focusY?: number } }
export function layoutFor(o: LayoutInput): { background: Fill; layers: Layer[] } {
  const { style, palette: pal, emojis, W, H, copy: c, art } = o, font = o.font ?? FONT, u = Math.min(W, H), m = Math.round(u * 0.07), land = W > H * 1.2, base = { rotation: 0, opacity: 1 };
  const T = (name: string, t: string, x: number, y: number, w: number, h: number, size: number, color: string, align: "left" | "center" = "left", x2: Partial<TextLayer> = {}): TextLayer => ({ ...base, id: name, name, type: "text", text: t, x, y, w, h, fontFamily: font, fontSize: Math.round(size), color, align, lineHeight: 1.12, letterSpacing: 0, ...x2 });
  const R = (name: string, shape: ShapeLayer["shape"], x: number, y: number, w: number, h: number, fill: Fill, x2: Partial<ShapeLayer> = {}): ShapeLayer => ({ ...base, id: name, name, type: "shape", shape, x, y, w, h, fill, ...x2 });
  const A = (name: string, kind: ArtKind, x: number, y: number, w: number, h: number, color: string, color2: string, seed: number, opacity: number, x2: Partial<ArtLayer> = {}): ArtLayer => ({ ...base, id: name, name, type: "art", kind, x, y, w, h, color, color2, seed, opacity, ...x2 });
  const emoji = (name: string, e: string, x0: number, y0: number, size: number, rot: number): TextLayer => { const pad = u * 0.02, x = Math.max(pad, Math.min(W - size * 1.5 * 1.15 - pad, x0)), y = Math.max(pad, Math.min(H - size * 1.5 * 1.15 - pad, y0)); return T(name, e, x, y, size * 1.5, size * 1.5, size, "#FFFFFF", "center", { fontFamily: EMOJI_FONT, rotation: rot, shadow: { dx: 0, dy: u * 0.01, blur: u * 0.025, color: "#00000077" } }); };
  const pill = (name: string, text: string, x: number, y: number, maxW: number, size: number, bg: string, fg: string, rot = 0): Layer[] => { const w = pillWidth(text, size, maxW), h = Math.round(size * 2);
    return [R(`${name}-bg`, "rect", x, y, w, h, S(bg), { cornerRadius: h / 2, rotation: rot }), T(name, text, x, y + h / 2 - size * 0.64, w, size * 1.3, size, fg, "center", { bold: true, rotation: rot })]; };
  const pillW = pillWidth;
  const badge = (x: number, y: number, size: number): Layer[] => c.badge ? [R("badge", "burst", x, y, size, size, S(pal.gold), { rotation: -10, points: 16, shadow: { dx: 0, dy: u * 0.01, blur: u * 0.025, color: "#00000066" } }), T("badge-text", c.badge, x + size * 0.14, y + size * 0.3, size * 0.72, size * 0.4, size * 0.17, "#14110F", "center", { bold: true, rotation: -10, autoFit: true, fitMax: Math.round(size * 0.17) })] : [];
  const tf = H > W * 1.5 ? 1.18 : 1, sizes = () => ({ hs: u * (land ? 0.075 : 0.088) * tf, ss: u * 0.036 * tf, cs: u * 0.036 * tf, chs: u * 0.03 * tf }), gapV = () => Math.round(u * 0.022);
  const blockH = () => { const z = sizes(); return Math.round(z.chs * 2) + Math.round(z.hs * 2.4) + Math.round(z.ss * 2.7) + Math.round(z.cs * 2.2) + gapV() * 3; };
  /** Hook chip, headline, subtitle and CTA stacked in a column. */
  const block = (x: number, w: number, top: number, bottom: number, anchor: "bottom" | "center", align: "left" | "center"): Layer[] => {
    const { hs, ss, cs, chs } = sizes(), hh = Math.round(hs * 2.4), sh = Math.round(ss * 2.7), ch = Math.round(chs * 2), ctaH = Math.round(cs * 2.2), gap = gapV();
    const hs2 = [ch, hh, sh, ctaH], tot = hs2.reduce((a, b) => a + b, 0) + gap * 3; let y = anchor === "bottom" ? bottom - tot : top + (bottom - top - tot) / 2; const ys = hs2.map(v => { const r = Math.round(y); y += v + gap; return r; });
    const cta = `${c.cta} →`, cw = pillW(cta, cs, w), chW = pillW(c.hook, chs, w), ox = (ww: number) => (align === "center" ? x + (w - ww) / 2 : x);
    return [...pill("hook", c.hook, ox(chW), ys[0], w, chs, pal.gold, "#14110F"), T("headline", c.headline, x, ys[1], w, hh, hs, pal.text, align, { bold: true, autoFit: true, fitMax: Math.round(hs) }),
      T("subtitle", c.subtitle, x, ys[2], w, sh, ss, pal.secondary, align, { autoFit: true, fitMax: Math.round(ss) }), ...pill("cta", cta, ox(cw), ys[3], w, cs, pal.primary === pal.gold ? pal.secondary : pal.gold, "#14110F")].map(l => (l.name === "hook" || l.name === "cta" || l.name === "hook-bg" || l.name === "cta-bg" ? l : l)); };
  const photoLayer = (x: number, y: number, w: number, h: number, extra: object = {}): Layer => ({ ...base, id: "image", name: "image", type: "image", assetId: o.photo?.assetId ?? "placeholder", fit: o.photo?.fit ?? "cover", focusX: o.photo?.focusX, focusY: o.photo?.focusY, x, y, w, h, ...extra } as Layer);
  const colW = land ? Math.round(W * 0.5 - m) : W - 2 * m, sticker = Math.round(u * 0.15), box = sticker * 1.5;
  let background: Fill = S(pal.bg), layers: Layer[] = [];
  if (style === "hero") {
    const sc = land ? R("scrim", "rect", 0, 0, W * 0.72, H, G(90, pal.bg + "F2", pal.bg + "B8", "#00000000")) : R("scrim", "rect", 0, H * 0.3, W, H * 0.7, G(180, "#00000000", pal.bg + "C8", pal.bg + "F5"));
    layers = [photoLayer(0, 0, W, H), sc, ...badge(m * 0.9, m * 0.9, u * 0.24), emoji("emoji", emojis[0], W - m - box, m * 0.8, sticker, 10), ...(land ? block(m, colW, m, H - m, "center", "left") : block(m, W - 2 * m, H * 0.4, H - m * 0.9, "bottom", "left"))];
  } else if (style === "split") {
    background = G(160, pal.bg, shade(pal.primary, 0.45));
    const pw = land ? W * 0.46 - m : W - 2 * m, ph = land ? H - 2 * m : Math.max(H * 0.28, Math.min(H * 0.55, H - 2 * m - blockH() - m * 0.6)), px = land ? W * 0.54 : m, py = m, frame = { cornerRadius: 0, radius: u * 0.05, border: { color: "#FFFFFF", width: Math.round(u * 0.008) }, shadow: { dx: 0, dy: u * 0.02, blur: u * 0.05, color: "#000000AA" } };
    layers = [A("art", "dots", 0, 0, W, H, "#FFFFFF", pal.secondary, 7, 0.1), R("accent", "ellipse", px + pw * 0.25, py - m * 0.3, pw * 0.8, pw * 0.8, S(pal.primary), { opacity: 0.45 }), photoLayer(px, py, pw, ph, frame),
      ...badge(land ? px - u * 0.1 : m * 0.4, m * 0.5, u * 0.22), emoji("emoji", emojis[0], land ? px - box * 0.55 : W - m - box * 0.9, land ? H - m - box : py + ph - box * 0.7, sticker, -8),
      ...(land ? block(m, W * 0.54 - 2 * m, m, H - m, "center", "left") : block(m, W - 2 * m, py + ph + m * 0.5, H - m, "bottom", "left"))];
  } else if (style === "burst") {
    background = G(165, pal.primary, pal.bg);
    const Th = H - m * 0.9 - blockH() - m * 0.4, r = land ? H * 0.3 : Math.max(u * 0.08, Math.min(u * 0.2, (Th - m) / 2.7)), cx = land ? W * 0.76 : W / 2, cy = land ? H / 2 : Th / 2 + m * 0.2;
    layers = [A("art", "rays", 0, 0, W, H, "#FFFFFF", "#FFFFFF", 3, 0.13, { cx: cx / W, cy: cy / H }), ...(art !== "rays" ? [A("art2", art, 0, 0, W, H, pal.gold, pal.secondary, 11, 0.55)] : []),
      R("ring", "ellipse", cx - r * 1.3, cy - r * 1.3, r * 2.6, r * 2.6, S("#FFFFFF"), { opacity: 0.12 }), R("hero-circle", "ellipse", cx - r, cy - r, r * 2, r * 2, S("#FFFFFF"), { opacity: 0.2, shadow: { dx: 0, dy: u * 0.02, blur: u * 0.05, color: "#00000055" } }),
      emoji("emoji", emojis[0], cx - r * 0.82, cy - r * 0.88, r * 1.15, 0), emoji("emoji2", emojis[1] ?? "✨", cx - r * 1.55, cy - r * 1.2, r * 0.45, -14), emoji("emoji3", emojis[2] ?? "✨", cx + r * 0.85, cy + r * 0.45, r * 0.45, 12), ...badge(land ? W - u * 0.22 - m * 0.6 : m * 0.6, m * 0.6, u * 0.22),
      ...(land ? block(m, colW, m, H - m, "center", "left") : block(m, W - 2 * m, 0, H - m * 0.9, "bottom", "center"))];
  } else {
    background = G(170, pal.bg, shade(pal.primary, 0.4));
    const hs = u * (land ? 0.1 : 0.115), hw = land ? W * 0.55 - m : W - 2 * m, hh = Math.round(hs * 3.3), chs = u * 0.034, ss = u * 0.042, cs = u * 0.044, ctaT = `${c.cta} →`, ctaW = pillW(ctaT, cs, hw), ctaH = Math.round(cs * 2.2), ctaY = H - m - ctaH, headY = m + chs * 2 + u * 0.03;
    layers = [A("art", "waves", 0, H * 0.55, W, H * 0.45, pal.primary, pal.secondary, 5, 1), A("art2", "dots", W * 0.45, 0, W * 0.55, H * 0.35, "#FFFFFF", "#FFFFFF", 9, 0.16), ...(art === "confetti" || art === "bokeh" ? [A("accent", art, 0, 0, W, H, pal.gold, pal.secondary, 21, 0.5)] : []),
      ...pill("hook", c.hook, m, m, hw, chs, pal.gold, "#14110F", -3), T("headline", c.headline, m, headY, hw, hh, hs, pal.text, "left", { bold: true, autoFit: true, fitMax: Math.round(hs) }),
      T("subtitle", c.subtitle, m, headY + hh + u * 0.015, hw, Math.round(ss * 2.7), ss, pal.secondary, "left", { autoFit: true, fitMax: Math.round(ss) }),
      emoji("emoji", emojis[0], land ? W - m - u * 0.5 : W - m - u * 0.42, land ? H * 0.2 : H * 0.47 - u * 0.1, u * 0.3, 8), emoji("emoji2", emojis[1] ?? "✨", land ? W * 0.62 : W * 0.46, land ? H * 0.62 : H * 0.57, u * 0.12, -10), ...badge(land ? W - m - u * 0.5 : W - m - u * 0.24, land ? H * 0.58 : H * 0.36, u * 0.22),
      ...pill("cta", ctaT, m, ctaY, hw, cs, pal.gold, "#14110F")];
    void ctaW;
  }
  return { background, layers };
}
export const emotionFor = (text: string, fallback: EmotionId): EmotionId => /\b(sale|% ?off|discount|hurry|limited|last chance|today only|clearance)\b|\d\s?%/i.test(text) ? "urgency" : /\b(love|wedding|valentine|mum|mom|mother|gift|anniversary|birthday)\b/i.test(text) ? "love" : /\b(luxury|premium|exclusive|gold|diamond|vip)\b/i.test(text) ? "luxury" : /\b(fresh|organic|farm|healthy|natural|green|vegan)\b/i.test(text) ? "fresh" : /\b(party|concert|festival|live|night|tickets)\b/i.test(text) ? "excitement" : fallback;
export function instantiate(t: Template, opts: { id?: string; name?: string; copy?: Partial<Copy>; emotion?: EmotionId; photo?: LayoutInput["photo"]; font?: string } = {}): Project {
  const now = new Date().toISOString(), emo = EMOTIONS[opts.emotion ?? t.emotion], copy = { ...t.copy, ...opts.copy }, palette = emo.palette, emojis = emo.emojis;
  const { background, layers } = layoutFor({ style: t.style, palette, emojis, W: t.width, H: t.height, copy, art: emo.art, font: opts.font, photo: opts.photo });
  const meta: ProjectMeta = { templateId: t.id, style: t.style, emotion: emo.id, emojis, palette, art: emo.art, needsPhoto: t.needsPhoto, font: opts.font };
  return { schemaVersion: 2, id: opts.id ?? (globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}`), type: "image", name: opts.name ?? t.name, createdAt: now, updatedAt: now, meta,
    canvas: { width: t.width, height: t.height, background }, assets: [{ id: "placeholder", kind: "image", mime: "image/png", name: "Photo placeholder" }], layers };
}
export function searchTemplates(query = "", category?: Category): Template[] {
  const q = query.trim().toLowerCase(); return TEMPLATES.filter(t => (!category || t.category === category) && (!q || [t.name, t.category, ...t.tags].some(s => s.toLowerCase().includes(q))));
}
const KEYS: [Category, RegExp][] = [
  ["food", /\b(food|restaurant|cafe|café|bakery|bread|cake|pizza|burger|chicken|coffee|menu|kitchen|nyama|chips|meal|lunch|dinner|juice)\b/i],
  ["fashion", /\b(fashion|clothes|clothing|dress|shoes?|sneakers?|outfit|boutique|wear|jeans|suit|hair|style|collection)\b/i],
  ["education", /\b(school|course|class|classes|tuition|training|exam|student|college|lesson|enrol|enroll|academy)\b/i],
  ["technology", /\b(app|software|tech|gadget|phone|laptop|website|startup|wifi|internet|computer)\b/i],
  ["real-estate", /\b(house|rent|property|apartment|plot|land|bedroom|estate|airbnb|flat)\b/i],
  ["events", /\b(event|party|concert|wedding|festival|conference|tickets?|gig|show)\b/i],
  ["offers", /\b(sale|discount|offer|deal|promo|bargain|clearance|\d+\s?%)/i],
  ["retail", /\b(shop|store|market|supermarket|duka|wholesale|retail)\b/i],
  ["services", /\b(repair|salon|barber|cleaning|plumber|plumbing|electrician|photography|delivery|mechanic|laundry|service|services)\b/i],
  ["product-launch", /\b(launch|new|introducing|arrival)\b/i],
];
/** Pick a starter template from free text (keywords only). Prefers photo layouts when the user has a photo, graphic layouts otherwise. */
export function recommendTemplate(text: string, o: { photo?: boolean } = {}): Template {
  const cat = KEYS.find(([, re]) => re.test(text))?.[0] ?? "product-launch", list = TEMPLATES.filter(t => t.category === cat);
  return list.find(t => t.needsPhoto === !!o.photo) ?? list[0];
}
