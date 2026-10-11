export type Language = "en" | "sw" | "sheng";
export type Tone = "professional" | "friendly" | "urgent" | "luxury" | "playful";
export interface Brief { product: string; audience?: string; objective?: string; platform?: string; tone: Tone; language: Language | string; offer?: string; price?: string; cta?: string; brandName?: string; constraints?: string }
export interface CopyResult { headlines: string[]; supporting: string[]; hooks: string[]; ctas: string[]; captions: string[]; hashtags: string[]; notes: string[] }
export interface Scene { title: string; durationMs: number; onScreenText: string; visual: string }
export interface Campaign { copy: CopyResult; assets: { kind: "poster" | "square" | "story" | "banner" | "video"; templateCategory: string; headline: string }[] }
export interface CreativeProvider { id: string; kind: "local-fallback" | "local-model" | "online";
  checkAvailability(): Promise<{ available: boolean; reason?: string }>;
  generateCopy(b: Brief): Promise<CopyResult>; generateCampaign(b: Brief): Promise<Campaign>; generateVideoScript(b: Brief): Promise<Scene[]>;
  rewriteText(text: string, tone: Tone, language: Language | string): Promise<string>; suggestLayouts(b: Brief): Promise<string[]> }
export class ConsentRequiredError extends Error { constructor() { super("User consent required before sending content to an online provider"); } }

// ---------- validation: never invent facts ----------
const RISKY = /\b(guarantee[sd]?|certified|clinically|proven|#1|number one|best in|award[- ]winning|testimonial|risk[- ]free|free)\b/i;
const factText = (b: Brief) => [b.product, b.offer, b.price, b.cta, b.brandName, b.constraints, b.objective, b.audience].filter(Boolean).join(" ");
export function validateCopy(c: CopyResult, b: Brief): string[] {
  const issues: string[] = [], facts = factText(b).toLowerCase(), all = [...c.headlines, ...c.supporting, ...c.hooks, ...c.ctas, ...c.captions];
  for (const s of all) {
    if (s.length > 280) issues.push(`too long: ${s.slice(0, 30)}…`);
    for (const m of s.match(/\d[\d.,%]*|[$€£]|KES|Ksh/gi) ?? []) if (!facts.includes(m.toLowerCase())) issues.push(`unsupported figure "${m}"`);
    const risky = s.match(RISKY); if (risky && !facts.includes(risky[0].toLowerCase())) issues.push(`unsupported claim "${risky[0]}"`);
  }
  if (!c.headlines.length) issues.push("no headlines");
  return issues;
}
export function parseModelOutput(raw: string): CopyResult | null {
  try { const j = JSON.parse(raw.replace(/^```json|```$/g, "").trim()), keys = ["headlines", "supporting", "hooks", "ctas", "captions", "hashtags"] as const;
    for (const k of keys) if (!Array.isArray(j[k]) || !j[k].every((s: unknown) => typeof s === "string")) return null;
    return { ...Object.fromEntries(keys.map(k => [k, j[k].slice(0, 10)])), notes: [] } as unknown as CopyResult; } catch { return null; }
}

// ---------- deterministic local engine (no network) ----------
const tag = (s: string) => "#" + s.replace(/[^\p{L}\p{N}]+/gu, "");
type Phrases = { head: (p: string, t: Tone) => string[]; sup: (p: string, a?: string) => string[]; hook: (p: string) => string[]; cta: string[]; cap: (p: string) => string[] };
const L: Record<"en" | "sw", Phrases> = {
  en: { head: (p, t) => ({ professional: [`${p}, done right`, `Introducing ${p}`], friendly: [`Say hello to ${p}`, `${p} is here for you`], urgent: [`${p} — don't miss out`, `Time to try ${p}`], luxury: [`${p}. Refined.`, `Discover ${p}`], playful: [`Ready for ${p}?`, `${p} just got fun`] })[t],
    sup: (p, a) => [`${p}${a ? ` made for ${a}` : ""}.`, `See what ${p} can do for you.`], hook: p => [`What if ${p} made your day easier?`, `Looking for ${p}?`], cta: ["Learn more", "Get in touch", "Order now"], cap: p => [`Say hello to ${p}. Tell us what you think!`] },
  sw: { head: (p, t) => ({ professional: [`${p}, kwa ubora`, `Karibu kwenye ${p}`], friendly: [`Karibu ${p}`, `${p} ni kwa ajili yako`], urgent: [`${p} — usikose`, `Jaribu ${p} leo`], luxury: [`${p}. Ubora wa hali ya juu.`, `Gundua ${p}`], playful: [`Uko tayari kwa ${p}?`, `${p} imewasili`] })[t],
    sup: (p, a) => [`${p}${a ? ` kwa ${a}` : ""}.`, `Tazama ${p} inavyoweza kukusaidia.`], hook: p => [`Je, ${p} inaweza kurahisisha siku yako?`, `Unatafuta ${p}?`], cta: ["Wasiliana nasi", "Jifunze zaidi", "Agiza sasa"], cap: p => [`Karibu ${p}. Tuambie unaonaje!`] },
};
export const deterministicProvider: CreativeProvider = {
  id: "deterministic", kind: "local-fallback",
  async checkAvailability() { return { available: true }; },
  async generateCopy(b) {
    const notes: string[] = []; let lang: "en" | "sw" = "en";
    if (b.language === "sw") lang = "sw";
    else if (b.language === "sheng") { lang = "sw"; notes.push("Sheng is not evaluated. Output is plain Kiswahili; edit it for street Sheng yourself."); }
    else if (b.language !== "en") notes.push(`Language "${b.language}" is not supported; used English.`);
    const d = L[lang], p = b.product.trim(), name = b.brandName?.trim();
    const sup = d.sup(p, b.audience?.trim()); if (b.offer) sup.push(b.offer.trim()); if (b.price) sup.push(b.price.trim());
    return { headlines: d.head(p, b.tone), supporting: sup, hooks: d.hook(p), ctas: b.cta ? [b.cta.trim(), ...d.cta] : [...d.cta], captions: d.cap(p).map(s => b.offer ? `${s} ${b.offer.trim()}` : s),
      hashtags: [...new Set([tag(p), ...(name ? [tag(name)] : []), ...(b.platform ? [tag(b.platform)] : [])])].filter(h => h.length > 1), notes };
  },
  async generateCampaign(b) { const copy = await this.generateCopy(b), h = copy.headlines[0];
    return { copy, assets: [{ kind: "poster", templateCategory: "product-launch", headline: h }, { kind: "square", templateCategory: "product-launch", headline: h }, { kind: "story", templateCategory: "retail", headline: copy.headlines[1] ?? h }, { kind: "banner", templateCategory: "technology", headline: h }, { kind: "video", templateCategory: "product-launch", headline: h }] }; },
  async generateVideoScript(b) { const c = await this.generateCopy(b);
    return [{ title: "Hook", durationMs: 2500, onScreenText: c.hooks[0], visual: "Product or logo on brand background" }, { title: "Benefit", durationMs: 3000, onScreenText: c.supporting[0], visual: "Your product photo" }, { title: "Call to action", durationMs: 2500, onScreenText: c.ctas[0], visual: "Logo and contact details" }]; },
  async rewriteText(t, tone) { const s = t.trim().replace(/\s+/g, " "); return tone === "urgent" ? s.replace(/[.!?]*$/, "!") : tone === "luxury" ? s.replace(/!+$/, ".") : s; },
  async suggestLayouts(b) { return /story|status|tiktok|reel/i.test(b.platform ?? "") ? ["retail-weekend", "fashion-edit", "offer-special"] : ["launch-nova", "event-night", "service-local"]; },
};

// ---------- optional online adapter: explicit consent, text-only, injected fetch ----------
export function onlineProvider(cfg: { id?: string; endpoint: string; apiKey?: string; consentGranted: () => boolean; fetchImpl?: typeof fetch }): CreativeProvider {
  const f = cfg.fetchImpl ?? ((...a: Parameters<typeof fetch>) => fetch(...a));
  return { ...deterministicProvider, id: cfg.id ?? "online", kind: "online",
    async checkAvailability() { return cfg.consentGranted() ? { available: true } : { available: false, reason: "No consent to send data online" }; },
    async generateCopy(b) { if (!cfg.consentGranted()) throw new ConsentRequiredError();
      const res = await f(cfg.endpoint, { method: "POST", headers: { "Content-Type": "application/json", ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}) }, body: JSON.stringify({ brief: b }) });
      if (!res.ok) throw new Error(`provider error ${res.status}`);
      const parsed = parseModelOutput(await res.text()); if (!parsed) throw new Error("invalid model output"); return parsed; } };
}

// ---------- orchestrator: try providers in order; always fall back to deterministic ----------
export async function generateCopyWithFallback(providers: CreativeProvider[], b: Brief): Promise<{ copy: CopyResult; providerId: string; notes: string[] }> {
  const notes: string[] = [];
  for (const p of providers.filter(x => x.id !== deterministicProvider.id)) {
    try { const a = await p.checkAvailability(); if (!a.available) { notes.push(`${p.id} unavailable: ${a.reason ?? "unknown"}`); continue; }
      const copy = await p.generateCopy(b), issues = validateCopy(copy, b);
      if (issues.length) { notes.push(`${p.id} output rejected: ${issues[0]}`); continue; } return { copy, providerId: p.id, notes }; }
    catch (e) { notes.push(`${p.id} failed: ${(e as Error).message}`); }
  }
  const copy = await deterministicProvider.generateCopy(b); return { copy, providerId: deterministicProvider.id, notes: [...notes, ...copy.notes] };
}
