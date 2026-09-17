# CMS Build Plan — Sách Y Học Online

> Moving the frontend from **hardcoded TypeScript data** to a **CMS-managed** content system.
> Decided approach: **standalone headless CMS as a separate service** (primary target **Strapi 5**;
> **Directus** is a drop-in alternative — architecture is identical). Next.js consumes it over
> REST/GraphQL. Status: **planning — no code yet**. Owner: long.dao@maritime-ds.com.

---

## 1. Where we are today

The frontend (`frontend/`, Next.js 16 App Router + React 19 + Tailwind 4, server mode) renders
**pure hardcoded content** imported directly into pages:

| Source file | Export | Shape | Consumed by |
|---|---|---|---|
| `src/data/books.ts` (455 lines) | `BOOKS_DATA: Book[]`, `getBookBySlug()` | 25-field `Book` interface | home, `danh-muc`, `tim-kiem`, `thu-vien-sach`, `sach/[slug]`, GlobalSearch, account DataTable |
| `src/data/articles.ts` | `ARTICLES_DATA: Article[]`, `getArticleBySlug()` | `Article` w/ HTML `content` | `tin-tuc`, `tin-tuc/[slug]` |
| `src/data/categories.ts` | `CATEGORIES_TREE: CategoryItem[]` | 2-level tree w/ counts | MegaMenu, FilterSidebar, AppFooter, home, search |
| `src/config/theme.ts` | `DEFAULT_THEME`, `CMS_PRESET_THEMES` | `ThemeConfig` (light/dark token sets) | `CmsThemeManager` (reads `localStorage`) |
| `src/context/AuthContext.tsx` | `User`, `DownloadRecord` | mock login, in-memory downloads | account pages, download gating |

**Key facts that shape the plan**
- Pages import the arrays **directly** and call `.filter()/.find()` at render time. There is **no
  data-access layer** — every page is coupled to the in-memory array shape. Introducing one is the
  pivot of this migration.
- The `Book`/`Article`/`CategoryItem` **TypeScript interfaces are the de-facto content contract**.
  We keep them as the frontend-facing types and make the CMS conform to them (mapping layer), so the
  UI barely changes.
- Auth + downloads are **already needed** and currently mocked. A separate CMS gives us content but
  **not** these — Phase 5 wires them (Strapi Users & Permissions, or a thin auth of our own).
- Theme system was pre-built "CMS-ready" (comment in `theme.ts`). Phase 6 finishes that intent.
- Domain (from `out/**/02-domain`): entities are **Book, Category, Author, Article, User, Download,
  BookRequest** + branding. No payments/membership in MVP — downloads are **login-gated only**.

---

## 2. Target architecture

```
                    ┌────────────────────────┐
                    │  Strapi 5  (cms/)       │
   editors ───────► │  Admin UI + REST/GraphQL│
                    │  Postgres  +  media     │
                    └───────────┬────────────┘
                                │  REST/GraphQL (read)   + auth (JWT)
                                ▼
   visitors ──►  Next.js (frontend/)  ──►  src/lib/cms/  (data-access layer)
                 RSC pages fetch via the repository, never import CMS SDK directly
```

- **Monorepo**: add a top-level `cms/` package beside `frontend/` (repo is already a monorepo per
  commit `3eb1dc4`). Two deploys, one repo.
- **Boundary rule**: pages/components call **`src/lib/cms/*` repository functions** only. The Strapi
  fetch client + response→`Book` mapping live behind that boundary, so the CMS is swappable (Strapi
  ↔ Directus ↔ even back to static) without touching pages.
- **Rendering**: keep RSC + `fetch` with Next's cache/ISR (`revalidate`) so the site stays fast and
  the CMS isn't in the hot path of every request.

---

## 3. Content model (CMS side)

Map today's interfaces to Strapi collection types. Relations replace the denormalized string fields
(`categoryName`, `parentCategorySlug`, `bookTitle`…), and a mapping layer re-flattens them for the UI.

| Frontend type | Strapi collection | Notable fields / relations |
|---|---|---|
| `Book` | **book** | title, slug (uid), description (rich text), tableOfContents (repeatable/JSON), year, pages, fileSize, format (enum PDF/EPUB/Chm), language (enum), sku, rating + ratingCount, downloadCount, dateAdded, isFeatured, isNew; **relations**: category→**category**, author→**author**, publisher→**publisher** (or plain text v1); **media**: cover (image), file (the downloadable asset) |
| `Article` | **article** | title, slug, excerpt, content (rich text/blocks), publishedAt, readTime, cover (image); relation: category (article category — separate from book category), author→**author** |
| `CategoryItem` (tree) | **category** | name, slug (uid, path-style `noi-khoa/noi-tim-mach`), self-relation `parent`→category; `count` becomes **derived** (computed from related books), not stored |
| `Author` | **author** | name, slug, bio, avatar — lets `pa_tac-gia` archive pages work later |
| theme presets | **branding** (single type) | id, name, accentLabel, `light`/`dark` token groups (component), plus logo/site meta |
| `User` | **users-permissions user** (built-in) | + hospital, specialty, avatar, joinedDate |
| `DownloadRecord` | **download** | relations: user→user, book→book; downloadedAt; snapshot fields optional |
| BookRequest (Later) | **book-request** | title, language, requester, status (submitted/in_review/fulfilled/rejected) |

Draft/Publish enabled on **book** and **article**; roles: **Editor** (books/articles/categories) vs
**Admin** (branding, users, permissions).

---

## 4. Phases

Each phase is independently shippable and leaves the site working.

### Phase 0 — Foundations & scaffolding
**Goal:** CMS service exists and runs; nothing wired yet.
- Scaffold `cms/` (Strapi 5, TypeScript, Postgres for prod / SQLite for local dev).
- Decide hosting: Strapi on a small VM/Render/Railway + managed Postgres; media on S3-compatible
  storage (provider plugin) rather than local disk.
- Add `cms` to the monorepo scripts; document `dev`/`build`/`start` and env (`DATABASE_URL`,
  `APP_KEYS`, S3 creds, `STRAPI_URL`).
- Add `frontend` env: `CMS_URL`, `CMS_API_TOKEN` (read-only token for server-side fetch).
**Done when:** `admin` UI opens locally and in a deployed env; empty API responds.

### Phase 1 — Content model
**Goal:** collections mirror Section 3; typed and validated.
- Define collection types & components (book, article, category w/ self-relation, author, publisher,
  branding single type, download, book-request-Later).
- Enums, required fields, uid slugs, media fields; enable Draft/Publish on book & article.
- Generate/commit types; expose REST + GraphQL; create a **read-only API token** and public-read
  permissions for published content only.
**Done when:** an editor can hand-create one book + one article + a category and fetch them via API.

### Phase 2 — Migrate hardcoded data → CMS (one-time)
**Goal:** all existing content lives in the CMS, byte-faithful to today.
- Write a **seed script** (`cms/scripts/seed.ts`) that imports the current arrays
  (`books.ts`, `articles.ts`, `categories.ts`, theme presets) and creates entries via Strapi's
  API, resolving relations (category tree first, then authors/publishers, then books, then articles).
- Handle media: cover URLs are currently remote Unsplash links — either keep as external URL field
  v1, or download+upload to media library (decide in Phase 0). Book **download files** are
  placeholders today (`downloadUrl`) — flag which are real.
- Idempotent (re-runnable), keyed by slug/sku.
**Done when:** CMS row counts match the arrays; a diff of API output vs the arrays shows only
expected relation-shape changes.

### Phase 3 — Data-access layer + wire pages
**Goal:** pages read from the CMS; delete the hardcoded arrays.
- Build `src/lib/cms/`:
  - `client.ts` — fetch wrapper (base URL, token, Next `revalidate`, error handling).
  - `mappers.ts` — CMS response → existing `Book`/`Article`/`CategoryItem` types (re-flatten
    relations into `categorySlug`, `categoryName`, `parentCategorySlug`, etc. so the UI is untouched).
  - `books.ts` / `articles.ts` / `categories.ts` — the repository: `listBooks(filter)`,
    `getBookBySlug`, `searchBooks`, `listArticles`, `getArticleBySlug`, `getCategoryTree`. Move
    filtering/sorting/pagination that pages do in-memory **into query params** where it pays off.
- Replace imports page-by-page (home → detail → listing → search → account → footer/megamenu). Keep
  the `Book`/`Article`/`CategoryItem` interfaces exported from `src/lib/cms/types.ts`.
- Remove `src/data/*.ts` once no importer remains.
- Category `count` becomes a computed field from the API.
**Done when:** grep shows no `@/src/data/*` imports; all pages render identical content from the CMS;
ISR/caching verified.

### Phase 4 — Branding / theme via CMS
**Goal:** finish the pre-built "CMS-ready" theme intent.
- Fetch the **branding** single type server-side; feed tokens into `CmsThemeManager` /
  CSS variables instead of `DEFAULT_THEME` + `localStorage` preset lookup.
- Keep per-visitor light/dark toggle in `localStorage`; the **brand palette** now comes from the CMS.
**Done when:** editing branding in Strapi changes the deployed site's palette after revalidate.

### Phase 5 — Auth + downloads (the non-content backend)
**Goal:** replace mocked `AuthContext` with real, login-gated downloads.
- Use **Strapi Users & Permissions** (JWT): register/login, extend user with hospital/specialty/
  avatar/joinedDate.
- Gate the download endpoint: authenticated request → record a **download** entry, increment
  `downloadCount`, return a signed/short-lived file URL.
- "My library" (`tai-khoan/thu-vien`) reads the user's **download** records from the API.
- Rewire `AuthContext` to call the real endpoints; remove mock login.
**Done when:** an anonymous download prompts login; a logged-in download is recorded and appears in
My Library; counts increment.

### Phase 6 — Editorial UX, ops, hardening
**Goal:** production-ready for real editors.
- Roles/permissions (Editor vs Admin), preview of drafts, media library conventions, required-field
  validation, slug rules.
- Webhook → Next.js **on-demand revalidation** (`revalidateTag`) on publish, so edits go live fast.
- SEO/meta fields, sitemap from CMS, i18n readiness (content is Vietnamese; keep field for English
  where `language` = Song ngữ).
- CI: deploy `cms/` and `frontend/` independently; backups for Postgres + media; rate-limit/CORS.
- **Later**: BookRequest workflow (submit → in_review → fulfilled/rejected), Author archive pages.
**Done when:** an editor with no dev help can add a book (with cover + file), publish, and see it
live; drafts don't leak to the public API.

---

## 5. Cross-cutting decisions to lock in Phase 0

| Decision | Options | Default recommendation |
|---|---|---|
| CMS engine | Strapi 5 vs Directus | **Strapi 5** (editorial draft/publish + roles fit the medical content); Directus if you prefer DB-first |
| DB | Postgres vs MySQL | **Postgres** |
| Media storage | local disk vs S3-compatible | **S3-compatible** (survives redeploys, CDN-able) |
| Book covers | external URL field vs uploaded media | migrate to media library (external URLs are placeholder Unsplash today) |
| Fetch strategy | ISR `revalidate` + on-demand webhook | **both** |
| Auth home | Strapi U&P vs custom | **Strapi U&P** (one less service) |

---

## 6. Risks & watch-items
- **Relation re-flattening**: pages depend on denormalized fields (`categoryName`,
  `parentCategorySlug`, `bookTitle` in downloads). The mapper must reproduce these exactly or pages
  break subtly. Covered by Phase 3 mapper + the Phase 2 diff check.
- **In-memory filtering moves to the API**: search/filter/sort currently run client- or render-side
  over the full array. Pushing to query params changes pagination/perf characteristics — verify each
  listing page.
- **Download files are placeholders**: catalog has `downloadUrl`s but real book files may not exist.
  Confirm the actual asset source before Phase 5.
- **Two-service ops**: CORS, auth token handling, and independent deploys add surface area vs an
  embedded CMS — budget for it in Phase 0/6.
- **`count` drift**: category counts are hardcoded today; deriving them live must stay cheap (cache).

---

## 7. Suggested sequencing
Phase 0 → 1 → 2 → 3 unblock the **content** goal and can ship as a milestone (site fully
CMS-driven, still mocked auth). Phases 4–5 add branding + real auth/downloads. Phase 6 hardens for
handoff to editors. Phases 0–3 are the critical path; 4 is small; 5 is the largest single lift.
