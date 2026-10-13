import type { ArtKind, ArtLayer, Fill, Layer, Palette, Project, ProjectMeta, ShapeLayer, TextLayer } from "@adforge/creative-schema";
export type { Palette };
export type Category = "product-launch" | "retail" | "food" | "fashion" | "events" | "education" | "technology" | "real-estate" | "services" | "offers";
export type Style = "hero" | "split" | "magazine" | "circle" | "showcase" | "studio" | "clean" | "burst" | "poster";
export type EmotionId = "joy" | "craving" | "excitement" | "trust" | "luxury" | "urgency" | "fresh" | "love";
export const isPhotoStyle = (s: string) => s === "hero" || s === "split" || s === "magazine" || s === "circle";
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
export const ILLOS_BY_CAT: Record<Category, string[]> = { food: ["bread", "burger", "coffee"], fashion: ["shirt", "bag"], events: ["balloons", "gift"], education: ["book", "laptop"], technology: ["laptop", "phone"], "real-estate": ["house", "key"], services: ["scissors", "toolbox"], offers: ["tag", "gift"], retail: ["bag", "tag"], "product-launch": ["rocket", "phone"] };
const ILLO_KEYS: [RegExp, string][] = [[/\b(bread|bakery|cake|bun|scone|mandazi)\b/i, "bread"], [/\b(burger|chicken|chips|nyama|pizza|fries|grill)\b/i, "burger"], [/\b(coffee|tea|juice|cafe|café|latte)\b/i, "coffee"], [/\b(hair|salon|barber|braids?|beauty)\b/i, "scissors"],
  [/\b(repair|plumb\w*|electric\w*|mechanic|fix|tools?|construction)\b/i, "toolbox"], [/\b(phone|app|mobile)\b/i, "phone"], [/\b(laptop|computer|software|website|coding)\b/i, "laptop"], [/\b(book|school|course|class|classes|tuition|library)\b/i, "book"],
  [/\b(key|rent|house|property|apartment|home|flat)\b/i, "house"], [/\b(gift|birthday|wedding|valentine|anniversary)\b/i, "gift"], [/\b(party|balloons?|celebrat\w*)\b/i, "balloons"], [/\b(sale|discount|offer|deal|promo|\d+\s?%)/i, "tag"], [/\b(shirt|clothes|dress|fashion|wear)\b/i, "shirt"], [/\b(shop|store|bag|market)\b/i, "bag"], [/\b(launch|rocket|startup)\b/i, "rocket"]];
/** Pick an illustration from the words, falling back to the category's own (varied by seed). */
export const illoFor = (text: string, cat: Category, seed = 0): string => ILLO_KEYS.find(([re]) => re.test(text))?.[1] ?? ILLOS_BY_CAT[cat][seed % ILLOS_BY_CAT[cat].length];
export function hooksFor(cat: Category, emotion: EmotionId): string[] { return [...new Set([...(CATS.find(c => c.cat === cat)?.hooks ?? []), ...EMOTIONS[emotion].hooks])]; }

export interface Template { illo: string; id: string; name: string; category: Category; tags: string[]; width: number; height: number; style: Style; needsPhoto: boolean; emotion: EmotionId; palette: Palette; emojis: string[]; art: ArtKind; hooks: string[]; copy: Copy; fields: string[]; animation: "fade-up" | "slide-left" | "zoom-in" }
const SIZE: Record<Style, [number, number]> = { hero: [1080, 1350], split: [1080, 1080], magazine: [1080, 1350], circle: [1080, 1080], showcase: [1080, 1080], studio: [1080, 1350], clean: [1080, 1350], burst: [1080, 1080], poster: [1080, 1920] };
const STYLE_LABEL: Record<Style, string> = { hero: "Photo hero", split: "Photo + card", magazine: "Magazine", circle: "Round photo", showcase: "Showcase", studio: "Studio", clean: "Clean card", burst: "Emoji burst", poster: "Bold poster" };
export const TEMPLATES: Template[] = CATS.flatMap((c, i) => {
  const e = EMOTIONS[c.emotion], il = ILLOS_BY_CAT[c.cat], mk = (style: Style, n = 0): Template => ({ illo: il[(i + n) % il.length], id: `${c.cat}-${style}`, name: `${c.name} — ${STYLE_LABEL[style]}`, category: c.cat, tags: c.tags, width: SIZE[style][0], height: SIZE[style][1], style, needsPhoto: isPhotoStyle(style), emotion: c.emotion, palette: e.palette, emojis: e.emojis, art: e.art, hooks: c.hooks, copy: c.copy, fields: ["hook", "headline", "subtitle", "cta"], animation: "zoom-in" });
  return [mk(i % 2 ? "split" : "hero"), mk(i % 2 ? "circle" : "magazine"), mk("showcase"), mk("studio", 1), mk("clean", 2), mk("burst"), mk("poster")]; });

// ---------------- layout engine ----------------
export const pillWidth = (text: string, size: number, maxW: number) => Math.round(Math.min(maxW, Array.from(text).length * size * 0.62 + size * 2));
const FONT = "Inter, Arial, sans-serif", EMOJI_FONT = "'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif";
export const ROLE_NAMES = new Set(["illo", "image", "scrim", "art", "art2", "accent", "ring", "hero-circle", "emoji", "emoji2", "emoji3", "badge", "badge-text", "hook", "hook-bg", "headline", "subtitle", "cta", "cta-bg"]);
const S = (c: string): Fill => ({ kind: "solid", color: c });
const G = (angle: number, ...stops: string[]): Fill => ({ kind: "gradient", angle, stops: stops.map((c, i) => ({ offset: stops.length === 1 ? 0 : i / (stops.length - 1), color: c })) });
const shade = (hex: string, k: number) => { const n = parseInt(hex.slice(1, 7), 16), f = (v: number) => Math.round(v * k).toString(16).padStart(2, "0"); return `#${f((n >> 16) & 255)}${f((n >> 8) & 255)}${f(n & 255)}`; };
export interface LayoutInput { illo?: string; style: Style; palette: Palette; emojis: string[]; W: number; H: number; copy: Copy; art: ArtKind; font?: string; photo?: { assetId?: string; fit?: "cover" | "contain"; focusX?: number; focusY?: number } }
export function layoutFor(o: LayoutInput): { background: Fill; layers: Layer[] } {
  const { style, palette: pal, emojis, W, H, copy: c, art } = o, font = o.font ?? FONT, u = Math.min(W, H), m = Math.round(u * 0.07), land = W > H * 1.2, base = { rotation: 0, opacity: 1 };
  const lumOf = (h: string) => { const n = parseInt(h.slice(1, 7), 16), f = (v: number) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255); };
  const onColor = (bg: string) => (lumOf(bg) > 0.4 ? "#14110F" : "#FFFFFF"), mix = (a: string, b: string, t: number) => { const x = parseInt(a.slice(1, 7), 16), y = parseInt(b.slice(1, 7), 16), ch = (sh: number) => Math.round(((x >> sh) & 255) * (1 - t) + ((y >> sh) & 255) * t).toString(16).padStart(2, "0"); return `#${ch(16)}${ch(8)}${ch(0)}`; };
  let P: Palette = pal;
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
    return [...pill("hook", c.hook, ox(chW), ys[0], w, chs, P.gold, onColor(P.gold)), T("headline", c.headline, x, ys[1], w, hh, hs, P.text, align, { bold: true, autoFit: true, fitMax: Math.round(hs) }),
      T("subtitle", c.subtitle, x, ys[2], w, sh, ss, P.secondary, align, { autoFit: true, fitMax: Math.round(ss) }), ...pill("cta", cta, ox(cw), ys[3], w, cs, P.primary === P.gold ? P.secondary : P.gold, onColor(P.primary === P.gold ? P.secondary : P.gold))].map(l => (l.name === "hook" || l.name === "cta" || l.name === "hook-bg" || l.name === "cta-bg" ? l : l)); };
  const illoLayer = (x: number, y: number, size: number, rot: number): Layer => ({ ...base, id: "illo", name: "illo", type: "illo", kind: o.illo ?? "gift", x, y, w: size, h: size, rotation: rot, colors: { c1: pal.primary, c2: pal.secondary, c3: pal.gold, c4: pal.text }, shadow: { dx: 0, dy: u * 0.015, blur: u * 0.035, color: "#00000066" } } as Layer);
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
  } else if (style === "magazine") {
    background = S(pal.bg); const cardFill = S(shade(pal.primary, 0.5)), lift = { dx: 0, dy: u * 0.02, blur: u * 0.05, color: "#000000AA" };
    if (land) { const cardX = W * 0.46, cardW = W - cardX - m * 0.6;
      layers = [photoLayer(0, 0, W * 0.8, H), R("accent", "rect", cardX, m, cardW, H - 2 * m, cardFill, { cornerRadius: u * 0.04, shadow: lift }), ...badge(m * 0.6, m * 0.6, u * 0.22), emoji("emoji", emojis[0], cardX - box * 0.6, H - m - box * 1.1, sticker, -8), ...block(cardX + m * 0.6, cardW - m * 1.2, m * 1.6, H - m * 1.6, "center", "left")];
    } else { const cardH = blockH() + Math.round(m * 1.2), cardY = H - m * 0.6 - cardH;
      layers = [photoLayer(0, 0, W, cardY + m), R("accent", "rect", m * 0.5, cardY, W - m, cardH, cardFill, { cornerRadius: u * 0.045, shadow: lift }), ...badge(m * 0.9, m * 0.9, u * 0.24), emoji("emoji", emojis[0], W - m - box, cardY - box * 0.8, sticker, 10), ...block(m * 1.1, W - m * 2.2, cardY + m * 0.6, cardY + cardH - m * 0.6, "bottom", "left")]; }
  } else if (style === "circle") {
    background = G(160, pal.bg, shade(pal.primary, 0.45)); const ring = { color: "#FFFFFF", width: Math.round(u * 0.012) }, lift = { dx: 0, dy: u * 0.02, blur: u * 0.05, color: "#000000AA" };
    const Th = H - m * 0.9 - blockH() - m * 0.4, d = land ? H * 0.8 : Math.max(u * 0.25, Math.min(W * 0.68, (Th * 0.5 + m * 0.2) / 0.62)), cx = land ? W * 0.74 : W / 2, cy = land ? H / 2 : Th / 2 + m * 0.1;
    layers = [A("art", "dots", 0, 0, W, H, "#FFFFFF", pal.secondary, 7, 0.1), R("ring", "ellipse", cx - d * 0.62, cy - d * 0.62, d * 1.24, d * 1.24, S("#FFFFFF"), { opacity: 0.12 }), R("accent", "ellipse", cx - d * 0.42, cy - d * 0.56, d, d, S(pal.primary), { opacity: 0.55 }),
      photoLayer(cx - d / 2, cy - d / 2, d, d, { radius: d / 2, border: ring, shadow: lift }), emoji("emoji", emojis[0], cx + d * 0.22, cy + d * 0.26, sticker, 8), ...badge(land ? W * 0.5 - u * 0.1 : m * 0.6, m * 0.6, u * 0.22),
      ...(land ? block(m, W * 0.46 - m, m, H - m, "center", "left") : block(m, W - 2 * m, 0, H - m * 0.9, "bottom", "center"))];
  } else if (style === "showcase") {
    background = G(170, shade(pal.primary, 0.6), pal.bg);
    const Th = H - m * 0.9 - blockH() - m * 0.4, r = land ? H * 0.3 : Math.max(u * 0.1, Math.min(u * 0.25, (Th - m * 0.6) / 2.5)), cx = land ? W * 0.76 : W / 2, cy = land ? H / 2 : Th / 2 + m * 0.2, sz = r * 2.4;
    layers = [A("art", "bokeh", 0, 0, W, H, pal.gold, pal.secondary, 4, 0.5), R("ring", "ellipse", cx - r * 1.5, cy - r * 1.5, r * 3, r * 3, S("#FFFFFF"), { opacity: 0.07 }), R("hero-circle", "ellipse", cx - r * 1.05, cy - r * 1.05, r * 2.1, r * 2.1, G(180, "#FFFFFF38", "#FFFFFF0A")),
      R("accent", "ellipse", cx - r * 0.85, cy + r * 0.9, r * 1.7, r * 0.3, S("#000000"), { opacity: 0.35 }), illoLayer(cx - sz / 2, cy - sz / 2 - r * 0.1, sz, 0), emoji("emoji", emojis[0], cx + r * 1.0, cy - r * 1.3, r * 0.5, 12), ...badge(m * 0.6, m * 0.6, u * 0.22),
      ...(land ? block(m, colW, m, H - m, "center", "left") : block(m, W - 2 * m, 0, H - m * 0.9, "bottom", "center"))];
  } else if (style === "studio") {
    background = S(pal.bg); const panel = G(160, pal.primary, shade(pal.primary, 0.55));
    if (land) { const sz = H * 0.78; layers = [R("accent", "rect", W * 0.46, -H * 0.2, W * 0.75, H * 1.4, panel, { rotation: 8 }), A("art", "dots", W * 0.5, 0, W * 0.5, H, "#FFFFFF", "#FFFFFF", 9, 0.12), illoLayer(W * 0.74 - sz / 2, H / 2 - sz / 2, sz, -6), emoji("emoji", emojis[0], W * 0.48, H - m - box, sticker, -8), ...badge(m * 0.6, m * 0.6, u * 0.22), ...block(m, W * 0.44 - m, m, H - m, "center", "left")];
    } else { const Th = H - m * 0.9 - blockH() - m * 0.4, sz = Math.max(u * 0.2, Math.min(W * 0.74, Th - m * 0.8));
      layers = [R("accent", "rect", -W * 0.15, -Th * 0.15, W * 1.3, Th * 1.1, panel, { rotation: -4 }), A("art", "dots", 0, 0, W, Th, "#FFFFFF", "#FFFFFF", 9, 0.12), illoLayer(W / 2 - sz / 2, Th / 2 - sz / 2 + m * 0.1, sz, 5), emoji("emoji", emojis[0], W - m - box, Th - box * 0.9, sticker, 10), ...badge(m * 0.6, m * 0.6, u * 0.22), ...block(m, W - 2 * m, 0, H - m * 0.9, "bottom", "left")]; }
  } else if (style === "clean") {
    const tint = mix(pal.primary, "#FFFFFF", 0.92); P = { bg: tint, primary: "#17131A", secondary: shade(pal.primary, 0.62), text: "#17131A", gold: pal.primary }; background = S(tint); const blob = G(160, pal.primary, shade(pal.primary, 0.7));
    if (land) { const sz = H * 0.62; layers = [R("accent", "ellipse", W * 0.5, -H * 0.1, H * 1.05, H * 1.05, blob), A("art", "dots", 0, 0, W * 0.4, H * 0.5, pal.primary, pal.primary, 6, 0.14), illoLayer(W * 0.5 + H * 0.525 - sz / 2, H * 0.425 - sz / 2, sz, 0), emoji("emoji", emojis[0], W * 0.5, H - m - box, sticker, -8), ...badge(m * 0.6, m * 0.6, u * 0.22), ...block(m, W * 0.46 - m, m, H - m, "center", "left")];
    } else { const Th = H - m * 0.9 - blockH() - m * 0.4, dia = Math.min(W * 0.95, Th * 1.05), sz = Math.max(u * 0.2, Math.min(W * 0.55, dia * 0.7)), bx = W * 0.12, by = -dia * 0.12;
      layers = [R("accent", "ellipse", bx, by, dia, dia, blob), A("art", "dots", 0, 0, W * 0.45, Th * 0.6, pal.primary, pal.primary, 6, 0.14), illoLayer(bx + dia / 2 - sz / 2, Math.min(by + dia / 2 - sz / 2, Th - sz - m * 0.4), sz, 4), emoji("emoji", emojis[0], m * 0.8, Th - box, sticker, -10), ...badge(m * 0.6, m * 0.6, u * 0.22), ...block(m, W - 2 * m, 0, H - m * 0.9, "bottom", "left")]; }
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
      ...pill("hook", c.hook, m, m, hw, chs, pal.gold, onColor(pal.gold), -3), T("headline", c.headline, m, headY, hw, hh, hs, pal.text, "left", { bold: true, autoFit: true, fitMax: Math.round(hs) }),
      T("subtitle", c.subtitle, m, headY + hh + u * 0.015, hw, Math.round(ss * 2.7), ss, pal.secondary, "left", { autoFit: true, fitMax: Math.round(ss) }),
      emoji("emoji", emojis[0], land ? W - m - u * 0.5 : W - m - u * 0.42, land ? H * 0.2 : H * 0.47 - u * 0.1, u * 0.3, 8), emoji("emoji2", emojis[1] ?? "✨", land ? W * 0.62 : W * 0.46, land ? H * 0.62 : H * 0.57, u * 0.12, -10), ...badge(land ? W - m - u * 0.5 : W - m - u * 0.24, land ? H * 0.58 : H * 0.36, u * 0.22),
      ...pill("cta", ctaT, m, ctaY, hw, cs, pal.gold, onColor(pal.gold))];
    void ctaW;
  }
  return { background, layers };
}
export const emotionFor = (text: string, fallback: EmotionId): EmotionId => /\b(sale|% ?off|discount|hurry|limited|last chance|today only|clearance)\b|\d\s?%/i.test(text) ? "urgency" : /\b(love|wedding|valentine|mum|mom|mother|gift|anniversary|birthday)\b/i.test(text) ? "love" : /\b(luxury|premium|exclusive|gold|diamond|vip)\b/i.test(text) ? "luxury" : /\b(fresh|organic|farm|healthy|natural|green|vegan)\b/i.test(text) ? "fresh" : /\b(party|concert|festival|live|night|tickets)\b/i.test(text) ? "excitement" : fallback;
export function instantiate(t: Template, opts: { id?: string; name?: string; copy?: Partial<Copy>; emotion?: EmotionId; photo?: LayoutInput["photo"]; font?: string; illo?: string } = {}): Project {
  const now = new Date().toISOString(), emo = EMOTIONS[opts.emotion ?? t.emotion], copy = { ...t.copy, ...opts.copy }, palette = emo.palette, emojis = emo.emojis;
  const { background, layers } = layoutFor({ style: t.style, palette, emojis, W: t.width, H: t.height, copy, art: emo.art, font: opts.font, photo: opts.photo, illo: opts.illo ?? t.illo });
  const meta: ProjectMeta = { templateId: t.id, style: t.style, emotion: emo.id, emojis, palette, art: emo.art, needsPhoto: t.needsPhoto, font: opts.font, illo: opts.illo ?? t.illo };
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
export function recommendTemplate(text: string, o: { photo?: boolean; pick?: number } = {}): Template {
  const cat = KEYS.find(([, re]) => re.test(text))?.[0] ?? "product-launch", list = TEMPLATES.filter(t => t.category === cat && t.needsPhoto === !!o.photo);
  return list[(o.pick ?? 0) % list.length] ?? TEMPLATES.find(t => t.category === cat)!;
}
