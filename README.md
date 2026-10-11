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

**Not verified: I could not run a real browser in my environment.** Drag/resize/rotate, image upload, PNG/JPEG export correctness, IndexedDB recovery and the service worker need a manual pass. Please test and report problems.

**Not built**
- Video studio / MP4 export; Android app; local language model; custom font upload; multi-select; visual quality of templates is unreviewed; Kiswahili copy is unreviewed by a native speaker; Sheng unsupported.

## Commands
    npm install
    npm test                      # all workspaces
    npm run dev -w @adforge/web   # http://localhost:3000
    npm run build -w @adforge/web
