# AdForge
Local-first advertising studio (web + Android). No accounts, API keys or backend required.

## Status
**Done (unit-tested logic, typecheck, production build, server renders)**
- `packages/creative-schema`: versioned project format (v2), validation, v1→v2 migration, geometry, resize.
- `packages/template-library`: 10 original parametric templates (all required categories), search, instantiate.
- `packages/ai-orchestrator`: provider interface, offline copy engine (English, Kiswahili; Sheng flagged unevaluated), consent-gated text-only online adapter, fact/claim validation, fallback.
- `apps/web` (Next.js, strict TS): Home, Create (editor), Templates, Projects, Brand kits, AI Studio, Settings.
  - Editor: text/shapes/images (upload, downscale, crop-to-fill + focus), drag/resize/rotate handles, snapping + guides, text wrapping + overflow warnings, solid/gradient backgrounds and fills, borders, shadows, text backgrounds, layer order/hide/lock, undo/redo, keyboard shortcuts, custom sizes and format resize, PNG/JPEG export at 1x/2x.
  - Storage: IndexedDB; multiple projects, autosave, draft recovery, export/import of `.adforge.json` packages (images embedded), delete.
  - Brand kits: colours, font, logo, apply to open design / new template.
  - AI Studio: offline copy, apply-to-layer on click, "Create campaign" (Square/Story/Banner projects).
  - Installable PWA (manifest, icons, service worker; active on HTTPS) and responsive layout.

**Lively ad design system (new)**
- 20 templates: 10 categories x (photo layout + emoji/graphic layout). Four styles: full-photo hero, photo card, emoji burst, bold poster. Hook chips, emoji stickers, offer burst badges (only when an offer is typed), CTA pills, sunburst/waves/dots/confetti/bokeh art, photo shade gradients, rounded photo frames.
- 8 moods (Joy, Craving, Excitement, Trust, Luxury, Urgency, Fresh, Love): change palette, stickers, art and hook ideas; layout can be switched; resize/brand kit/mood all rebuild the arrangement and keep your words and photo.
- No stock photos are bundled (none can be redistributed from here): add your own photo, or use the graphic layouts. An empty photo area triggers a warning before export.
- Emoji stickers use the device's emoji font (Segoe UI Emoji / Apple / Noto), so they look different per platform.

**Automation**
- Home → "Describe your ad": one sentence in; template picked by keywords, offline copy written, brand kit applied, text auto-fitted, Story + Banner sizes created, captions saved. Prices/offers/dates appear only if typed.
- Auto-fit text (shrinks to the box, also while resizing), "Shrink to fit", align buttons, "Fix contrast automatically".
- Smart resize: re-lays out template-style designs for Post/Story/Banner (keeps copy, colours, fonts, photo; scales custom layers).
- Download all sizes as one ZIP (PNGs + captions.txt); "Make other sizes" creates them as projects.
- AI Studio: campaign (3 sizes), A/B headline variants, copy all captions. Brand kits: auto-colours from a logo.
- ZIP writer verified with Python `zipfile` and `unzip -t`.

**Not verified: I could not run a real browser in my environment.** Drag/resize/rotate, image upload, PNG/JPEG export correctness, IndexedDB recovery and the service worker need a manual pass. Please test and report problems.

**Not built**
- Video studio / MP4 export; Android app; local language model; custom font upload; multi-select; visual quality of templates is unreviewed; Kiswahili copy is unreviewed by a native speaker; Sheng unsupported.

## Commands
    npm install
    npm test                      # all workspaces
    npm run dev -w @adforge/web   # http://localhost:3000
    npm run build -w @adforge/web
