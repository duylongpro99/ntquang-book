---
name: cris-re-ia
description: Step 03 of the reverse-engineering pipeline. Build the information architecture of a reference webapp - navigation sitemap, screen inventory with per-screen states, orphan route list, and the small set of layout patterns that actually repeat. Use after cris-re-domain, or when the user asks for a screen map / sitemap / "ban do man hinh" / IA of a reference product.
---

# cris-re-ia — the screen map

Read `../cris-reverse-engineer/references/conventions.md` first.

**Input:** `routes.txt`, `features.csv`, `entities.csv`.

## Procedure

### 1. sitemap.md

The navigation tree as a user experiences it: primary nav, secondary nav, contextual entry
points, modal-only surfaces. Mermaid or nested list. Mark depth — anything at depth 4+ is a
findability problem worth noting for `cris-re-ux`.

### 2. screens.csv

One row per screen. Use `templates/screens.csv`. Columns:

`id, route, name, pattern, purpose, primary_entity, primary_actions, secondary_actions,
 empty, loading, error, forbidden, overflow, source, confidence`

The five state columns are the point. For each screen, record what happens when:
- `empty` — no data yet (first-run). Capture the exact copy if observed.
- `loading` — skeleton, spinner, blocking, or optimistic?
- `error` — inline, toast, full-page, retry offered?
- `forbidden` — hidden entirely, or shown-but-disabled with an upsell?
- `overflow` — 10,000 rows: pagination, virtualization, forced filter, or it just dies?

Most teams design the happy state and discover the other five in production. Recording them
from the reference is free reconnaissance.

Expect **40-80 rows**.

### 3. orphan-routes.md

Routes in `routes.txt` with no inbound link from the navigation tree. Categorize each:
admin-only, legacy/dead, feature-flagged, deep-link-only target, internal/debug.

This list is consistently one of the most interesting outputs of the whole pipeline.

### 4. patterns.md

Classify every screen into a layout pattern. Most webapps use 5-7:

`list-detail` · `dashboard` · `wizard` · `settings-form` · `builder/canvas` · `feed/timeline`
· `detail-with-tabs` · `split-pane`

For each pattern: which screens use it, what the shared skeleton is, what varies.

**This is the leverage.** Designing 6 patterns well beats designing 60 screens badly, and it
is what makes `cris-re-ui` a days-long job rather than a months-long one.

## Output

`out/<slug>/03-ia/` : `sitemap.md`, `screens.csv`, `orphan-routes.md`, `patterns.md`.

## Definition of done

- Every route has exactly one `screens.csv` row, or an `orphan-routes.md` entry.
- Every `features.csv` row with a UI maps to at least one screen.
- Every screen is assigned a pattern; if more than 8 patterns emerge, you are over-splitting —
  merge.
- MANIFEST.md updated with screen count, orphan count, pattern count.
