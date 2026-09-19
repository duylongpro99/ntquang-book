# Phase 4 — Branding / Theme via CMS (as-built record)

> Status: **implemented & verified** (unit + typecheck + lint). Live "edit-in-Strapi"
> check pending a running CMS. Date: 2026-09-19. Owner: long.dao@maritime-ds.com.
> Implements Phase 4 of [`cms-plan.md`](./cms-plan.md).

## Goal (as shipped)

The brand **palette** is now rendered server-side from the Strapi `branding`
single type, replacing the hardcoded color tokens in `globals.css` and the
`DEFAULT_THEME`/`localStorage` client path. The per-visitor **light/dark toggle**
is unchanged (`.dark` class + `localStorage`). Scope was **palette-only** —
`logo` / `siteTitle` / `siteDescription` on the branding type are deliberately
left for a later task.

## Architecture (as built)

```
Strapi branding (singleType)          frontend/app/layout.tsx (RSC)
  light / dark theme-tokens  ──►  getBranding()  ──►  generateThemeCss(theme)
  (16 fields, 1:1 ColorTokens)     (map + fallback)     └─► <style> in <head>
                                                            :root {light}
                                                            .dark  {dark}   ← toggled by ThemeToggle
                                                              ▼
                                            CSS vars → Tailwind @theme → components
```

- Palette CSS is **server-rendered into `<head>`**, so there is no flash of
  unstyled content and the CMS is the single source of truth.
- `getBranding()` **falls back to `DEFAULT_THEME`** on any fetch error or
  missing data, so the site always renders a complete palette even if the CMS
  is unreachable.
- The dead client-side theme provider and preset switcher were removed (real
  palette management lives in Strapi admin, not per-visitor localStorage).

## CMS side (pre-existing from Phases 1–2, consumed here)

- `branding` single type: `name`, `description`, `accentLabel`, `light`/`dark`
  (`branding.theme-tokens` component, 16 required fields matching `ColorTokens`
  1:1), plus `logo`/`siteTitle`/`siteDescription` (unused in Phase 4).
- Public `find` permission already granted (`cms/src/index.ts`).
- Seed step `cms/scripts/seed/steps/branding.ts` populates it from `DEFAULT_THEME`.

## Files changed

| File | Change |
|---|---|
| `frontend/src/lib/cms/branding.ts` | **new** — `getBranding(): Promise<ThemeConfig>`; fetch `/branding` (populate `light`,`dark`; tag `["branding"]`); map + `DEFAULT_THEME` fallback |
| `frontend/src/lib/cms/branding.test.ts` | **new** — mapping, fetch-failure fallback, empty-data fallback |
| `frontend/src/lib/cms/mappers.ts` | added `mapBranding` + `mapTokens` (16-field 1:1); import `ColorTokens`/`ThemeConfig` |
| `frontend/src/lib/cms/index.ts` | re-export `./branding` |
| `frontend/app/layout.tsx` | fetch branding with categories; inject `generateThemeCss(theme)` `<style>` in `<head>`; removed `CmsThemeProvider` wrapper |
| `frontend/app/globals.css` | removed hardcoded `:root`/`.dark` token blocks (kept `@theme`, base html/body, fonts) |
| `frontend/src/config/theme.ts` | removed unused `CMS_PRESET_THEMES` (kept `ColorTokens`, `ThemeConfig`, `DEFAULT_THEME` as fallback, `generateThemeCss` now used) |
| `frontend/src/components/global/CmsThemeManager.tsx` | **deleted** — dead/broken client provider (light-only, dark never applied, no driving UI beyond the removed card) |
| `frontend/app/tai-khoan/thong-tin/page.tsx` | removed the "CMS Brand Theme" preset-switcher card + its `useCmsTheme`/`Check`/`Palette` imports |

Net: 7 modified, 2 added, 1 deleted (~66 insertions / ~345 deletions).

## Key decisions

1. **Server-inject over client provider.** The prior `CmsThemeProvider` only set
   *light* tokens on mount (dark never handled) and read a `localStorage` preset
   id no UI set. Server-rendering the token CSS is simpler, SSR-correct, FOUC-free,
   and makes the CMS the single source of truth.
2. **Palette-only scope.** Satisfies the phase's "Done when" (editing branding
   changes the palette). `logo`/`siteTitle`/`siteDescription` deferred.
3. **Remove the preset switcher.** A per-visitor client palette override
   contradicts CMS-as-source-of-truth; the card was a mock of what Strapi admin
   now does for real. (Chosen over keeping it read-only or functional.)
4. **Time-based revalidation for now.** Tag `["branding"]` + ISR `revalidate`
   satisfies "after revalidate". On-demand `revalidateTag` webhook stays Phase 6.

### Correction logged during implementation

Initial claim that `useCmsTheme` had no consumers was wrong — the account page
(`tai-khoan/thong-tin/page.tsx`) used it via the preset card (the first grep
covered `src/` but not `app/`). Caught before deleting the provider; resolved by
removing the card per decision (3).

## Verification

- ✅ `npx tsc --noEmit` — clean
- ✅ Biome — clean on all changed TS/TSX files (pre-existing repo lint noise and
  Tailwind-directive parse warnings in `globals.css` are unrelated)
- ✅ `npm test` (vitest) — **26 passed**, incl. 3 new branding tests
- ⏳ **Pending (needs running Strapi):** edit branding in Strapi admin → confirm
  the deployed palette changes after revalidate, and light/dark toggle still works.
  Strapi not running locally and only `.env.example` present (`CMS_URL=http://localhost:1337`).

## Follow-ups

- Wire `logo` + `siteTitle`/`siteDescription` (Next metadata + `AppHeader`).
- On-demand revalidation webhook for `branding` (Phase 6).
- Run the live edit-in-Strapi verification once the CMS is booted + seeded.
