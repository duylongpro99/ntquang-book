# CMS Phase 3 — Data-Access Layer + Wire Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the frontend's hardcoded `src/data/*` arrays with a `src/lib/cms/` data-access layer that reads published content from Strapi over REST, convert list/detail pages to server-side fetching with URL-driven filter/sort/pagination, and delete the arrays.

**Architecture:** A single repository boundary at `frontend/src/lib/cms/` is the only code that touches Strapi. Pages become async Server Components that read state from the URL and call the repository; small client "control islands" push URL params. One route handler backs the header typeahead. The mapper re-flattens CMS relations back into the existing `Book`/`Article`/`CategoryItem` shapes so the UI is untouched.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, TypeScript 7, Strapi 5 REST, `qs` for query strings, Vitest for unit tests, Biome for lint/format.

**Spec:** `docs/superpowers/specs/2026-09-18-cms-phase3-data-access-design.md`

## Global Constraints

- **Boundary rule:** only `frontend/src/lib/cms/*` and `frontend/app/api/search/suggest/route.ts` may reference Strapi URLs, the API token, or Strapi response shapes. Pages/components import only the repository functions and the `Book`/`Article`/`CategoryItem` types.
- **Env:** server-side only — `CMS_URL` (no trailing slash) and `CMS_API_TOKEN`. Never expose the token to the browser (no `NEXT_PUBLIC_`).
- **Path alias:** `@/*` → `frontend/` root. Imports use `@/src/lib/cms/...`.
- **Content contract is byte-faithful:** mapper output must equal the old array shapes exactly. The canonical reference is `cms/scripts/seed/reflatten.ts` (`reflattenBook`, `reflattenArticle`) — mirror its field mapping. Divergence from it is a bug.
- **Default caching:** `next: { revalidate: 60, tags: [<collection>] }`; tags are `books`, `articles`, `categories`. Time-based ISR only (webhooks are Phase 6).
- **URL params (Vietnamese):** `chuyen-khoa` (category slug), `ngon-ngu` (language), `dinh-dang` (format), `sap-xep` (sort: `moi-nhat`/`luot-tai`/`danh-gia`/`ten`), `trang` (page, 1-based), `q` (search). All optional; absent = defaults (`moi-nhat`, page 1, no filters).
- **Sort token map:** `moi-nhat`→`newest`→`dateAdded:desc`; `luot-tai`→`downloads`→`downloadCount:desc`; `danh-gia`→`rating`→`rating:desc`; `ten`→`title`→`title:asc`.
- **Page size:** 8 (was `ITEMS_PER_PAGE = 8` in all list pages).
- **Do not touch** `frontend/src/config/theme.ts` or `CmsThemeManager` (Phase 4).
- Run `cd frontend && bun run lint` clean before each commit; commit messages end with the Co-Authored-By trailer already configured for this repo.

## File Structure

**Create:**
- `frontend/vitest.config.ts` — test runner config (node env, `@` alias)
- `frontend/src/lib/cms/types.ts` — `Book`, `Article`, `CategoryItem` (moved from `src/data/*`)
- `frontend/src/lib/cms/client.ts` — fetch wrapper, env assertion, `absolute()`, `qs` builder
- `frontend/src/lib/cms/mappers.ts` — `mapBook`, `mapArticle`, `mapCategoryNode`
- `frontend/src/lib/cms/books.ts` — `listBooks`, `getBookBySlug`, `getRelatedBooks`, `searchBooks`, `buildBookFilters`
- `frontend/src/lib/cms/articles.ts` — `listArticles`, `getArticleBySlug`
- `frontend/src/lib/cms/categories.ts` — `getCategoryTree`, `getCategoryBySlug`
- `frontend/src/lib/cms/index.ts` — barrel
- `frontend/app/api/search/suggest/route.ts` — typeahead handler
- `frontend/src/components/book/CatalogControls.tsx` — URL-driven sort + pagination client island
- Colocated `*.test.ts` files next to each new module

**Modify:** `frontend/app/page.tsx`, `frontend/app/thu-vien-sach/page.tsx`, `frontend/app/danh-muc/[...slug]/page.tsx`, `frontend/app/tim-kiem/page.tsx`, `frontend/app/sach/[slug]/page.tsx`, `frontend/app/tin-tuc/page.tsx`, `frontend/app/tin-tuc/[slug]/page.tsx`, `frontend/src/components/global/GlobalSearch.tsx`, `frontend/src/components/global/MegaMenu.tsx`, `frontend/src/components/book/FilterSidebar.tsx`, `frontend/src/components/global/AppFooter.tsx`, `frontend/src/components/account/DataTable.tsx`, `frontend/src/context/AuthContext.tsx`, and ~9 type-only importers.

**Delete (final task):** `frontend/src/data/books.ts`, `frontend/src/data/articles.ts`, `frontend/src/data/categories.ts`.

---

## Task 1: Test tooling + CMS client foundation

**Files:**
- Create: `frontend/vitest.config.ts`
- Modify: `frontend/package.json` (devDeps + scripts)
- Create: `frontend/src/lib/cms/client.ts`
- Test: `frontend/src/lib/cms/client.test.ts`

**Interfaces:**
- Produces: `cmsFetch<T>(path: string, query?: Record<string, unknown>, opts?: { revalidate?: number; tags?: string[] }): Promise<T>`; `absolute(url?: string | null): string | undefined`; `buildQueryString(query: Record<string, unknown>): string`.

- [ ] **Step 1: Add dev tooling**

```bash
cd frontend && bun add -d vitest && bun add qs && bun add -d @types/qs
```

Add to `frontend/package.json` `scripts`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Vitest config**

Create `frontend/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"] },
  resolve: { alias: { "@": resolve(__dirname, ".") } },
});
```

- [ ] **Step 3: Write the failing test**

Create `frontend/src/lib/cms/client.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { absolute, buildQueryString, cmsFetch } from "./client";

const OLD = { url: process.env.CMS_URL, tok: process.env.CMS_API_TOKEN };
afterEach(() => {
  process.env.CMS_URL = OLD.url;
  process.env.CMS_API_TOKEN = OLD.tok;
  vi.restoreAllMocks();
});

describe("buildQueryString", () => {
  it("encodes nested Strapi filters", () => {
    const qs = buildQueryString({ filters: { slug: { $eq: "a" } }, sort: ["title:asc"] });
    expect(qs).toBe("filters[slug][$eq]=a&sort[0]=title:asc");
  });
  it("returns empty string for empty query", () => {
    expect(buildQueryString({})).toBe("");
  });
});

describe("absolute", () => {
  it("passes through external URLs", () => {
    process.env.CMS_URL = "http://localhost:1337";
    expect(absolute("https://x.com/a.jpg")).toBe("https://x.com/a.jpg");
  });
  it("prefixes relative media paths with CMS_URL", () => {
    process.env.CMS_URL = "http://localhost:1337";
    expect(absolute("/uploads/a.jpg")).toBe("http://localhost:1337/uploads/a.jpg");
  });
  it("returns undefined for empty input", () => {
    expect(absolute(null)).toBeUndefined();
  });
});

describe("cmsFetch", () => {
  it("throws a clear error when env is missing", async () => {
    process.env.CMS_URL = "";
    process.env.CMS_API_TOKEN = "";
    await expect(cmsFetch("/books")).rejects.toThrow(/CMS_URL/);
  });
  it("calls the CMS with bearer auth and next cache opts", async () => {
    process.env.CMS_URL = "http://localhost:1337";
    process.env.CMS_API_TOKEN = "tok";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => ({ data: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await cmsFetch("/books", { sort: ["title:asc"] }, { revalidate: 30, tags: ["books"] });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:1337/api/books?sort[0]=title:asc");
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(init.next).toEqual({ revalidate: 30, tags: ["books"] });
  });
  it("throws on non-ok responses", async () => {
    process.env.CMS_URL = "http://localhost:1337";
    process.env.CMS_API_TOKEN = "tok";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404, statusText: "Not Found" }));
    await expect(cmsFetch("/books")).rejects.toThrow(/404/);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd frontend && bun run test src/lib/cms/client.test.ts`
Expected: FAIL — `./client` cannot be resolved.

- [ ] **Step 5: Implement `client.ts`**

Create `frontend/src/lib/cms/client.ts`:

```ts
import qs from "qs";

function env(name: "CMS_URL" | "CMS_API_TOKEN"): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set — required for the CMS data-access layer`);
  return v;
}

export function buildQueryString(query: Record<string, unknown>): string {
  return qs.stringify(query, { encodeValuesOnly: true });
}

export function absolute(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;
  return `${env("CMS_URL")}${url}`;
}

export async function cmsFetch<T>(
  path: string,
  query: Record<string, unknown> = {},
  opts: { revalidate?: number; tags?: string[] } = {},
): Promise<T> {
  const base = env("CMS_URL");
  const token = env("CMS_API_TOKEN");
  const qsStr = buildQueryString(query);
  const url = `${base}/api${path}${qsStr ? `?${qsStr}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: opts.revalidate ?? 60, tags: opts.tags },
  });
  if (!res.ok) {
    throw new Error(`CMS fetch failed: ${res.status} ${res.statusText} for ${path}`);
  }
  return (await res.json()) as T;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd frontend && bun run test src/lib/cms/client.test.ts`
Expected: PASS (all cases).

- [ ] **Step 7: Commit**

```bash
git add frontend/vitest.config.ts frontend/package.json frontend/bun.lock frontend/src/lib/cms/client.ts frontend/src/lib/cms/client.test.ts
git commit -m "feat(frontend): CMS fetch client + vitest setup (Phase 3)"
```

---

## Task 2: Content-contract types

**Files:**
- Create: `frontend/src/lib/cms/types.ts`

**Interfaces:**
- Produces: `Book`, `Article`, `CategoryItem` interfaces (identical to the current `src/data/*` exports).

- [ ] **Step 1: Copy the interfaces verbatim**

Create `frontend/src/lib/cms/types.ts` with the three interfaces copied exactly from their current homes (do not change field names/optionality):

```ts
// from src/data/books.ts
export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  editor?: string;
  publisher: string;
  year: number;
  pages: number;
  fileSize: string;
  format: "PDF" | "EPUB" | "Chm";
  language: "Tiếng Việt" | "English" | "Song ngữ";
  sku: string;
  rating: number;
  ratingCount: number;
  categorySlug: string;
  categoryName: string;
  parentCategorySlug?: string;
  cover: string;
  description: string;
  tableOfContents?: string[];
  downloadCount: number;
  downloadUrl: string;
  dateAdded: string;
  isFeatured?: boolean;
  isNew?: boolean;
}

// from src/data/articles.ts
export interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  cover: string;
  readTime: string;
}

// from src/data/categories.ts
export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  count?: number;
  children?: CategoryItem[];
}
```

- [ ] **Step 2: Type-check**

Run: `cd frontend && bunx tsc --noEmit`
Expected: PASS (no new errors from this file).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/cms/types.ts
git commit -m "feat(frontend): move content-contract types into src/lib/cms/types"
```

---

## Task 3: Mappers (CMS entity → Book/Article/CategoryItem)

**Files:**
- Create: `frontend/src/lib/cms/mappers.ts`
- Test: `frontend/src/lib/cms/mappers.test.ts`

**Interfaces:**
- Consumes: `absolute` from `./client`; types from `./types`.
- Produces: `mapBook(entry: StrapiEntry): Book`; `mapArticle(entry: StrapiEntry): Article`; `mapCategoryNode(entry: StrapiEntry, children?: CategoryItem[], count?: number): CategoryItem`; `formatCmsDate(iso: string): string`; `type StrapiEntry = Record<string, any>`.

**Reference:** `cms/scripts/seed/reflatten.ts`. Mirror it exactly, plus set `id` from `documentId` (reflatten omits id; the UI requires it), and fall back to media `.url` when the `*Url` string field is absent.

- [ ] **Step 1: Write the failing test**

Create `frontend/src/lib/cms/mappers.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { formatCmsDate, mapArticle, mapBook, mapCategoryNode } from "./mappers";

beforeEach(() => { process.env.CMS_URL = "http://localhost:1337"; });

const bookEntry = {
  documentId: "doc1", slug: "s1", title: "T", byline: "PGS Author", editor: "Ed",
  publisher: { name: "NXB Y Học" }, year: 2023, pages: 680, fileSize: "45.2 MB",
  format: "PDF", language: "Tiếng Việt", sku: "MED-001", rating: 4.9, ratingCount: 142,
  category: { slug: "noi-khoa/noi-tong-quat", name: "Nội tổng quát", parent: { slug: "noi-khoa" } },
  coverUrl: "https://img/x.jpg", description: "D",
  tableOfContents: [{ text: "Ch 1" }, { text: "Ch 2" }],
  downloadCount: 100, downloadUrl: "/files/x.pdf", dateAdded: "2024-01-15",
  isFeatured: true, isNew: false,
};

describe("mapBook", () => {
  it("re-flattens a populated book entry to the Book shape", () => {
    expect(mapBook(bookEntry)).toEqual({
      id: "doc1", slug: "s1", title: "T", author: "PGS Author", editor: "Ed",
      publisher: "NXB Y Học", year: 2023, pages: 680, fileSize: "45.2 MB",
      format: "PDF", language: "Tiếng Việt", sku: "MED-001", rating: 4.9, ratingCount: 142,
      categorySlug: "noi-khoa/noi-tong-quat", categoryName: "Nội tổng quát",
      parentCategorySlug: "noi-khoa", cover: "https://img/x.jpg", description: "D",
      tableOfContents: ["Ch 1", "Ch 2"], downloadCount: 100, downloadUrl: "/files/x.pdf",
      dateAdded: "2024-01-15", isFeatured: true,
    });
  });
  it("falls back to media url and omits absent optionals", () => {
    const e = { ...bookEntry, editor: undefined, coverUrl: undefined, cover: { url: "/uploads/c.jpg" },
      downloadUrl: undefined, file: { url: "/uploads/f.pdf" }, tableOfContents: [],
      isFeatured: false, category: { slug: "x", name: "X" } };
    const b = mapBook(e);
    expect(b.cover).toBe("http://localhost:1337/uploads/c.jpg");
    expect(b.downloadUrl).toBe("http://localhost:1337/uploads/f.pdf");
    expect(b.editor).toBeUndefined();
    expect(b.parentCategorySlug).toBeUndefined();
    expect(b.tableOfContents).toBeUndefined();
    expect(b.isFeatured).toBeUndefined();
  });
});

describe("mapArticle", () => {
  it("re-flattens and formats publishedDate back to dd/mm/yyyy", () => {
    expect(mapArticle({
      documentId: "a1", slug: "s", title: "Ti", category: { name: "Kiến thức y học" },
      excerpt: "Ex", byline: "BS X", publishedDate: "2024-02-25", readTime: "7 phút đọc",
      coverUrl: "https://img/a.jpg", content: "<p>c</p>",
    })).toEqual({
      id: "a1", slug: "s", title: "Ti", category: "Kiến thức y học", excerpt: "Ex",
      content: "<p>c</p>", author: "BS X", publishedAt: "25/02/2024",
      cover: "https://img/a.jpg", readTime: "7 phút đọc",
    });
  });
});

describe("formatCmsDate", () => {
  it("converts yyyy-mm-dd to dd/mm/yyyy", () => {
    expect(formatCmsDate("2024-02-25")).toBe("25/02/2024");
  });
});

describe("mapCategoryNode", () => {
  it("builds a CategoryItem with children and count", () => {
    expect(mapCategoryNode({ documentId: "c1", name: "N", slug: "noi-khoa" },
      [{ id: "c2", name: "C", slug: "noi-khoa/x", count: 2 }], 5)).toEqual({
      id: "noi-khoa", name: "N", slug: "noi-khoa", count: 5,
      children: [{ id: "c2", name: "C", slug: "noi-khoa/x", count: 2 }],
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && bun run test src/lib/cms/mappers.test.ts`
Expected: FAIL — `./mappers` not found.

- [ ] **Step 3: Implement `mappers.ts`**

Create `frontend/src/lib/cms/mappers.ts`:

```ts
import { absolute } from "./client";
import type { Article, Book, CategoryItem } from "./types";

export type StrapiEntry = Record<string, any>;

/** 'yyyy-mm-dd' → 'dd/mm/yyyy'. Inverse of the seed's parseSeedDate. */
export function formatCmsDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) throw new Error(`Unexpected CMS date (want yyyy-mm-dd): ${iso}`);
  const [, y, mo, d] = m;
  return `${d}/${mo}/${y}`;
}

export function mapBook(e: StrapiEntry): Book {
  const parentSlug = e.category?.parent?.slug;
  const toc: string[] = (e.tableOfContents ?? []).map((t: any) => t.text);
  const book: Book = {
    id: e.documentId,
    slug: e.slug,
    title: e.title,
    author: e.byline,
    publisher: e.publisher?.name,
    year: e.year,
    pages: e.pages,
    fileSize: e.fileSize,
    format: e.format,
    language: e.language,
    sku: e.sku,
    rating: e.rating,
    ratingCount: e.ratingCount,
    categorySlug: e.category?.slug,
    categoryName: e.category?.name,
    cover: e.coverUrl ?? absolute(e.cover?.url) ?? "",
    description: e.description,
    downloadCount: e.downloadCount,
    downloadUrl: e.downloadUrl ?? absolute(e.file?.url) ?? "",
    dateAdded: e.dateAdded,
  };
  if (e.editor != null) book.editor = e.editor;
  if (parentSlug != null) book.parentCategorySlug = parentSlug;
  if (toc.length > 0) book.tableOfContents = toc;
  if (e.isFeatured) book.isFeatured = true;
  if (e.isNew) book.isNew = true;
  return book;
}

export function mapArticle(e: StrapiEntry): Article {
  return {
    id: e.documentId,
    slug: e.slug,
    title: e.title,
    category: e.category?.name,
    excerpt: e.excerpt,
    content: e.content,
    author: e.byline,
    publishedAt: formatCmsDate(e.publishedDate),
    cover: e.coverUrl ?? absolute(e.cover?.url) ?? "",
    readTime: e.readTime,
  };
}

export function mapCategoryNode(e: StrapiEntry, children?: CategoryItem[], count?: number): CategoryItem {
  const node: CategoryItem = { id: e.slug, name: e.name, slug: e.slug };
  if (count != null) node.count = count;
  if (children && children.length > 0) node.children = children;
  return node;
}
```

> Note: `mapCategoryNode` uses `slug` as `id` to match how `findCategoryBySlug` matched on `id`/`slug` interchangeably; the old tree's `id` values (e.g. `noi-khoa`) equal the top-level slug and leaf ids differ, but no consumer relies on leaf `id` — they render `name`/`slug`/`count`/`children`. Verify in Task 12.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && bun run test src/lib/cms/mappers.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/cms/mappers.ts frontend/src/lib/cms/mappers.test.ts
git commit -m "feat(frontend): CMS→Book/Article/Category mappers (Phase 3)"
```

---

## Task 4: Books repository

**Files:**
- Create: `frontend/src/lib/cms/books.ts`
- Test: `frontend/src/lib/cms/books.test.ts`

**Interfaces:**
- Consumes: `cmsFetch` from `./client`; `mapBook` from `./mappers`; `getCategoryTree` from `./categories` (for descendant-slug resolution — implemented in Task 6; import it, tests stub the tree via `vi.mock`).
- Produces:
  - `type BookQuery` (as in the spec §3)
  - `type Paged<T> = { books: T[]; total: number; pageCount: number }`
  - `buildBookFilters(q: BookQuery, descendantSlugs?: string[]): Record<string, unknown>`
  - `listBooks(q?: BookQuery): Promise<Paged<Book>>`
  - `getBookBySlug(slug: string): Promise<Book | null>`
  - `getRelatedBooks(book: Book, limit?: number): Promise<Book[]>`
  - `searchBooks(q: { query: string; sort?: BookQuery["sort"]; page?: number; pageSize?: number; limit?: number }): Promise<Paged<Book>>`

- [ ] **Step 1: Write the failing test** (pure query-builder + list wiring; `getCategoryTree` mocked)

Create `frontend/src/lib/cms/books.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./categories", () => ({
  getCategoryTree: vi.fn().mockResolvedValue([
    { id: "noi-khoa", name: "Nội", slug: "noi-khoa", children: [
      { id: "x", name: "X", slug: "noi-khoa/x" }, { id: "y", name: "Y", slug: "noi-khoa/y" },
    ] },
  ]),
}));

const client = { cmsFetch: vi.fn() };
vi.mock("./client", () => ({ cmsFetch: (...a: unknown[]) => client.cmsFetch(...a), absolute: (u: string) => u }));

import { buildBookFilters, listBooks } from "./books";

afterEach(() => vi.clearAllMocks());

describe("buildBookFilters", () => {
  it("maps language/format/flags", () => {
    expect(buildBookFilters({ language: "English", format: "PDF", isFeatured: true }))
      .toEqual({ language: { $eq: "English" }, format: { $eq: "PDF" }, isFeatured: { $eq: true } });
  });
  it("maps featuredOrNew to $or", () => {
    expect(buildBookFilters({ featuredOrNew: true }))
      .toEqual({ $or: [{ isFeatured: { $eq: true } }, { isNew: { $eq: true } }] });
  });
  it("uses $in of descendant slugs for a top-level category", () => {
    expect(buildBookFilters({ category: "noi-khoa" }, ["noi-khoa", "noi-khoa/x", "noi-khoa/y"]))
      .toEqual({ category: { slug: { $in: ["noi-khoa", "noi-khoa/x", "noi-khoa/y"] } } });
  });
});

describe("listBooks", () => {
  it("requests published books with populate, sort, pagination and maps results", async () => {
    client.cmsFetch.mockResolvedValue({
      data: [{ documentId: "d1", slug: "s", title: "T", byline: "A", category: { slug: "x", name: "X" },
        publisher: { name: "P" }, coverUrl: "c", downloadUrl: "u", dateAdded: "2024-01-01" }],
      meta: { pagination: { total: 1, pageCount: 1 } },
    });
    const res = await listBooks({ sort: "title", page: 2, pageSize: 8 });
    const [path, query] = client.cmsFetch.mock.calls[0];
    expect(path).toBe("/books");
    expect(query.sort).toEqual(["title:asc"]);
    expect(query.pagination).toEqual({ page: 2, pageSize: 8 });
    expect(query.status).toBe("published");
    expect(res.total).toBe(1);
    expect(res.books[0].id).toBe("d1");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && bun run test src/lib/cms/books.test.ts`
Expected: FAIL — `./books` not found.

- [ ] **Step 3: Implement `books.ts`**

```ts
import { cmsFetch } from "./client";
import { getCategoryTree } from "./categories";
import { mapBook, type StrapiEntry } from "./mappers";
import type { Book, CategoryItem } from "./types";

export type BookQuery = {
  category?: string; language?: string; format?: string;
  isNew?: boolean; isFeatured?: boolean; featuredOrNew?: boolean;
  sort?: "newest" | "downloads" | "rating" | "title";
  page?: number; pageSize?: number; limit?: number;
};
export type Paged<T> = { books: T[]; total: number; pageCount: number };

const SORT: Record<NonNullable<BookQuery["sort"]>, string> = {
  newest: "dateAdded:desc", downloads: "downloadCount:desc",
  rating: "rating:desc", title: "title:asc",
};

const POPULATE = {
  category: { populate: ["parent"] }, authors: true, publisher: true,
  tableOfContents: true, cover: true, file: true,
};

export function buildBookFilters(q: BookQuery, descendantSlugs?: string[]): Record<string, unknown> {
  const f: Record<string, unknown> = {};
  if (q.language) f.language = { $eq: q.language };
  if (q.format) f.format = { $eq: q.format };
  if (q.isNew) f.isNew = { $eq: true };
  if (q.isFeatured) f.isFeatured = { $eq: true };
  if (q.featuredOrNew) f.$or = [{ isFeatured: { $eq: true } }, { isNew: { $eq: true } }];
  if (q.category) {
    f.category = descendantSlugs?.length
      ? { slug: { $in: descendantSlugs } }
      : { slug: { $eq: q.category } };
  }
  return f;
}

function findNode(tree: CategoryItem[], slug: string): CategoryItem | undefined {
  for (const top of tree) {
    if (top.slug === slug) return top;
    for (const c of top.children ?? []) if (c.slug === slug) return c;
  }
  return undefined;
}

async function descendantSlugsFor(slug: string): Promise<string[]> {
  const node = findNode(await getCategoryTree(), slug);
  if (!node) return [slug];
  if (node.children?.length) return [slug, ...node.children.map((c) => c.slug)];
  return [slug];
}

type ListResponse = { data: StrapiEntry[]; meta?: { pagination?: { total: number; pageCount: number } } };

export async function listBooks(q: BookQuery = {}): Promise<Paged<Book>> {
  const descendants = q.category ? await descendantSlugsFor(q.category) : undefined;
  const pagination = q.limit != null
    ? { page: 1, pageSize: q.limit }
    : { page: q.page ?? 1, pageSize: q.pageSize ?? 8 };
  const res = await cmsFetch<ListResponse>("/books", {
    status: "published",
    filters: buildBookFilters(q, descendants),
    sort: [SORT[q.sort ?? "newest"]],
    populate: POPULATE,
    pagination,
  }, { tags: ["books"] });
  return {
    books: res.data.map(mapBook),
    total: res.meta?.pagination?.total ?? res.data.length,
    pageCount: res.meta?.pagination?.pageCount ?? 1,
  };
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const res = await cmsFetch<ListResponse>("/books", {
    status: "published", filters: { slug: { $eq: slug } }, populate: POPULATE,
    pagination: { page: 1, pageSize: 1 },
  }, { tags: ["books"] });
  return res.data[0] ? mapBook(res.data[0]) : null;
}

export async function getRelatedBooks(book: Book, limit = 6): Promise<Book[]> {
  const res = await listBooks({ category: book.categorySlug, limit: limit + 1 });
  return res.books.filter((b) => b.id !== book.id).slice(0, limit);
}

export async function searchBooks(q: {
  query: string; sort?: BookQuery["sort"]; page?: number; pageSize?: number; limit?: number;
}): Promise<Paged<Book>> {
  const term = q.query.trim();
  if (!term) return { books: [], total: 0, pageCount: 0 };
  const pagination = q.limit != null
    ? { page: 1, pageSize: q.limit }
    : { page: q.page ?? 1, pageSize: q.pageSize ?? 8 };
  const res = await cmsFetch<ListResponse>("/books", {
    status: "published",
    filters: { $or: [
      { title: { $containsi: term } },
      { byline: { $containsi: term } },
      { description: { $containsi: term } },
      { publisher: { name: { $containsi: term } } },
      { category: { name: { $containsi: term } } },
    ] },
    sort: [SORT[q.sort ?? "newest"]],
    populate: POPULATE,
    pagination,
  }, { tags: ["books"] });
  return {
    books: res.data.map(mapBook),
    total: res.meta?.pagination?.total ?? res.data.length,
    pageCount: res.meta?.pagination?.pageCount ?? 1,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && bun run test src/lib/cms/books.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/cms/books.ts frontend/src/lib/cms/books.test.ts
git commit -m "feat(frontend): books repository (list/get/related/search) (Phase 3)"
```

---

## Task 5: Articles repository

**Files:**
- Create: `frontend/src/lib/cms/articles.ts`
- Test: `frontend/src/lib/cms/articles.test.ts`

**Interfaces:**
- Consumes: `cmsFetch`, `mapArticle`.
- Produces: `listArticles(q?: { page?: number; pageSize?: number }): Promise<Article[]>`; `getArticleBySlug(slug: string): Promise<Article | null>`.

- [ ] **Step 1: Write the failing test**

Create `frontend/src/lib/cms/articles.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
const client = { cmsFetch: vi.fn() };
vi.mock("./client", () => ({ cmsFetch: (...a: unknown[]) => client.cmsFetch(...a), absolute: (u: string) => u }));
import { getArticleBySlug, listArticles } from "./articles";
afterEach(() => vi.clearAllMocks());

const row = { documentId: "a1", slug: "s", title: "T", category: { name: "C" }, excerpt: "e",
  content: "<p>c</p>", byline: "B", publishedDate: "2024-02-25", coverUrl: "cv", readTime: "5" };

it("lists published articles newest-first and maps them", async () => {
  client.cmsFetch.mockResolvedValue({ data: [row] });
  const res = await listArticles();
  const [path, query] = client.cmsFetch.mock.calls[0];
  expect(path).toBe("/articles");
  expect(query.sort).toEqual(["publishedDate:desc"]);
  expect(query.status).toBe("published");
  expect(res[0]).toMatchObject({ id: "a1", author: "B", publishedAt: "25/02/2024" });
});

it("returns null when a slug is not found", async () => {
  client.cmsFetch.mockResolvedValue({ data: [] });
  expect(await getArticleBySlug("nope")).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && bun run test src/lib/cms/articles.test.ts`
Expected: FAIL — `./articles` not found.

- [ ] **Step 3: Implement `articles.ts`**

```ts
import { cmsFetch } from "./client";
import { mapArticle, type StrapiEntry } from "./mappers";
import type { Article } from "./types";

const POPULATE = { author: true, category: true, cover: true };
type ListResponse = { data: StrapiEntry[] };

export async function listArticles(q: { page?: number; pageSize?: number } = {}): Promise<Article[]> {
  const res = await cmsFetch<ListResponse>("/articles", {
    status: "published", sort: ["publishedDate:desc"], populate: POPULATE,
    pagination: { page: q.page ?? 1, pageSize: q.pageSize ?? 100 },
  }, { tags: ["articles"] });
  return res.data.map(mapArticle);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const res = await cmsFetch<ListResponse>("/articles", {
    status: "published", filters: { slug: { $eq: slug } }, populate: POPULATE,
    pagination: { page: 1, pageSize: 1 },
  }, { tags: ["articles"] });
  return res.data[0] ? mapArticle(res.data[0]) : null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && bun run test src/lib/cms/articles.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/cms/articles.ts frontend/src/lib/cms/articles.test.ts
git commit -m "feat(frontend): articles repository (Phase 3)"
```

---

## Task 6: Categories repository (tree + derived counts)

**Files:**
- Create: `frontend/src/lib/cms/categories.ts`
- Create: `frontend/src/lib/cms/index.ts`
- Test: `frontend/src/lib/cms/categories.test.ts`

**Interfaces:**
- Consumes: `cmsFetch`, `mapCategoryNode`.
- Produces: `getCategoryTree(): Promise<CategoryItem[]>`; `getCategoryBySlug(slugPath: string): Promise<CategoryItem | null>`.

- [ ] **Step 1: Write the failing test**

Create `frontend/src/lib/cms/categories.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
const client = { cmsFetch: vi.fn() };
vi.mock("./client", () => ({ cmsFetch: (...a: unknown[]) => client.cmsFetch(...a), absolute: (u: string) => u }));
import { getCategoryBySlug, getCategoryTree } from "./categories";
afterEach(() => vi.clearAllMocks());

// First call → categories; second call → books-for-count tally.
function stub() {
  client.cmsFetch
    .mockResolvedValueOnce({ data: [
      { documentId: "1", name: "Nội", slug: "noi-khoa", parent: null },
      { documentId: "2", name: "Tim", slug: "noi-khoa/tim", parent: { slug: "noi-khoa" } },
      { documentId: "3", name: "Hô hấp", slug: "noi-khoa/ho-hap", parent: { slug: "noi-khoa" } },
    ] })
    .mockResolvedValueOnce({ data: [
      { category: { slug: "noi-khoa/tim" } }, { category: { slug: "noi-khoa/tim" } },
      { category: { slug: "noi-khoa/ho-hap" } },
    ] });
}

it("builds a 2-level tree with derived counts (top = sum of children)", async () => {
  stub();
  const tree = await getCategoryTree();
  expect(tree).toEqual([{ id: "noi-khoa", name: "Nội", slug: "noi-khoa", count: 3, children: [
    { id: "noi-khoa/tim", name: "Tim", slug: "noi-khoa/tim", count: 2 },
    { id: "noi-khoa/ho-hap", name: "Hô hấp", slug: "noi-khoa/ho-hap", count: 1 },
  ] }]);
});

it("resolves a full slug path to its node", async () => {
  stub();
  expect((await getCategoryBySlug("/noi-khoa/tim/"))?.name).toBe("Tim");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && bun run test src/lib/cms/categories.test.ts`
Expected: FAIL — `./categories` not found.

- [ ] **Step 3: Implement `categories.ts`**

```ts
import { cmsFetch } from "./client";
import { mapCategoryNode, type StrapiEntry } from "./mappers";
import type { CategoryItem } from "./types";

async function fetchCounts(): Promise<Map<string, number>> {
  const res = await cmsFetch<{ data: StrapiEntry[] }>("/books", {
    status: "published", fields: ["id"], populate: { category: { fields: ["slug"] } },
    pagination: { page: 1, pageSize: 100 },
  }, { tags: ["books", "categories"] });
  const counts = new Map<string, number>();
  for (const b of res.data) {
    const slug = b.category?.slug;
    if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return counts;
}

export async function getCategoryTree(): Promise<CategoryItem[]> {
  const [catRes, counts] = await Promise.all([
    cmsFetch<{ data: StrapiEntry[] }>("/categories", {
      populate: { parent: { fields: ["slug"] } }, sort: ["id:asc"],
      pagination: { page: 1, pageSize: 200 },
    }, { tags: ["categories"] }),
    fetchCounts(),
  ]);
  const tops = catRes.data.filter((c) => !c.parent);
  const childrenOf = (slug: string) => catRes.data.filter((c) => c.parent?.slug === slug);
  return tops.map((top) => {
    const children = childrenOf(top.slug).map((c) =>
      mapCategoryNode(c, undefined, counts.get(c.slug) ?? 0));
    const total = children.reduce((n, c) => n + (c.count ?? 0), 0) + (counts.get(top.slug) ?? 0);
    return mapCategoryNode(top, children, total);
  });
}

export async function getCategoryBySlug(slugPath: string): Promise<CategoryItem | null> {
  const clean = slugPath.replace(/^\/+|\/+$/g, "");
  const tree = await getCategoryTree();
  for (const top of tree) {
    if (top.slug === clean || top.id === clean) return top;
    for (const c of top.children ?? []) if (c.slug === clean || c.id === clean) return c;
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && bun run test src/lib/cms/categories.test.ts`
Expected: PASS. Then run the full suite: `cd frontend && bun run test` — all green.

- [ ] **Step 5: Create the barrel**

Create `frontend/src/lib/cms/index.ts`:

```ts
export * from "./types";
export * from "./books";
export * from "./articles";
export * from "./categories";
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/cms/categories.ts frontend/src/lib/cms/categories.test.ts frontend/src/lib/cms/index.ts
git commit -m "feat(frontend): categories repository w/ derived counts + barrel (Phase 3)"
```

---

## Task 7: Live parity check against the running CMS

Proves the repository returns exactly today's content before any page is rewired. Requires a running, seeded CMS (`cd cms && bun run develop`, seed applied) and `frontend/.env.local` with `CMS_URL`/`CMS_API_TOKEN`.

**Files:**
- Create: `frontend/scripts/parity-check.ts` (temporary; deleted in Task 15)

- [ ] **Step 1: Write the parity script**

```ts
// Compares repository output against the (about-to-be-removed) hardcoded arrays.
import { BOOKS_DATA } from "@/src/data/books";
import { ARTICLES_DATA } from "@/src/data/articles";
import { getBookBySlug } from "@/src/lib/cms/books";
import { getArticleBySlug } from "@/src/lib/cms/articles";

function sortObj(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortObj);
  if (v && typeof v === "object")
    return Object.fromEntries(Object.keys(v as object).sort().map((k) => [k, sortObj((v as any)[k])]));
  return v;
}
const eq = (a: unknown, b: unknown) => JSON.stringify(sortObj(a)) === JSON.stringify(sortObj(b));

async function main() {
  const errors: string[] = [];
  for (const src of BOOKS_DATA) {
    const got = await getBookBySlug(src.slug);
    const { id: _s, ...srcNoId } = src;
    const { id: _g, ...gotNoId } = got ?? ({} as any);
    if (!got) { errors.push(`book ${src.slug}: not found`); continue; }
    if (!eq(gotNoId, srcNoId)) errors.push(`book ${src.slug}: mismatch\n  src: ${JSON.stringify(srcNoId)}\n  got: ${JSON.stringify(gotNoId)}`);
  }
  for (const src of ARTICLES_DATA) {
    const got = await getArticleBySlug(src.slug);
    const { id: _s, ...srcNoId } = src;
    const { id: _g, ...gotNoId } = got ?? ({} as any);
    if (!got) { errors.push(`article ${src.slug}: not found`); continue; }
    if (!eq(gotNoId, srcNoId)) errors.push(`article ${src.slug}: mismatch\n  src: ${JSON.stringify(srcNoId)}\n  got: ${JSON.stringify(gotNoId)}`);
  }
  if (errors.length) { console.error(`PARITY FAILED (${errors.length}):\n${errors.join("\n")}`); process.exit(1); }
  console.log(`Parity OK: ${BOOKS_DATA.length} books, ${ARTICLES_DATA.length} articles match.`);
}
main();
```

- [ ] **Step 2: Run it against the live CMS**

Run: `cd frontend && bunx tsx scripts/parity-check.ts` (ensure `.env.local` is loaded — prefix with env vars or use `bunx dotenv-cli` if needed)
Expected: `Parity OK: N books, M articles match.`

If mismatches appear, fix the mapper/repository (not the arrays) until parity passes. Note the categoryName may re-derive to the canonical tree name — that is expected per spec §3 and should already match because the seed used canonical names.

- [ ] **Step 3: Commit**

```bash
git add frontend/scripts/parity-check.ts
git commit -m "test(frontend): live CMS parity check script (Phase 3, temporary)"
```

---

## Task 8: Typeahead route handler + GlobalSearch wiring

**Files:**
- Create: `frontend/app/api/search/suggest/route.ts`
- Modify: `frontend/src/components/global/GlobalSearch.tsx`

**Interfaces:**
- Consumes: `searchBooks` from `@/src/lib/cms/books`.
- Produces: `GET /api/search/suggest?q=<term>` → `{ books: Book[] }` (max 5).

- [ ] **Step 1: Implement the route handler**

```ts
import { NextResponse } from "next/server";
import { searchBooks } from "@/src/lib/cms/books";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ books: [] });
  const { books } = await searchBooks({ query: q, limit: 5 });
  return NextResponse.json({ books });
}
```

- [ ] **Step 2: Rewire GlobalSearch to fetch from the handler**

In `frontend/src/components/global/GlobalSearch.tsx`, remove `import { BOOKS_DATA, type Book } from "@/src/data/books"`. Import the type from the new home: `import type { Book } from "@/src/lib/cms/types"`. Replace the in-memory `BOOKS_DATA.filter(...).slice(0,5)` block inside the debounced `useEffect` with a fetch (keep the existing 200ms debounce, `results` state, and dropdown rendering):

```tsx
useEffect(() => {
  const q = query.trim();
  if (!q) { setResults([]); return; }
  const id = setTimeout(async () => {
    try {
      const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`);
      const data: { books: Book[] } = await res.json();
      setResults(data.books);
    } catch { setResults([]); }
  }, 200);
  return () => clearTimeout(id);
}, [query]);
```

Keep the submit handler routing to `/tim-kiem?q=<encoded>` unchanged.

- [ ] **Step 3: Verify manually**

Run: `cd frontend && bun run dev`, type in the header search — the dropdown shows up to 5 live matches; submit navigates to `/tim-kiem?q=`.

- [ ] **Step 4: Lint + commit**

```bash
cd frontend && bun run lint
git add frontend/app/api/search/suggest/route.ts frontend/src/components/global/GlobalSearch.tsx
git commit -m "feat(frontend): typeahead route handler + GlobalSearch via CMS (Phase 3)"
```

---

## Task 9: Rewire the home page

**Files:**
- Modify: `frontend/app/page.tsx`

**Interfaces:**
- Consumes: `listBooks`, `getCategoryTree`.

- [ ] **Step 1: Convert to async and replace the 5 inline filters**

Make the default export `async`. Remove `import { BOOKS_DATA } from "@/src/data/books"` and `import { CATEGORIES_TREE } from "@/src/data/categories"`. Add `export const revalidate = 60;`. Replace the five array filters with parallel repository calls:

```tsx
import { listBooks } from "@/src/lib/cms/books";
import { getCategoryTree } from "@/src/lib/cms/categories";

export const revalidate = 60;

export default async function HomePage() {
  const [newRes, featuredRes, noiRes, ngoaiRes, canRes, categories] = await Promise.all([
    listBooks({ featuredOrNew: true, limit: 12 }),
    listBooks({ isFeatured: true, limit: 12 }),
    listBooks({ category: "noi-khoa", limit: 2 }),
    listBooks({ category: "ngoai-khoa", limit: 2 }),
    listBooks({ category: "can-lam-sang", limit: 2 }),
    getCategoryTree(),
  ]);
  const newBooks = newRes.books;
  const featuredBooks = featuredRes.books;
  const internalMedBooks = noiRes.books;
  const surgeryBooks = ngoaiRes.books;
  const paraclinicalBooks = canRes.books;
  const quickCategories = categories.slice(0, 7);
  // ...rest of JSX unchanged, using these consts (they previously came from .slice(0,2) etc.)
}
```

> The original `internalMedBooks.slice(0, 2)` / `paraclinicalBooks.slice(0, 2)` in JSX can stay as-is; passing `limit: 2` just avoids over-fetching. Keep the `limit` values ≥ what the JSX slices.

- [ ] **Step 2: Verify**

Run: `cd frontend && bun run dev` → home renders the same rails (new, featured, specialty sections, 7 quick-specialty badges).

- [ ] **Step 3: Lint + commit**

```bash
cd frontend && bun run lint
git add frontend/app/page.tsx
git commit -m "feat(frontend): home page reads books/categories from CMS (Phase 3)"
```

---

## Task 10: Rewire the detail pages (book + article) with notFound + metadata

**Files:**
- Modify: `frontend/app/sach/[slug]/page.tsx`
- Modify: `frontend/app/tin-tuc/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getBookBySlug`, `getRelatedBooks`, `listBooks`, `getArticleBySlug`.

- [ ] **Step 1: Book detail → async server component**

In `frontend/app/sach/[slug]/page.tsx`: remove `"use client"` and the `use(params)` unwrap; make the component `async` with `params: Promise<{ slug: string }>`. Remove imports from `@/src/data/books`. Replace the data access and the in-component not-found block with:

```tsx
import { notFound } from "next/navigation";
import { getBookBySlug, getRelatedBooks } from "@/src/lib/cms/books";
import type { Book } from "@/src/lib/cms/types";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return { title: "Không tìm thấy sách" };
  return { title: book.title, description: book.description?.slice(0, 160) };
}

export default async function BookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) notFound();
  const relatedBooks = await getRelatedBooks(book, 6);
  // ...rest of JSX unchanged (book, relatedBooks)
}
```

Keep any interactive UI (e.g. QuickView, tabs) inside their existing client child components — they receive `book` as a prop, unchanged. If the page body uses client hooks directly, extract that portion into a small client child receiving `book`/`relatedBooks` props.

- [ ] **Step 2: Article detail → async server component**

In `frontend/app/tin-tuc/[slug]/page.tsx`: same conversion. Replace `getArticleBySlug` (from data) + `BOOKS_DATA.slice(0,4)` with:

```tsx
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/src/lib/cms/articles";
import { listBooks } from "@/src/lib/cms/books";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Không tìm thấy bài viết" };
  return { title: article.title, description: article.excerpt };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  const recommendedBooks = (await listBooks({ limit: 4 })).books;
  // ...rest of JSX unchanged; article.content still rendered via dangerouslySetInnerHTML
}
```

- [ ] **Step 3: Verify**

Run: `cd frontend && bun run dev` → open a valid book and article (render identically), and a bad slug (`/sach/nope`) → Next 404 page.

- [ ] **Step 4: Lint + commit**

```bash
cd frontend && bun run lint
git add frontend/app/sach/[slug]/page.tsx frontend/app/tin-tuc/[slug]/page.tsx
git commit -m "feat(frontend): book/article detail from CMS w/ notFound + metadata (Phase 3)"
```

---

## Task 11: Rewire the news list page

**Files:**
- Modify: `frontend/app/tin-tuc/page.tsx`

- [ ] **Step 1: Convert to async**

Remove `import { ARTICLES_DATA } from "@/src/data/articles"`. Keep the existing `export const metadata`. Make the component `async`, add `export const revalidate = 60;`, and replace the positional slicing:

```tsx
import { listArticles } from "@/src/lib/cms/articles";

export const revalidate = 60;

export default async function NewsPage() {
  const articles = await listArticles();
  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);
  // ...rest of JSX unchanged
}
```

- [ ] **Step 2: Verify + commit**

Run: `cd frontend && bun run dev` → `/tin-tuc` shows the featured article + the rest.

```bash
cd frontend && bun run lint
git add frontend/app/tin-tuc/page.tsx
git commit -m "feat(frontend): news list from CMS (Phase 3)"
```

---

## Task 12: Category-tree consumers (MegaMenu, FilterSidebar, AppFooter)

Prepares the shared tree consumers before the URL-driven list pages. `MegaMenu` and `FilterSidebar` are client components that currently import `CATEGORIES_TREE`; they must receive the tree via props from a server parent. `AppFooter` is a server component and can fetch directly.

**Files:**
- Modify: `frontend/src/components/global/AppFooter.tsx`
- Modify: `frontend/src/components/global/MegaMenu.tsx`
- Modify: `frontend/src/components/book/FilterSidebar.tsx`
- Modify: `frontend/app/layout.tsx` (or `AppHeader`) to pass the tree into `MegaMenu`

**Interfaces:**
- Consumes: `getCategoryTree`, `CategoryItem`.

- [ ] **Step 1: AppFooter (server) fetches directly**

Remove `import { CATEGORIES_TREE }`. Make `AppFooter` `async` and:

```tsx
import { getCategoryTree } from "@/src/lib/cms/categories";
// inside: const categories = await getCategoryTree(); ...categories.slice(0, 6).map(...)
```

- [ ] **Step 2: MegaMenu takes the tree as a prop**

Change the signature to `export function MegaMenu({ categories }: { categories: CategoryItem[] })`; replace every `CATEGORIES_TREE` reference with `categories` (including the `useState<CategoryItem>(categories[0])` initial). Import `type { CategoryItem } from "@/src/lib/cms/types"`. Find MegaMenu's server parent (AppHeader is rendered in `frontend/app/layout.tsx`); fetch the tree in the nearest server component and pass it down. If `AppHeader` is a client component, fetch in `layout.tsx` and pass `categories` through `AppHeader` into `MegaMenu`.

- [ ] **Step 3: FilterSidebar takes the tree as a prop**

Change the signature to accept `categories: CategoryItem[]` alongside its existing props; replace `CATEGORIES_TREE.map(...)` with `categories.map(...)`. Keep the hardcoded language/format option arrays and the exported `FilterState` type unchanged. (The library/category pages in Tasks 13–14 will pass the tree in.)

- [ ] **Step 4: Verify**

Run: `cd frontend && bun run dev` → footer specialty links, mega-menu panels, and (after Tasks 13–14) the filter sidebar all render categories with counts.

- [ ] **Step 5: Lint + commit**

```bash
cd frontend && bun run lint
git add frontend/src/components/global/AppFooter.tsx frontend/src/components/global/MegaMenu.tsx frontend/src/components/book/FilterSidebar.tsx frontend/app/layout.tsx
git commit -m "feat(frontend): category-tree consumers read CMS tree via props/fetch (Phase 3)"
```

---

## Task 13: Shared catalog controls (URL-driven sort + pagination)

Builds the reusable client island used by the library, category, and search pages so their filter/sort/pagination state lives in the URL.

**Files:**
- Create: `frontend/src/components/book/CatalogControls.tsx`

**Interfaces:**
- Produces: `SortSelect` and `Pagination` client components that update URL params via `useRouter`/`usePathname`/`useSearchParams` inside `startTransition`.

- [ ] **Step 1: Implement the controls**

```tsx
"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const SORT_OPTIONS = [
  { value: "moi-nhat", label: "Mới nhất" },
  { value: "luot-tai", label: "Lượt tải" },
  { value: "danh-gia", label: "Đánh giá" },
  { value: "ten", label: "Tên A–Z" },
];

function useParamNav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const setParam = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    }
    startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  };
  return { params, setParam, pending };
}

export function SortSelect() {
  const { params, setParam } = useParamNav();
  const current = params.get("sap-xep") ?? "moi-nhat";
  return (
    <select value={current} onChange={(e) => setParam({ "sap-xep": e.target.value, trang: null })}>
      {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function Pagination({ pageCount }: { pageCount: number }) {
  const { params, setParam } = useParamNav();
  const page = Number(params.get("trang") ?? "1");
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Phân trang">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
        <button key={p} aria-current={p === page} disabled={p === page}
          onClick={() => setParam({ trang: p === 1 ? null : String(p) })}>{p}</button>
      ))}
    </nav>
  );
}
```

> Style these to match the existing sort dropdown and pagination markup in `thu-vien-sach/page.tsx` (copy the current classNames) so the visual output is unchanged.

- [ ] **Step 2: Lint + commit**

```bash
cd frontend && bun run lint
git add frontend/src/components/book/CatalogControls.tsx
git commit -m "feat(frontend): URL-driven sort + pagination controls (Phase 3)"
```

---

## Task 14: Rewire the list pages (library, category, search)

Converts the three client list pages to async server components that read the URL params and call the repository. The filter sidebar becomes URL-driven; sort/pagination use `CatalogControls`.

**Files:**
- Modify: `frontend/app/thu-vien-sach/page.tsx`
- Modify: `frontend/app/danh-muc/[...slug]/page.tsx`
- Modify: `frontend/app/tim-kiem/page.tsx`
- Modify: `frontend/src/components/book/FilterSidebar.tsx` (make facet selections update the URL)

**Interfaces:**
- Consumes: `listBooks`, `searchBooks`, `getCategoryTree`, `getCategoryBySlug`, `SortSelect`, `Pagination`.
- Shared param decode: `sap-xep` → `BookQuery["sort"]` via `{ "moi-nhat":"newest","luot-tai":"downloads","danh-gia":"rating","ten":"title" }`; `trang` → page number.

- [ ] **Step 1: Library page → server**

Remove `"use client"`. Signature: `async function LibraryPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> })`. Add `export const revalidate = 60;`. Decode params and fetch:

```tsx
const sp = await searchParams;
const sortMap = { "moi-nhat":"newest","luot-tai":"downloads","danh-gia":"rating","ten":"title" } as const;
const [tree, { books, pageCount }] = await Promise.all([
  getCategoryTree(),
  listBooks({
    category: sp["chuyen-khoa"], language: sp["ngon-ngu"], format: sp["dinh-dang"],
    sort: sortMap[(sp["sap-xep"] ?? "moi-nhat") as keyof typeof sortMap],
    page: Number(sp["trang"] ?? "1"), pageSize: 8,
  }),
]);
```

Render the existing card grid with `books`, pass `tree` to `<FilterSidebar categories={tree} .../>`, and place `<SortSelect />` + `<Pagination pageCount={pageCount} />`. Remove the old `useMemo` filter/sort blocks and `useState` for filters/sort/page.

- [ ] **Step 2: FilterSidebar updates the URL**

Convert the facet controls (category, language, format) to update URL params (`chuyen-khoa`, `ngon-ngu`, `dinh-dang`) — reuse the `useParamNav` pattern from Task 13 (export it from `CatalogControls` or duplicate the small hook). Selecting a facet resets `trang`. Keep the expand/collapse UI and hardcoded language/format lists.

- [ ] **Step 3: Category page → server**

Remove `"use client"`. Signature: `async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string[] }>; searchParams: Promise<Record<string,string|undefined>> })`. Resolve the category and books:

```tsx
const { slug } = await params;
const fullSlug = slug.join("/");
const category = await getCategoryBySlug(fullSlug);
const { books, pageCount } = await listBooks({
  category: fullSlug, language: sp["ngon-ngu"], format: sp["dinh-dang"],
  sort: sortMap[(sp["sap-xep"] ?? "moi-nhat") as keyof typeof sortMap],
  page: Number(sp["trang"] ?? "1"),
});
```

Build breadcrumbs from `getCategoryBySlug` per segment (replaces per-segment `findCategoryBySlug`); render subcategory pills from `category?.children`. If `category` is null, fall back to a title derived from the slug (as today) — do not `notFound()` here (category pages historically render even for unknown slugs).

- [ ] **Step 4: Search page → server**

Remove `"use client"`. Signature reads `searchParams`. `q` drives `searchBooks`:

```tsx
const sp = await searchParams;
const query = sp["q"] ?? "";
const { books, pageCount } = query.trim()
  ? await searchBooks({ query, sort: sortMap[(sp["sap-xep"] ?? "moi-nhat") as keyof typeof sortMap], page: Number(sp["trang"] ?? "1") })
  : { books: [], pageCount: 0 };
const categories = await getCategoryTree(); // empty-state suggestions grid
```

Keep the empty-state suggestions (`categories.map`) and results rendering; use `<SortSelect />` + `<Pagination />`.

- [ ] **Step 5: Verify each page**

Run: `cd frontend && bun run dev`. Check:
- `/thu-vien-sach` — filter by specialty/language/format updates the URL and results; sort + pagination work; `?chuyen-khoa=noi-khoa` still deep-links.
- `/danh-muc/noi-khoa` and a leaf `/danh-muc/noi-khoa/noi-tim-mach` — correct books, breadcrumbs, subcategory pills.
- `/tim-kiem?q=tim` — matches across title/author/category/description/publisher; empty `q` shows suggestions.

- [ ] **Step 6: Lint + commit**

```bash
cd frontend && bun run lint
git add frontend/app/thu-vien-sach/page.tsx frontend/app/danh-muc/[...slug]/page.tsx frontend/app/tim-kiem/page.tsx frontend/src/components/book/FilterSidebar.tsx
git commit -m "feat(frontend): library/category/search server-rendered w/ URL params (Phase 3)"
```

---

## Task 15: DataTable, type-only imports, delete arrays, final verification

**Files:**
- Modify: `frontend/src/context/AuthContext.tsx` (enrich mock `DownloadRecord`)
- Modify: `frontend/src/components/account/DataTable.tsx`
- Modify: ~9 type-only importers (repoint `import type { Book }`)
- Delete: `frontend/src/data/{books,articles,categories}.ts`, `frontend/scripts/parity-check.ts`

- [ ] **Step 1: Enrich the mock DownloadRecord and drop BOOKS_DATA from DataTable**

In `frontend/src/context/AuthContext.tsx`, add snapshot fields the re-download needs to `DownloadRecord` (e.g. `bookTitle: string`, `bookDownloadUrl: string`) and populate them wherever mock records are created. Import `type { Book }` from `@/src/lib/cms/types` if referenced. In `frontend/src/components/account/DataTable.tsx`, remove `import { BOOKS_DATA }`; change the re-download handler to use `record.bookDownloadUrl`/`record.bookTitle` instead of `BOOKS_DATA.find(...)`.

- [ ] **Step 2: Repoint type-only imports**

For each file that does `import type { Book }`/`{ Article }`/`{ CategoryItem }` from `@/src/data/*`, change the path to `@/src/lib/cms/types`. Files (per inventory): `frontend/src/context/QuickViewContext.tsx`, `frontend/src/components/detail/TabGroup.tsx`, `PrimaryCTA.tsx`, `MediaViewer.tsx`, `MetaList.tsx`, `frontend/src/components/book/CardGrid.tsx`, `BookCard.tsx`, `Rail.tsx`, and `AuthContext.tsx` if applicable.

- [ ] **Step 3: Confirm no runtime importers remain, then delete the arrays**

Run: `cd frontend && grep -rn "@/src/data/" app src --include=*.ts --include=*.tsx`
Expected: no matches. Then:

```bash
git rm frontend/src/data/books.ts frontend/src/data/articles.ts frontend/src/data/categories.ts frontend/scripts/parity-check.ts
```

- [ ] **Step 4: Full verification**

Run and confirm each:
- `cd frontend && bun run test` → all unit tests pass.
- `cd frontend && bunx tsc --noEmit` → no type errors.
- `cd frontend && bun run lint` → clean.
- `cd frontend && bun run build` → succeeds.
- `grep -rn "BOOKS_DATA\|ARTICLES_DATA\|CATEGORIES_TREE\|@/src/data/" frontend/app frontend/src` → no matches.
- `bun run dev` and click through home, library (filters/sort/pagination), category, search, book detail, article detail, news, header typeahead, footer, mega-menu — content matches pre-migration; a bad detail slug 404s.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(frontend): remove hardcoded data arrays; site fully CMS-driven (Phase 3)"
```

---

## Self-Review

**Spec coverage:**
- §2 boundary/module layout → Tasks 1–6 (+ Global Constraints boundary rule).
- §3 repository contract → Tasks 4–6 (all functions + `BookQuery`/`Paged`).
- §4 mappers (inverse of reflatten) → Task 3.
- §5 category tree + derived counts (top = sum of descendants) → Task 6.
- §6 page rewire + URL schema + route handler → Tasks 8–14; DataTable/type-imports → Task 15.
- §7 caching (revalidate 60 + tags) → `cmsFetch` default + `export const revalidate` per page (Tasks 1, 9–14).
- §8 testing (mapper units, query-builder, parity, done-when checks) → Tasks 3, 4, 7, 15.
- §9 sequencing → task order matches.
- §10 risks → addressed (client→server per task with verify; `$or`/`$in` in Task 4 tests; `notFound()` Task 10; DataTable Task 15; count semantics Task 6 test).

**Placeholder scan:** No TBD/TODO; every code step has real code; verification steps have exact commands and expected output.

**Type consistency:** `cmsFetch`, `absolute`, `mapBook`/`mapArticle`/`mapCategoryNode`, `StrapiEntry`, `BookQuery`, `Paged<T>`, `listBooks`/`getBookBySlug`/`getRelatedBooks`/`searchBooks`, `listArticles`/`getArticleBySlug`, `getCategoryTree`/`getCategoryBySlug`, `SortSelect`/`Pagination` are defined once and consumed with matching signatures. Sort tokens and URL param names are pinned in Global Constraints and reused verbatim.

**Open dependency note:** Task 4 (`books.ts`) imports `getCategoryTree` from Task 6 (`categories.ts`). The dependency is one-directional (books→categories for descendant resolution; `categories.ts` imports only `client`/`mappers`, never `books`), so there is no import cycle. Task 4's unit tests mock `./categories`; the export must exist for real runs, which first happens in the barrel and the live parity check (Task 7) — both exercise the two modules together.
