import type { Layer, Project } from "@adforge/creative-schema";
export type Category = "product-launch" | "retail" | "food" | "fashion" | "events" | "education" | "technology" | "real-estate" | "services" | "offers";
export interface Palette { bg: string; primary: string; secondary: string; text: string; gold: string }
export interface Template { id: string; name: string; category: Category; tags: string[]; width: number; height: number; layout: "split" | "centered" | "banner"; palette: Palette;
  copy: { headline: string; subtitle: string; cta: string }; fields: ("headline" | "subtitle" | "cta")[]; animation: "fade-up" | "slide-left" | "zoom-in" }
const P = {
  midnight: { bg: "#0B1026", primary: "#7C3AED", secondary: "#22D3EE", text: "#FFFFFF", gold: "#D4AF37" },
  warm: { bg: "#2A1208", primary: "#E4572E", secondary: "#FFC857", text: "#FFF6E9", gold: "#D4AF37" },
  forest: { bg: "#0D2B22", primary: "#2E9E6B", secondary: "#B8F2D0", text: "#F2FFF8", gold: "#D4AF37" },
  rose: { bg: "#2B0F1E", primary: "#D6336C", secondary: "#FFC9DE", text: "#FFF5F9", gold: "#D4AF37" },
  slate: { bg: "#111827", primary: "#2563EB", secondary: "#93C5FD", text: "#F9FAFB", gold: "#D4AF37" },
  ink: { bg: "#14110F", primary: "#C8A24A", secondary: "#E8D8A8", text: "#FAF7F0", gold: "#D4AF37" },
} satisfies Record<string, Palette>;
const T = (id: string, name: string, category: Category, tags: string[], [width, height]: [number, number], layout: Template["layout"], palette: Palette, headline: string, subtitle: string, cta: string, animation: Template["animation"]): Template =>
  ({ id, name, category, tags, width, height, layout, palette, copy: { headline, subtitle, cta }, fields: ["headline", "subtitle", "cta"], animation });
export const TEMPLATES: Template[] = [
  T("launch-nova", "Nova Launch", "product-launch", ["launch", "new", "product"], [1080, 1080], "split", P.midnight, "Meet Your New Product", "Introduce what makes it different.", "Learn more", "zoom-in"),
  T("retail-weekend", "Weekend Retail", "retail", ["shop", "store", "promotion"], [1080, 1920], "centered", P.slate, "This Weekend In Store", "Add your products and opening hours.", "Visit us", "fade-up"),
  T("food-fresh", "Fresh Kitchen", "food", ["restaurant", "menu", "meal"], [1080, 1080], "split", P.warm, "Fresh From Our Kitchen", "Tell people about today's special.", "Order now", "slide-left"),
  T("fashion-edit", "The Edit", "fashion", ["style", "clothing", "collection"], [1080, 1920], "centered", P.rose, "The New Collection", "Describe the look and where to find it.", "Shop the look", "fade-up"),
  T("event-night", "Event Night", "events", ["event", "party", "tickets"], [1080, 1080], "centered", P.midnight, "Join Us Live", "Add the date, venue and time.", "Reserve a spot", "zoom-in"),
  T("edu-enrol", "Enrolment Open", "education", ["school", "course", "class"], [1920, 1080], "banner", P.forest, "Enrolment Is Open", "Share the course, start date and level.", "Enrol today", "slide-left"),
  T("tech-launch", "Tech Spotlight", "technology", ["app", "software", "gadget"], [1920, 1080], "banner", P.slate, "Built For How You Work", "Explain the one feature that matters most.", "Get started", "fade-up"),
  T("realestate-open", "Property Showcase", "real-estate", ["property", "house", "rent"], [1080, 1080], "split", P.ink, "Find Your Next Home", "Add the location, size and key features.", "Book a viewing", "slide-left"),
  T("service-local", "Local Service", "services", ["business", "repair", "salon"], [1080, 1080], "centered", P.forest, "Reliable Service Near You", "Say what you do and how to reach you.", "Contact us", "fade-up"),
  T("offer-special", "Special Offer", "offers", ["sale", "discount", "deal"], [1080, 1920], "centered", P.warm, "Your Offer Here", "Only add an offer you can honour.", "Claim offer", "zoom-in"),
];
const base = { rotation: 0, opacity: 1 };
const text = (name: string, t: string, x: number, y: number, w: number, h: number, size: number, color: string, align: "left" | "center", fit = false): Layer =>
  ({ ...base, id: name, name, type: "text", text: t, x, y, w, h, fontFamily: "Inter, Arial, sans-serif", fontSize: Math.round(size), color, align, lineHeight: 1.15, letterSpacing: 0, ...(fit ? { autoFit: true, fitMax: Math.round(size) } : {}) });
const rect = (name: string, shape: "rect" | "ellipse", x: number, y: number, w: number, h: number, color: string, opacity = 1, r = 0): Layer =>
  ({ ...base, id: name, name, type: "shape", shape, x, y, w, h, fill: { kind: "solid", color }, opacity, cornerRadius: r });
export function buildLayers(t: Template, copy = t.copy): Layer[] {
  const { width: w, height: h, palette: c } = t, m = w * 0.08, centered = t.layout === "centered", banner = t.layout === "banner";
  const cw = banner ? w * 0.5 : w * 0.84, align = centered ? "center" : "left", x = centered ? w * 0.08 : m;
  const ctaW = Math.min(w * 0.4, 420), ctaH = Math.max(80, h * 0.07), s = Math.min(w, h);
  const out: Layer[] = [rect("accent", "ellipse", w * 0.52, h * (banner ? 0.1 : 0.55), s * 0.7, s * 0.7, c.primary, 0.85)];
  if (!centered) out.push({ ...base, id: "image", name: "image", type: "image", assetId: "placeholder", fit: "cover", x: banner ? w * 0.58 : m, y: banner ? h * 0.12 : h * 0.52, w: banner ? w * 0.34 : w * 0.44, h: banner ? h * 0.7 : h * 0.3 });
  out.push(text("headline", copy.headline, x, h * 0.08, cw, h * (banner ? 0.4 : 0.26), s * 0.085, c.text, align, true));
  out.push(text("subtitle", copy.subtitle, x, h * (banner ? 0.52 : 0.36), cw * (centered ? 1 : 0.75), h * 0.12, s * 0.036, c.secondary, align, true));
  const cx = centered ? (w - ctaW) / 2 : m, cy = h * 0.86;
  out.push(rect("cta-bg", "rect", cx, cy, ctaW, ctaH, c.gold, 1, 12));
  out.push(text("cta", copy.cta, cx, cy + ctaH * 0.22, ctaW, ctaH * 0.6, s * 0.032, "#14110F", "center"));
  return out;
}
export function instantiate(t: Template, opts: { id?: string; name?: string; copy?: Partial<Template["copy"]> } = {}): Project {
  const now = new Date().toISOString();
  return { schemaVersion: 2, id: opts.id ?? globalThis.crypto.randomUUID(), type: "image", name: opts.name ?? t.name, createdAt: now, updatedAt: now,
    canvas: { width: t.width, height: t.height, background: { kind: "solid", color: t.palette.bg } },
    assets: [{ id: "placeholder", kind: "image", mime: "image/png", name: "Image placeholder" }], layers: buildLayers(t, { ...t.copy, ...opts.copy }) };
}
export function searchTemplates(query = "", category?: Category): Template[] {
  const q = query.trim().toLowerCase();
  return TEMPLATES.filter(t => (!category || t.category === category) && (!q || [t.name, t.category, ...t.tags].some(s => s.toLowerCase().includes(q))));
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
/** Pick a starter template from free text (keywords only, no AI). Falls back to a product launch layout. */
export function recommendTemplate(text: string): Template {
  const cat = KEYS.find(([, re]) => re.test(text))?.[0] ?? "product-launch";
  return TEMPLATES.find(t => t.category === cat) ?? TEMPLATES[0];
}
