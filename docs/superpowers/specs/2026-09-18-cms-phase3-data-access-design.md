# CMS Phase 3 — Data-Access Layer + Wire Pages (Design)

> Phase 3 of [`docs/cms-plan.md`](../../cms-plan.md). Move the Next.js frontend from
> hardcoded TypeScript arrays (`frontend/src/data/*`) to reading published content from the
> Strapi CMS through a new data-access layer, then delete the arrays.
> Owner: long.dao@maritime-ds.com. Status: **approved design — no code yet**.

## 1. Goal & context

Phases 0–2 are done: the Strapi CMS (`cms/`) is scaffolded, the content model exists, and the
hardcoded content has been seeded byte-faithfully (verified). The frontend still imports the
arrays directly:

- `frontend/src/data/books.ts` — `Book`, `BOOKS_DATA`, `getBookBySlug`, `getRelatedBooks`
- `frontend/src/data/articles.ts` — `Article`, `ARTICLES_DATA`, `getArticleBySlug`
- `frontend/src/data/categories.ts` — `CategoryItem`, `CATEGORIES_TREE`, `findCategoryBySlug`

There is **no data-access layer** — pages call `.filter()/.find()/.sort()` inline over the arrays,
and most list/detail pages are `"use client"`. Phase 3 introduces the data-access layer as the
single boundary to the CMS, converts pages to server-side data fetching with URL-driven state,
and removes `src/data/*`.

**Environment facts (verified):** Next `^16.3.5`, React `^19.3.0`, App Router with the app dir at
`frontend/app/` (data/components under `frontend/src/`). Path alias `@/*` → `frontend/` root. No
existing `src/lib/`, no fetch/API-client code, no `revalidate`/`generateStaticParams` anywhere yet.
No GraphQL client installed → **REST**. `frontend/.env.example` already declares `CMS_URL` and
`CMS_API_TOKEN` (server-side read-only token).

### Locked decisions

1. **Fetch strategy: full server-side + URL query params.** List/detail pages become async Server
   Components; filter/sort/pagination/search state lives in the URL. Small client "control islands"
   push URL params. Rejected: server-shell+client-island (keeps in-memory filtering) and
   route-handlers+client-fetch.
2. **Category counts: derived live and cached.** Real counts from published books (top-level =
   sum across descendant categories). Numbers will be small until the catalog grows. The CMS
   deliberately does not store `count`.
3. **Header typeahead: a small route handler.** `GET /api/search/suggest?q=` (server-side, uses the
   repository, token stays server-side) backs the live debounced dropdown in `GlobalSearch`.

### Out of scope (later phases)

Theme/branding via CMS (`src/config/theme.ts` + `CmsThemeManager` untouched — Phase 4); real auth +
downloads (Phase 5); on-demand `revalidateTag` webhooks (Phase 6). Filter facet values
(language/format) stay hardcoded in `FilterSidebar` — they are fixed enums.

## 2. Architecture — the boundary

```
Strapi 5 (cms/) ──REST + Bearer token──► frontend/src/lib/cms/ ──► Server Components
                                              (data-access layer)     + /api/search/suggest
```

**Boundary rule:** only `src/lib/cms/*` (and the one route handler, which imports from it) touch
Strapi. Pages/components depend on the repository interface and the `Book`/`Article`/`CategoryItem`
types — never on Strapi response shapes. This keeps the CMS swappable.

### Module layout

```
frontend/src/lib/cms/
  types.ts       Book, Article, CategoryItem — moved verbatim from src/data/* (the content contract)
  client.ts      fetch wrapper: CMS_URL, Bearer CMS_API_TOKEN, Next {revalidate, tags},
                 published-only (publicationState=live), populate/query builder, error handling
  mappers.ts     Strapi entity → Book / Article / CategoryItem (re-flatten relations)
  books.ts       listBooks, getBookBySlug, getRelatedBooks, searchBooks
  articles.ts    listArticles, getArticleBySlug
  categories.ts  getCategoryTree (derived+cached counts), getCategoryBySlug
  index.ts       barrel re-export
```

## 3. Repository contract

```ts
// books.ts
type BookQuery = {
  category?: string;            // slug; a top-level slug matches all descendant categories
  language?: string;
  format?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  featuredOrNew?: boolean;      // home's `isNew || isFeatured` ($or)
  sort?: "newest" | "downloads" | "rating" | "title";
  page?: number;
  pageSize?: number;            // default 8
  limit?: number;               // "top N" home rails (bypasses pagination)
};
type Paged<T> = { books: T[]; total: number; pageCount: number };

listBooks(q?: BookQuery): Promise<Paged<Book>>
getBookBySlug(slug: string): Promise<Book | null>
getRelatedBooks(book: Book, limit?: number): Promise<Book[]>       // default 6, same category
searchBooks(q: { query: string; sort?: BookQuery["sort"]; page?: number; pageSize?: number; limit?: number }): Promise<Paged<Book>>

// articles.ts
listArticles(q?: { page?: number; pageSize?: number }): Promise<Article[]>
getArticleBySlug(slug: string): Promise<Article | null>

// categories.ts
getCategoryTree(): Promise<CategoryItem[]>                          // 2-level, counts derived+cached
getCategoryBySlug(slugPath: string): Promise<CategoryItem | null>
```

**Query mapping to Strapi REST:**

- `sort`: `newest`→`dateAdded:desc`, `downloads`→`downloadCount:desc`, `rating`→`rating:desc`,
  `title`→`title:asc`.
- `category`: resolve the slug in the tree. Top-level (has children) → `filters[category][slug][$in]`
  = children slugs (+ the node itself if books attach directly); leaf → `[$eq]`.
- `language`/`format`: `filters[language][$eq]` / `filters[format][$eq]`.
- `isNew`/`isFeatured` → boolean filters; `featuredOrNew` → `filters[$or]` of the two.
- `searchBooks.query` → `filters[$or]` of `$containsi` over **title, byline, category.name,
  description, publisher.name** (the 5-field superset the search page uses).
- pagination: `pagination[page]` / `pagination[pageSize]` (default 8); `limit` uses pageSize=limit,
  page=1 and returns just the list.

This collapses the currently duplicated logic (three identical sort switches; two divergent
search implementations; two divergent category-match rules) into one place.

## 4. Mappers (re-flatten — inverse of the seed)

**Book** (populate `category.parent, authors, publisher, cover, file, tableOfContents`):

| `Book` field | Source |
|---|---|
| `id` | `documentId` |
| `author` | `byline` (fallback `authors[0].name`) |
| `publisher` | `publisher.name` |
| `categorySlug` / `categoryName` / `parentCategorySlug` | `category.slug` / `category.name` / `category.parent?.slug` |
| `tableOfContents` | `tableOfContents.map(t => t.text)` |
| `cover` | `coverUrl` ‖ absolute(`cover.url`) |
| `downloadUrl` | `downloadUrl` ‖ absolute(`file.url`) |
| `title, editor, year, pages, fileSize, format, language, sku, rating, ratingCount, downloadCount, dateAdded, isFeatured, isNew, slug, description` | 1:1 |

**Article** (populate `author, category, cover`): `byline`→`author` (fallback `author.name`),
`coverUrl`‖absolute(`cover.url`)→`cover`, `content` richtext passthrough, `publishedDate`,
`readTime`, `excerpt`, `category`, `slug`, `title` 1:1.

`absolute(url)` prefixes `CMS_URL` for relative media paths; external URLs (`coverUrl`) pass through.

## 5. Category tree & derived counts

`getCategoryTree()`:
1. Fetch all categories with `parent` populated; build the 2-level tree (top-level nodes + children),
   preserving order.
2. One lightweight fetch of published books — `fields=id`, `populate[category][fields]=slug`,
   `pagination[pageSize]=100` — tallied in JS.
3. Leaf `count` = books whose `category.slug` = leaf slug. Top-level `count` = sum of its children
   (+ any books directly on the top-level node).
4. Cached via the client's `revalidate` + `categories` tag (recomputed once per cache window). ~25
   books today → trivial.

`getCategoryBySlug(slugPath)` resolves a full slug path (e.g. `noi-khoa/noi-tim-mach`) to its node
(with children) for the category page and breadcrumbs — replacing `findCategoryBySlug`.

## 6. Page-by-page rewire

Each list/detail page becomes an **async Server Component**. Filter/sort/pagination state moves to
the URL. Client "control islands" (filter sidebar, sort dropdown, pagination) call `router.push`
with `startTransition`; the list itself is server-rendered.

| Page / component | Current | Change |
|---|---|---|
| `app/page.tsx` (home) | Server, sync | → async; 5 inline filters → `listBooks({featuredOrNew})`, `listBooks({isFeatured})`, `listBooks({category, limit})` ×3 (noi-khoa / ngoai-khoa / can-lam-sang), `getCategoryTree()` |
| `app/thu-vien-sach` | Client | → server; reads `?chuyen-khoa&ngon-ngu&dinh-dang&sap-xep&trang`; `listBooks(...)`; FilterSidebar/sort/pagination become URL-driven client islands |
| `app/danh-muc/[...slug]` | Client | → server; `getCategoryBySlug` → `listBooks({category})`; breadcrumbs from tree; unify category-match with library |
| `app/tim-kiem` | Client | → server; reads `?q&sap-xep&trang`; `searchBooks(...)` |
| `app/sach/[slug]` | Client | → server async; `getBookBySlug` → **`notFound()`** if null; `getRelatedBooks(book, 6)`; add `generateMetadata` |
| `app/tin-tuc` | Server, sync | → async; `listArticles()` → `[0]` featured + `slice(1)` |
| `app/tin-tuc/[slug]` | Client | → server async; `getArticleBySlug` → **`notFound()`**; `generateMetadata`; `listBooks({limit:4})` for recommended |
| `components/global/GlobalSearch` | Client (in-memory) | stays client; debounced `fetch('/api/search/suggest?q=')` |
| `components/global/MegaMenu` | Client | receives tree (with counts) via props / server fetch instead of `CATEGORIES_TREE` |
| `components/book/FilterSidebar` | Client | receives tree via props; becomes URL-driven; language/format options stay hardcoded |
| `components/global/AppFooter` | Server | `getCategoryTree()` instead of `CATEGORIES_TREE.slice(0,6)` |
| `components/account/DataTable` | Client | drop `BOOKS_DATA.find`; re-download uses snapshot fields on mock `DownloadRecord` |
| ~9 type-only importers | `import type { Book }` from `@/src/data/*` | repoint to `@/src/lib/cms/types` |

**URL param schema** (Vietnamese, consistent with existing `?chuyen-khoa`/`?q`): `chuyen-khoa`
(category), `ngon-ngu` (language), `dinh-dang` (format), `sap-xep` (sort:
`moi-nhat`/`luot-tai`/`danh-gia`/`ten`), `trang` (page), `q` (search). All optional; absent =
defaults (`moi-nhat`, page 1, no filters).

**Route handler:** `app/api/search/suggest/route.ts` — `GET ?q=` → `searchBooks({query: q, limit: 5})`
→ JSON. Same repository, token server-side.

## 7. Caching

`client.ts` sets `next: { revalidate: 60, tags: [<collection>] }` with per-collection tags
(`books`, `articles`, `categories`); pages may also `export const revalidate = 60`. Time-based ISR
only this phase; the tags make Phase 6's `revalidateTag` webhooks a one-line wire-up. `client.ts`
throws a clear startup error if `CMS_URL` or `CMS_API_TOKEN` is missing.

## 8. Testing

- **Mapper unit tests** (mock fetch): re-flattened output equals expected `Book`/`Article`/
  `CategoryItem` shapes, including the fallback chains (`byline`→authors, `coverUrl`→cover.url).
- **Query-builder tests**: a given `BookQuery` produces the expected Strapi query string
  (`$in` category, `$or` search, sort map, pagination).
- **Parity safety-net** (temporary): before deleting `src/data/*`, assert repository output matches
  the old arrays field-for-field (leans on the Phase 2 byte-faithful seed). Removed once the arrays
  are gone.
- **Done-when** (from the plan): `grep` shows no `@/src/data/*` imports remain; `next build` passes;
  every page renders identical content from the CMS; ISR verified.

## 9. Sequencing

Each step leaves the site working.

1. Build `src/lib/cms/` (types → client → mappers → repository) with unit tests; no page touched.
2. Add `/api/search/suggest` route handler.
3. Rewire pages in dependency order: home → detail pages → listing pages → search →
   megamenu/filter/footer → account/DataTable.
4. Flip `GlobalSearch` to the suggest handler.
5. Run the parity test → delete `src/data/{books,articles,categories}.ts` → remove the parity test.
6. Verify: grep clean, `next build` passes, ISR confirmed.

## 10. Risks & watch-items

- **Client→server conversion of 5 pages** is the bulk of the work: filter/sort/page state lifts to
  the URL; interactivity via `router.push` + `startTransition`. Verify no perceived-latency
  regression.
- **Strapi query correctness**: `$or` (home featured-or-new, multi-field search), top-level category
  → descendant slugs, populate depth for `category.parent`.
- **`notFound()`** replaces the in-component not-found blocks on the two detail pages.
- **DataTable** loses `BOOKS_DATA`; the mock `DownloadRecord` gains snapshot fields
  (title/downloadUrl). Full rewire is Phase 5.
- **Count semantics**: top-level = sum of descendants must be verified against the tree shape.
