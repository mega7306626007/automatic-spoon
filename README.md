# AdForge
Local-first advertising studio (web + Android). No accounts, API keys or backend required.

## Status
**Done (verified: unit tests, typecheck, `next build`)**
- `packages/creative-schema`: versioned project format (v2), validation, v1→v2 migration, geometry, resize, text-overflow estimate.
- `apps/web` (Stage 2, first slice): editable SVG canvas; add text/rect/ellipse; select, drag, edit properties, reorder, duplicate, delete; undo/redo (Ctrl+Z / Ctrl+Shift+Z); autosave + draft recovery (IndexedDB); resize to Square/Story/Banner; project export/import (JSON, validated); PNG/JPEG export.

- `packages/template-library`: 10 original parametric templates across the 10 required categories (editable layers named headline/subtitle/cta/image), `instantiate`, `searchTemplates`. Tests check validity, in-canvas placement and no default text overflow.
- `packages/ai-orchestrator`: `CreativeProvider` interface; deterministic offline engine (English, Kiswahili; Sheng flagged as unevaluated); consent-gated, text-only online adapter with injected fetch; `validateCopy` rejects invented figures/claims; fallback orchestration. Tests cover offline use, no-consent, provider failure, invalid output.

**Not done / not verified**
- Templates and the AI copilot are libraries only: **not yet wired into the web UI** (no gallery, no copilot panel).
- Templates are simple parametric layouts; their visual quality has not been reviewed by a person.
- Kiswahili phrases have not been reviewed by a native speaker. No local language model integrated yet.
- PNG/JPEG export and drag editing are implemented but not yet browser-tested by me. Please try them.
- No resize handles, image upload/crop, gradients, snapping/guides, text wrapping, templates, brand kits, PWA, AI copilot, video studio.
- Android app: not started.

## Commands
    npm install
    npm test                      # all workspaces
    npm run dev -w @adforge/web   # http://localhost:3000
    npm run build -w @adforge/web
