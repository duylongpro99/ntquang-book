# CMS Phase 2 — Data Migration (Seed) — Design Spec

> Scope: **Phase 2** of `docs/cms-plan.md` — one-time, idempotent migration of the hardcoded
> frontend arrays into the Strapi CMS.
> Status: **approved design, ready for implementation plan**. Owner: long.dao@maritime-ds.com.
> Date: 2026-09-17.

---

## 1. Goal & context

Phases 0–1 are done: the Strapi 5 service (`cms/`) runs and the full content model exists (nine
content types + a `branding` single type + user profile fields). It is **empty** — content still
lives in `frontend/src/data/*.ts` and is imported directly by the pages.

Phase 2 populates the CMS from those arrays, byte-faithful to today, so that Phase 3 can build the
data-access layer and delete the hardcoded files. Nothing on the frontend changes in this phase.

**Done when:** running the seed creates CMS entries whose counts match the source arrays; a
verification diff of re-flattened API output vs the source objects is clean; and running the seed a
second time produces **no duplicates and no drift** (converges CMS → source).

### Decisions locked during brainstorming

1. **Media = URL fields only (v1).** Seed writes today's Unsplash `cover` link into `coverUrl` and
   the placeholder into `downloadUrl`; the `cover`/`file` **media fields stay empty**. Covers are
   placeholders and real download files don't exist yet. Real uploads fill the media fields later
   with zero schema change (Phase 1 built the fallback in).
2. **Write mechanism = programmatic Strapi Document Service.** A standalone TS script boots a
   Strapi instance in-process and calls `strapi.documents('api::x.y').create/update(...)`. No
   running server, no HTTP write token; native relation-by-id linking, inline publish, transactions.
3. **Authors/publishers = verbatim `byline` + relations from distinct strings.** The raw author
   string always goes into `byline` (this is what the UI displays). One `author` entity is created
   per **distinct verbatim** author string (shared across books *and* articles); one `publisher`
   per distinct publisher string. **No cleaning/parsing** of honorifics — faithful and re-runnable.
4. **Idempotency = upsert by natural key.** Re-running converges the CMS to the source arrays:
   missing entries are created + published, existing ones updated, relations re-resolved. Natural
   keys: book `sku`, category/article-category `slug`, author/publisher `name`.
5. **Article editorial date = new `publishedDate` field.** The `article` schema has no field for
   the source display date (`publishedAt: "dd/mm/yyyy"`); Strapi's built-in `publishedAt` is set to
   *seed time* on publish. Add an additive `date` attribute `publishedDate` to the article schema
   (small Phase-1 touch-up) and parse `dd/mm/yyyy` → ISO into it. Mirrors how `book.dateAdded`
   already works. This is the **only** schema change Phase 2 carries.

---

## 2. Architecture

One script, run via a new `bun run seed` (boots Strapi, seeds in dependency order, reports, exits).

```
cms/scripts/
  seed.ts            # orchestrator: boot Strapi, run steps in order, report counts, exit
  seed/
    source.ts        # imports frontend/src/data/*.ts as the single source of truth
    slugify.ts       # Vietnamese-diacritics → ASCII slug (article-categories, author fallbacks)
    date.ts          # 'dd/mm/yyyy' → ISO 'yyyy-mm-dd'
    upsert.ts        # findByNaturalKey → update | create, + publish helper
    reflatten.ts     # CMS entry (relations populated) → frontend Book/Article shape (for verify)
    steps/
      categories.ts       # book category tree (two-pass: nodes, then parents)
      article-categories.ts
      authors.ts          # distinct across books + articles
      publishers.ts
      books.ts
      articles.ts
      branding.ts         # DEFAULT_THEME light/dark → branding single type
  seed-verify.ts     # run via `bun run seed:verify`: counts + re-flatten diff
```

- **Single source of truth:** the seed **imports** the frontend arrays directly
  (`import { BOOKS_DATA } from '../../frontend/src/data/books'`) via a relative import / tsconfig
  path — no copy-paste, so the seed cannot drift from the source data.
- **Boot pattern:** create a Strapi instance (`@strapi/strapi`), `.load()`, run steps, `.destroy()`.
  Uses whatever DB the env points at (local SQLite by default; guard against pointing at prod).

### Step order (relations resolve top-down)

1. **Categories** (book tree ← `CATEGORIES_TREE`) — pass 1 create all nodes keyed by `slug`
   (ignore hardcoded `count`, derived in Phase 3); pass 2 set `parent` from the slug hierarchy.
2. **Article-categories** ← distinct `article.category` strings (name + generated `slug`).
3. **Authors** ← distinct verbatim author strings across `BOOKS_DATA` **and** `ARTICLES_DATA`.
4. **Publishers** ← distinct verbatim `book.publisher` strings.
5. **Books** ← link `category` (by `categorySlug`), `authors[]`, `publisher`; publish.
6. **Articles** ← link `category` (article-category by name), `author`; publish.
7. **Branding** single type ← `DEFAULT_THEME` light/dark token sets (populate only; wiring is Phase 4).

---

## 3. Field mapping

### Book (`BOOKS_DATA` → `api::book.book`, key = `sku`)

| Source field | CMS target | Note |
|---|---|---|
| `sku` | `sku` | unique natural key |
| `slug`, `title`, `editor`, `year`, `pages`, `fileSize`, `format`, `language`, `sku`, `rating`, `ratingCount`, `downloadCount`, `dateAdded`, `isFeatured`, `isNew` | same | 1:1 (`dateAdded` already ISO-ish; normalize if needed) |
| `author` (string) | `byline` | verbatim; drives `Book.author` in Phase 3 |
| `author` (string) | `authors[]` | link to `author` entity of that exact string |
| `publisher` (string) | `publisher` | link to `publisher` entity |
| `categorySlug` | `category` | lookup category by slug |
| `description` | `description` | richtext |
| `tableOfContents: string[]` | `tableOfContents` | array → repeatable `toc.line` component |
| `cover` (URL) | `coverUrl` | media field left empty |
| `downloadUrl` | `downloadUrl` | as-is (placeholder) |
| `categoryName`, `parentCategorySlug` | — | **dropped**; re-derived from the relation in Phase 3 |

### Article (`ARTICLES_DATA` → `api::article.article`, key = `slug`)

| Source field | CMS target | Note |
|---|---|---|
| `slug`, `title`, `excerpt`, `content`, `readTime` | same | `content` = richtext HTML (byte-faithful) |
| `author` (string) | `byline` + `author` relation | verbatim byline; author entity link |
| `category` (string) | `category` | article-category by name |
| `publishedAt` (`"dd/mm/yyyy"`) | `publishedDate` (**new** date field) | parsed → ISO |
| `cover` (URL) | `coverUrl` | media field left empty |

### Category / article-category / author / publisher
Natural keys: category `slug`, article-category `slug` (generated via `slugify(name)`),
author `name`, publisher `name`. Article-category and author names are Vietnamese → `slugify`
must transliterate diacritics and produce stable ASCII slugs.

### Branding (single type)
Populate `name`, `accentLabel`, and the nested `light`/`dark` `branding.theme-tokens` components
from `DEFAULT_THEME` (`frontend/src/config/theme.ts`). Logo/site meta optional. Populate-only —
the frontend keeps reading its own theme until Phase 4 wires this.

---

## 4. Idempotency & safety

- **Upsert by natural key** in every step: `findFirst({ filters: { <key> } })` → `update` else
  `create`, always with `status: 'published'`. Relations are re-resolved each run so a source edit
  followed by a re-seed converges.
- **Publish:** Document Service `create/update` with `status: 'published'` for draft/publish
  collections (`book`, `article`); the others have no draft state.
- **Env guard:** refuse to run against a production database unless an explicit
  `--force`/`SEED_ALLOW_PROD` is set (avoid clobbering editor changes on prod).

---

## 5. Verification

`bun run seed:verify` (or `seed --verify`) runs after seeding and asserts:

1. **Counts** per collection == distinct counts derived from the source arrays.
2. **Re-flatten diff:** for each book/article, fetch via the Document Service with relations
   populated, run `reflatten.ts` (CMS entry → frontend `Book`/`Article` shape:
   `categorySlug`, `categoryName`, `parentCategorySlug`, `author`, `publisher`, `tableOfContents`,
   `publishedAt`, …) and deep-equal against the source object; report any differing field.

`reflatten.ts` is an early, throwaway-friendly preview of the Phase 3 mapper — building it here
de-risks the mapper and proves the relation model round-trips.

---

## 6. Testing

- **Unit:** `slugify` (Vietnamese diacritics → ASCII), `date` parser (`dd/mm/yyyy` → ISO),
  `reflatten` (relation-populated entry → frontend shape).
- **Integration** (existing jest + Strapi harness from Phase 1, test SQLite DB):
  - run the seed, assert per-collection counts;
  - assert one book's `category`/`authors`/`publisher` relations resolve and re-flatten matches source;
  - **run the seed twice** and assert no duplicates and no field drift (idempotency).

---

## 7. Scope

**In:** `cms/scripts/seed.ts` + `seed/` modules, `bun run seed` and `seed:verify` scripts, the
additive `article.publishedDate` field (+ regenerated types), the branding single-type populate,
and the tests above.

**Out (YAGNI):** binary media download/upload (URL fields only); seeding `download` / `book-request`
/ `user` (no source data — Phase 5); category `count` (derived in Phase 3); any frontend change
(Phase 3); honorific parsing / author-name normalization.

---

## 8. Risks & watch-items

- **Vietnamese slugs:** `slugify` must transliterate diacritics deterministically or article-category
  / author keys collide or churn. Covered by a unit test.
- **`categorySlug` misses:** a book referencing a category slug not present in `CATEGORIES_TREE`
  should fail loudly (don't silently null the relation). Verify step catches count/relation gaps.
- **Publish semantics:** confirm Document Service `status:'published'` behaves as expected on both
  create and update paths in Strapi 5.54; the double-run test is the guard.
- **Prod DB safety:** the env guard must default to *refuse* when `DATABASE_CLIENT=postgres`.
