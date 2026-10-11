# AdForge
Local-first advertising studio (web + Android). No accounts, API keys or backend required.

## Status
**Done (verified: unit tests, typecheck, `next build`)**
- `packages/creative-schema`: versioned project format (v2), validation, v1→v2 migration, geometry, resize, text-overflow estimate.
- `apps/web` (Stage 2, first slice): editable SVG canvas; add text/rect/ellipse; select, drag, edit properties, reorder, duplicate, delete; undo/redo (Ctrl+Z / Ctrl+Shift+Z); autosave + draft recovery (IndexedDB); resize to Square/Story/Banner; project export/import (JSON, validated); PNG/JPEG export.

**Not done / not verified**
- PNG/JPEG export and drag editing are implemented but not yet browser-tested by me. Please try them.
- No resize handles, image upload/crop, gradients, snapping/guides, text wrapping, templates, brand kits, PWA, AI copilot, video studio.
- Android app: not started.

## Commands
    npm install
    npm test                      # all workspaces
    npm run dev -w @adforge/web   # http://localhost:3000
    npm run build -w @adforge/web
