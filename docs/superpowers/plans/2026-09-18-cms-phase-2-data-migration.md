# CMS Phase 2 — Data Migration (Seed) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the (currently empty) Strapi CMS from the hardcoded frontend arrays (`frontend/src/data/*.ts`) via a one-time, idempotent, in-process seed script, byte-faithful to today's data.

**Architecture:** One `bun`-run orchestrator (`cms/scripts/seed.ts`) boots a Strapi instance in-process (same `createStrapi`/`compileStrapi` pattern the Phase-1 Jest harness uses), then runs pure step modules in dependency order. **All logic lives in importable modules** (`seed/*.ts`, `seed/steps/*.ts`) that take a live `strapi` instance as an argument; the CLI files are thin boot wrappers. This lets the proven Jest+Strapi harness (node/ts-jest) test every step and the full pipeline, while only the thin boot wrapper depends on the `bun` runtime. The seed **imports** the frontend arrays directly (via a re-export module) so it can never drift from source. Writes go through the Strapi Document Service with `status: 'published'`; every step upserts by a natural key so re-running converges CMS → source with no duplicates and no drift.

**Tech Stack:** Strapi 5.54.0, TypeScript, Bun (package manager + script runtime), SQLite (test/local), Jest + ts-jest (existing Phase-1 harness), Document Service API.

**Spec:** `docs/superpowers/specs/2026-09-17-cms-phase-2-data-migration-design.md` (read it alongside this plan).

## Global Constraints

- **Strapi version:** 5.54.0. No new runtime deps; the seed uses only `@strapi/strapi` (already a dep) and the frontend source files.
- **Package manager + script runtime:** Bun. CLI scripts run via `bun ./scripts/<file>.ts`.
- **Single source of truth:** the seed **imports** `frontend/src/data/{books,articles,categories}.ts` and `frontend/src/config/theme.ts` through `cms/scripts/seed/source.ts` (relative re-export). Never copy-paste values into the seed. Those frontend files have **no imports of their own** (pure data), so they load cleanly under both `bun` and `ts-jest`.
- **Media = URL fields only (v1).** Write the source `cover` URL into `coverUrl`; write `downloadUrl` as-is. Leave the `cover`/`file` **media** fields empty. No binary upload.
- **Draft/Publish:** `book` and `article` are the ONLY draft/publish types — always write them with `status: 'published'`. `category`, `author`, `publisher`, `article-category`, `branding` have no draft state — write them with **no** `status` argument.
- **TOC component field is `text`, NOT `line`.** `cms/src/components/toc/line.json` defines a single attribute `text`. Map `tableOfContents: string[]` → `[{ text: <line> }, …]`. (The spec's prose says "`toc.line` component"; the component's *field* is `text` — this is the authoritative shape, confirmed by `cms/tests/api/book.test.ts`.)
- **`book.language` is a plain string** holding exact display values `Tiếng Việt` / `English` / `Song ngữ`. Write verbatim.
- **`book.format`** is an enum: `PDF` / `EPUB` / `Chm`. Write verbatim.
- **`article.content`** is `richtext` storing HTML **byte-faithfully** — store the source string with **no** trimming, re-indenting, or normalization.
- **Category slug is path-style** (`noi-khoa/noi-tong-quat`) and is the natural key. `category.parent` is one-directional (defined only on `category`).
- **uid slug fields require an explicit value on create.** `author.slug`, `publisher.slug`, `article-category.slug` are `uid` + required → generate via `slugify(name)`. `book.slug` / `article.slug` are `uid` + required → use the source `slug` verbatim.
- **Natural keys (upsert):** book `sku`; category / article-category `slug`; author / publisher `name`; article `slug`; branding is a single type (upsert the one entry).
- **Expected counts (used by verification + tests):** categories **56** (9 top-level + 47 children), article-categories **3**, authors **15** (12 distinct book authors + 3 distinct article authors, no overlap), publishers **2**, books **12**, articles **3**, branding **1**.
- **Env guard:** refuse to run unless `DATABASE_CLIENT` is `sqlite`, unless `SEED_ALLOW_PROD=1` or `--force` is passed. Default (unset) `DATABASE_CLIENT` is treated as `sqlite`.
- **Tests:** reuse the Phase-1 harness. `bun run test` boots one Strapi instance per test file against `.tmp/test.db` (wiped each run), `--runInBand`. Integration tests seed into that shared DB and assert by filter/count against the known Phase-2 counts (Phase-2 is the only writer of this data, so absolute counts are valid here — but scope count asserts to the collections this seed owns).

---

## File Structure

**Schema touch-up (Task 1):**
- Modify: `cms/src/api/article/content-types/article/schema.json` — add additive `publishedDate` date attribute.
- Modify (regenerated): `cms/types/generated/contentTypes.d.ts` — via `bun run strapi ts:generate-types`.
- Test: `cms/tests/api/article-published-date.test.ts`.

**Pure helpers (`cms/scripts/seed/`):**
- Create: `slugify.ts` — Vietnamese diacritics → ASCII slug.
- Create: `date.ts` — `parseSeedDate('dd/mm/yyyy') → 'yyyy-mm-dd'` and inverse `formatSeedDate('yyyy-mm-dd') → 'dd/mm/yyyy'`.
- Create: `guard.ts` — `assertSafeDatabase(client, opts)`.
- Create: `source.ts` — re-export the frontend arrays + types.
- Create: `upsert.ts` — `upsertByKey(...)` + publish handling.
- Create: `reflatten.ts` — `reflattenBook` / `reflattenArticle` (CMS entry → frontend shape).

**Step modules (`cms/scripts/seed/steps/`):**
- Create: `categories.ts`, `authors.ts`, `publishers.ts`, `article-categories.ts`, `books.ts`, `articles.ts`, `branding.ts`.

**Orchestrators (`cms/scripts/`):**
- Create: `seed.ts` — `runSeed(strapi)` + CLI `main()` (guard, boot, run, report, optional `--verify`).
- Create: `seed-verify.ts` — `verify(strapi)` + CLI `main()` (boot, verify, exit code).

**package.json (Task 11/12):**
- Modify: `cms/package.json` — add `"seed"` and `"seed:verify"` scripts.

**Test files (`cms/tests/seed/`):**
- Unit (no Strapi): `slugify.test.ts`, `date.test.ts`, `guard.test.ts`, `source.test.ts`, `reflatten.test.ts`.
- Integration (Strapi harness): `upsert.test.ts`, `steps-categories.test.ts`, `steps-reference-entities.test.ts`, `steps-books.test.ts`, `steps-articles.test.ts`, `steps-branding.test.ts`, `seed-pipeline.test.ts`, `seed-verify.test.ts`.

---

## Global interfaces (defined once, referenced by many tasks)

```ts
// cms/scripts/seed/source.ts
export { BOOKS_DATA, type Book } from '../../../frontend/src/data/books';
export { ARTICLES_DATA, type Article } from '../../../frontend/src/data/articles';
export { CATEGORIES_TREE, type CategoryItem } from '../../../frontend/src/data/categories';
export { DEFAULT_THEME, type ThemeConfig, type ColorTokens } from '../../../frontend/src/config/theme';

// cms/scripts/seed/upsert.ts
import type { Core } from '@strapi/strapi';
export async function upsertByKey(
  strapi: Core.Strapi,
  uid: string,
  key: string,
  keyValue: string,
  data: Record<string, unknown>,
  opts?: { publish?: boolean },
): Promise<{ documentId: string }>;

// each step module (cms/scripts/seed/steps/*.ts) — takes a live strapi, returns count
export async function seedCategories(strapi: Core.Strapi): Promise<number>;        // → 56
export async function seedAuthors(strapi: Core.Strapi): Promise<number>;           // → 15
export async function seedPublishers(strapi: Core.Strapi): Promise<number>;        // → 2
export async function seedArticleCategories(strapi: Core.Strapi): Promise<number>; // → 3
export async function seedBooks(strapi: Core.Strapi): Promise<number>;             // → 12
export async function seedArticles(strapi: Core.Strapi): Promise<number>;          // → 3
export async function seedBranding(strapi: Core.Strapi): Promise<void>;

// cms/scripts/seed.ts
export async function runSeed(strapi: Core.Strapi): Promise<Record<string, number>>;
// cms/scripts/seed-verify.ts
export async function verify(strapi: Core.Strapi): Promise<{ ok: boolean; errors: string[] }>;
```

**Note on the relative import depth:** `source.ts` lives at `cms/scripts/seed/source.ts`; `../../../` from there is the repo root, so `../../../frontend/src/data/books` resolves to `frontend/src/data/books`.

---

## Task 1: Add `article.publishedDate` field + regenerate types

The only schema change Phase 2 carries. `article` currently has no field for the source display date; Strapi's built-in `publishedAt` is set to seed time. Add an additive `date` attribute, mirroring how `book.dateAdded` works.

**Files:**
- Modify: `cms/src/api/article/content-types/article/schema.json`
- Modify (generated, committed): `cms/types/generated/contentTypes.d.ts`
- Test: `cms/tests/api/article-published-date.test.ts`

**Interfaces:**
- Produces: `api::article.article` attribute `publishedDate` of type `date` (consumed by Task 8 and Task 10).

- [ ] **Step 1: Write the failing test**

Create `cms/tests/api/article-published-date.test.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('article.publishedDate', () => {
  it('is an additive date attribute', () => {
    const ct = strapi.contentType('api::article.article');
    expect(ct.attributes.publishedDate).toBeDefined();
    expect(ct.attributes.publishedDate.type).toBe('date');
  });

  it('stores an ISO date and returns it verbatim', async () => {
    const a = await strapi.documents('api::article.article').create({
      data: { title: 'PD One', slug: 'pd-one', publishedDate: '2024-02-25' },
      status: 'published',
    });
    expect(a.publishedDate).toBe('2024-02-25');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cms && bun run test tests/api/article-published-date.test.ts`
Expected: FAIL — `ct.attributes.publishedDate` is undefined.

- [ ] **Step 3: Add the field**

In `cms/src/api/article/content-types/article/schema.json`, add to `attributes` (place it right after `readTime`):

```json
    "readTime": { "type": "string" },
    "publishedDate": { "type": "date" }
```

(Ensure the preceding line keeps its trailing comma and the object stays valid JSON.)

- [ ] **Step 4: Regenerate types**

Run: `cd cms && bun run strapi ts:generate-types`
This rewrites `cms/types/generated/contentTypes.d.ts` to include `publishedDate`. Commit the regenerated file.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd cms && bun run test tests/api/article-published-date.test.ts`
Expected: PASS (both cases).

- [ ] **Step 6: Commit**

```bash
git add cms/src/api/article/content-types/article/schema.json cms/types/generated/contentTypes.d.ts cms/tests/api/article-published-date.test.ts
git commit -m "feat(cms): add additive article.publishedDate field for seed"
```

---

## Task 2: Pure helpers — `slugify`, `date`, `guard`

Three small, pure, dependency-free modules with fast unit tests (no Strapi boot).

**Files:**
- Create: `cms/scripts/seed/slugify.ts`
- Create: `cms/scripts/seed/date.ts`
- Create: `cms/scripts/seed/guard.ts`
- Test: `cms/tests/seed/slugify.test.ts`, `cms/tests/seed/date.test.ts`, `cms/tests/seed/guard.test.ts`

**Interfaces:**
- Produces:
  - `slugify(input: string): string`
  - `parseSeedDate(input: string): string` (`'dd/mm/yyyy'` → `'yyyy-mm-dd'`)
  - `formatSeedDate(iso: string): string` (`'yyyy-mm-dd'` → `'dd/mm/yyyy'`)
  - `assertSafeDatabase(client: string, opts: { force?: boolean; allowProd?: boolean }): void`

- [ ] **Step 1: Write the failing tests**

`cms/tests/seed/slugify.test.ts`:

```ts
import { slugify } from '../../scripts/seed/slugify';

describe('slugify', () => {
  it.each([
    ['Kiến thức y học', 'kien-thuc-y-hoc'],
    ['Cận lâm sàng', 'can-lam-sang'],
    ['Giáo trình y khoa', 'giao-trinh-y-khoa'],
    ['NXB Y Học', 'nxb-y-hoc'],
    ['McGraw-Hill', 'mcgraw-hill'],
    ['Frank H. Netter, MD', 'frank-h-netter-md'],
    ['GS.TS. Đào Văn Phan (Chủ biên)', 'gs-ts-dao-van-phan-chu-bien'],
    ['BS. Nguyễn Tôn Thơ', 'bs-nguyen-ton-tho'],
    ['PGS.TS.BS. Nguyễn Thanh Hùng', 'pgs-ts-bs-nguyen-thanh-hung'],
  ])('slugifies %s → %s', (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it('is stable (idempotent on its own output)', () => {
    const once = slugify('Chấn thương chỉnh hình');
    expect(slugify(once)).toBe(once);
  });
});
```

`cms/tests/seed/date.test.ts`:

```ts
import { parseSeedDate, formatSeedDate } from '../../scripts/seed/date';

describe('parseSeedDate', () => {
  it.each([
    ['25/02/2024', '2024-02-25'],
    ['05/02/2024', '2024-02-05'],
    ['18/02/2024', '2024-02-18'],
  ])('%s → %s', (input, expected) => {
    expect(parseSeedDate(input)).toBe(expected);
  });
  it('throws on a malformed date', () => {
    expect(() => parseSeedDate('2024-02-25')).toThrow();
    expect(() => parseSeedDate('bogus')).toThrow();
  });
});

describe('formatSeedDate (inverse)', () => {
  it('round-trips', () => {
    expect(formatSeedDate('2024-02-25')).toBe('25/02/2024');
    expect(parseSeedDate(formatSeedDate('2024-02-05'))).toBe('2024-02-05');
  });
});
```

`cms/tests/seed/guard.test.ts`:

```ts
import { assertSafeDatabase } from '../../scripts/seed/guard';

describe('assertSafeDatabase', () => {
  it('allows sqlite', () => {
    expect(() => assertSafeDatabase('sqlite', {})).not.toThrow();
  });
  it('refuses postgres by default', () => {
    expect(() => assertSafeDatabase('postgres', {})).toThrow(/refus|prod|force/i);
  });
  it('allows postgres with --force', () => {
    expect(() => assertSafeDatabase('postgres', { force: true })).not.toThrow();
  });
  it('allows postgres with allowProd', () => {
    expect(() => assertSafeDatabase('postgres', { allowProd: true })).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd cms && bun run test tests/seed/slugify.test.ts tests/seed/date.test.ts tests/seed/guard.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the three modules**

`cms/scripts/seed/slugify.ts`:

```ts
/** Transliterate Vietnamese (and general Latin) text to a stable ASCII slug. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric runs → single hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}
```

`cms/scripts/seed/date.ts`:

```ts
/** 'dd/mm/yyyy' → 'yyyy-mm-dd'. Throws on anything else. */
export function parseSeedDate(input: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input.trim());
  if (!m) throw new Error(`Unparseable seed date (expected dd/mm/yyyy): ${input}`);
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

/** 'yyyy-mm-dd' → 'dd/mm/yyyy'. Inverse of parseSeedDate; used by reflatten/verify. */
export function formatSeedDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) throw new Error(`Unparseable ISO date (expected yyyy-mm-dd): ${iso}`);
  const [, yyyy, mm, dd] = m;
  return `${dd}/${mm}/${yyyy}`;
}
```

`cms/scripts/seed/guard.ts`:

```ts
/** Refuse to seed against a non-sqlite DB unless explicitly forced. */
export function assertSafeDatabase(
  client: string,
  opts: { force?: boolean; allowProd?: boolean },
): void {
  if (client === 'sqlite') return;
  if (opts.force || opts.allowProd) return;
  throw new Error(
    `Refusing to seed against DATABASE_CLIENT="${client}". ` +
      `Pass --force or set SEED_ALLOW_PROD=1 to override.`,
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd cms && bun run test tests/seed/slugify.test.ts tests/seed/date.test.ts tests/seed/guard.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add cms/scripts/seed/slugify.ts cms/scripts/seed/date.ts cms/scripts/seed/guard.ts cms/tests/seed/slugify.test.ts cms/tests/seed/date.test.ts cms/tests/seed/guard.test.ts
git commit -m "feat(cms): seed pure helpers (slugify, date, db guard)"
```

---

## Task 3: `source.ts` — frontend re-export + import-resolves guard

Trivial in code, important as a gate: it proves the cross-project relative import resolves under the test runtime *before* any step depends on it.

**Files:**
- Create: `cms/scripts/seed/source.ts`
- Test: `cms/tests/seed/source.test.ts`

**Interfaces:**
- Produces: `BOOKS_DATA`, `ARTICLES_DATA`, `CATEGORIES_TREE`, `DEFAULT_THEME`, and re-exported types `Book`, `Article`, `CategoryItem`, `ThemeConfig`, `ColorTokens` (consumed by every step + reflatten).

- [ ] **Step 1: Write the failing test**

`cms/tests/seed/source.test.ts`:

```ts
import { BOOKS_DATA, ARTICLES_DATA, CATEGORIES_TREE, DEFAULT_THEME } from '../../scripts/seed/source';

describe('seed source re-export', () => {
  it('imports the frontend arrays with expected sizes', () => {
    expect(BOOKS_DATA).toHaveLength(12);
    expect(ARTICLES_DATA).toHaveLength(3);
    expect(CATEGORIES_TREE).toHaveLength(9); // top-level nodes
  });
  it('exposes DEFAULT_THEME with light and dark token sets', () => {
    expect(DEFAULT_THEME.name).toBe('Oxford Medical Sapphire');
    expect(DEFAULT_THEME.light.primary).toBe('#1d4ed8');
    expect(DEFAULT_THEME.dark.primary).toBe('#3b82f6');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cms && bun run test tests/seed/source.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`cms/scripts/seed/source.ts`:

```ts
export { BOOKS_DATA, type Book } from '../../../frontend/src/data/books';
export { ARTICLES_DATA, type Article } from '../../../frontend/src/data/articles';
export { CATEGORIES_TREE, type CategoryItem } from '../../../frontend/src/data/categories';
export { DEFAULT_THEME, type ThemeConfig, type ColorTokens } from '../../../frontend/src/config/theme';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cms && bun run test tests/seed/source.test.ts`
Expected: PASS. (If the import fails to resolve under ts-jest, confirm the relative depth `../../../` and that no `paths`/`rootDir` restriction blocks it; the frontend files have no imports so no further config is needed.)

- [ ] **Step 5: Commit**

```bash
git add cms/scripts/seed/source.ts cms/tests/seed/source.test.ts
git commit -m "feat(cms): seed source re-export of frontend data arrays"
```

---

## Task 4: `upsert.ts` — upsert-by-natural-key + publish

Generic idempotent writer used by every step. Find by natural key → update if present, else create; publish for draft/publish types.

**Files:**
- Create: `cms/scripts/seed/upsert.ts`
- Test: `cms/tests/seed/upsert.test.ts` (integration — Strapi harness)

**Interfaces:**
- Consumes: `@strapi/strapi` `Core.Strapi`.
- Produces: `upsertByKey(strapi, uid, key, keyValue, data, opts?) → { documentId }` (consumed by all step modules).

- [ ] **Step 1: Write the failing test**

`cms/tests/seed/upsert.test.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';
import { upsertByKey } from '../../scripts/seed/upsert';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('upsertByKey', () => {
  it('creates a non-draft entity, then updates it in place (no duplicate)', async () => {
    const first = await upsertByKey(strapi, 'api::publisher.publisher', 'name', 'Upsert Pub',
      { name: 'Upsert Pub', slug: 'upsert-pub' });
    const second = await upsertByKey(strapi, 'api::publisher.publisher', 'name', 'Upsert Pub',
      { name: 'Upsert Pub', slug: 'upsert-pub-v2' });
    expect(second.documentId).toBe(first.documentId);
    const rows = await strapi.documents('api::publisher.publisher').findMany({ filters: { name: 'Upsert Pub' } });
    expect(rows).toHaveLength(1);
    expect(rows[0].slug).toBe('upsert-pub-v2'); // converged to latest data
  });

  it('creates a draft/publish entity as published and finds it on re-run', async () => {
    const a = await upsertByKey(strapi, 'api::book.book', 'sku', 'SKU-UPS-1',
      { title: 'Ups Book', slug: 'ups-book', sku: 'SKU-UPS-1', downloadCount: 1 }, { publish: true });
    const b = await upsertByKey(strapi, 'api::book.book', 'sku', 'SKU-UPS-1',
      { title: 'Ups Book', slug: 'ups-book', sku: 'SKU-UPS-1', downloadCount: 2 }, { publish: true });
    expect(b.documentId).toBe(a.documentId);
    const published = await strapi.documents('api::book.book').findMany({ status: 'published', filters: { sku: 'SKU-UPS-1' } });
    expect(published).toHaveLength(1);
    expect(published[0].downloadCount).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cms && bun run test tests/seed/upsert.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`cms/scripts/seed/upsert.ts`:

```ts
import type { Core } from '@strapi/strapi';

/**
 * Upsert a document by a natural key.
 * - Looks up an existing doc by { [key]: keyValue }.
 * - Updates it in place if found, else creates it (merging the key into data).
 * - For draft/publish types, pass { publish: true } to write status:'published'.
 * Returns the stable documentId so callers can wire relations.
 */
export async function upsertByKey(
  strapi: Core.Strapi,
  uid: string,
  key: string,
  keyValue: string,
  data: Record<string, unknown>,
  opts: { publish?: boolean } = {},
): Promise<{ documentId: string }> {
  const status = opts.publish ? ('published' as const) : undefined;
  const existing = await strapi
    .documents(uid as any)
    .findFirst({ filters: { [key]: keyValue } as any });

  if (existing) {
    const updated = await strapi
      .documents(uid as any)
      .update({ documentId: existing.documentId, data: data as any, ...(status ? { status } : {}) });
    return { documentId: updated.documentId };
  }

  const created = await strapi
    .documents(uid as any)
    .create({ data: { ...data, [key]: keyValue } as any, ...(status ? { status } : {}) });
  return { documentId: created.documentId };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cms && bun run test tests/seed/upsert.test.ts`
Expected: PASS. (If `findFirst` returns a draft on re-run for a published doc, the `documentId` still matches — that is the required behavior; the test asserts the single published row converges.)

- [ ] **Step 5: Commit**

```bash
git add cms/scripts/seed/upsert.ts cms/tests/seed/upsert.test.ts
git commit -m "feat(cms): idempotent upsertByKey with publish support"
```

---

## Task 5: `steps/categories.ts` — book category tree (two-pass)

Create all 56 category nodes keyed by `slug` (ignore the hardcoded `count`), then set each child's `parent` from the tree nesting.

**Files:**
- Create: `cms/scripts/seed/steps/categories.ts`
- Test: `cms/tests/seed/steps-categories.test.ts` (integration)

**Interfaces:**
- Consumes: `CATEGORIES_TREE` (source), `upsertByKey`.
- Produces: `seedCategories(strapi): Promise<number>` returning the node count (56). Categories are looked up later by slug (Task 7 books).

- [ ] **Step 1: Write the failing test**

`cms/tests/seed/steps-categories.test.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';
import { seedCategories } from '../../scripts/seed/steps/categories';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('seedCategories', () => {
  it('creates all nodes and links children to their parent', async () => {
    const count = await seedCategories(strapi);
    expect(count).toBe(56);
    const all = await strapi.documents('api::category.category').findMany({ pagination: { limit: -1 } });
    expect(all).toHaveLength(56);

    const child = await strapi.documents('api::category.category').findFirst({
      filters: { slug: 'noi-khoa/noi-tong-quat' }, populate: ['parent'],
    });
    expect(child?.name).toBe('Nội tổng quát');
    expect((child as any)?.parent?.slug).toBe('noi-khoa');

    const top = await strapi.documents('api::category.category').findFirst({
      filters: { slug: 'sach-tieng-anh' }, populate: ['parent'],
    });
    expect((top as any)?.parent ?? null).toBeNull(); // top-level, no parent
  });

  it('is idempotent (second run: still 56, no duplicates)', async () => {
    await seedCategories(strapi);
    const all = await strapi.documents('api::category.category').findMany({ pagination: { limit: -1 } });
    expect(all).toHaveLength(56);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cms && bun run test tests/seed/steps-categories.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`cms/scripts/seed/steps/categories.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { CATEGORIES_TREE, type CategoryItem } from '../source';
import { upsertByKey } from '../upsert';

const UID = 'api::category.category';

/**
 * Two-pass seed of the book category tree.
 * Pass 1: upsert every node by slug (name + slug only; `count` is ignored — derived in Phase 3).
 * Pass 2: set each child's `parent` relation from the tree nesting.
 */
export async function seedCategories(strapi: Core.Strapi): Promise<number> {
  // Pass 1 — create/update all nodes, remember documentId by slug.
  const idBySlug = new Map<string, string>();
  const upsertNode = async (node: CategoryItem) => {
    const { documentId } = await upsertByKey(strapi, UID, 'slug', node.slug, {
      name: node.name,
      slug: node.slug,
    });
    idBySlug.set(node.slug, documentId);
  };

  for (const top of CATEGORIES_TREE) {
    await upsertNode(top);
    for (const child of top.children ?? []) {
      await upsertNode(child);
    }
  }

  // Pass 2 — link children to their top-level parent.
  for (const top of CATEGORIES_TREE) {
    const parentId = idBySlug.get(top.slug)!;
    for (const child of top.children ?? []) {
      const childId = idBySlug.get(child.slug)!;
      await strapi.documents(UID).update({ documentId: childId, data: { parent: parentId } as any });
    }
  }

  return idBySlug.size;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cms && bun run test tests/seed/steps-categories.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add cms/scripts/seed/steps/categories.ts cms/tests/seed/steps-categories.test.ts
git commit -m "feat(cms): seed step — category tree with parent links"
```

---

## Task 6: Reference-entity steps — `authors`, `publishers`, `article-categories`

Three same-shape "distinct string → { name, slug }" steps. Authors span **both** `BOOKS_DATA` and `ARTICLES_DATA`; publishers come from `book.publisher`; article-categories from `article.category`. Slugs generated via `slugify(name)`.

**Files:**
- Create: `cms/scripts/seed/steps/authors.ts`
- Create: `cms/scripts/seed/steps/publishers.ts`
- Create: `cms/scripts/seed/steps/article-categories.ts`
- Test: `cms/tests/seed/steps-reference-entities.test.ts` (integration)

**Interfaces:**
- Consumes: `BOOKS_DATA`, `ARTICLES_DATA` (source), `slugify`, `upsertByKey`.
- Produces: `seedAuthors → 15`, `seedPublishers → 2`, `seedArticleCategories → 3`. Looked up later by name/slug (Tasks 7, 8).

- [ ] **Step 1: Write the failing test**

`cms/tests/seed/steps-reference-entities.test.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';
import { seedAuthors } from '../../scripts/seed/steps/authors';
import { seedPublishers } from '../../scripts/seed/steps/publishers';
import { seedArticleCategories } from '../../scripts/seed/steps/article-categories';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('reference entity steps', () => {
  it('seeds 15 distinct authors across books + articles, with slugs', async () => {
    const n = await seedAuthors(strapi);
    expect(n).toBe(15);
    const all = await strapi.documents('api::author.author').findMany({ pagination: { limit: -1 } });
    expect(all).toHaveLength(15);
    const netter = await strapi.documents('api::author.author').findFirst({ filters: { name: 'Frank H. Netter, MD' } });
    expect(netter?.slug).toBe('frank-h-netter-md');
    const articleAuthor = await strapi.documents('api::author.author').findFirst({ filters: { name: 'BS. Nguyễn Văn Hùng' } });
    expect(articleAuthor).not.toBeNull(); // article authors included
  });

  it('seeds 2 publishers', async () => {
    const n = await seedPublishers(strapi);
    expect(n).toBe(2);
    const nxb = await strapi.documents('api::publisher.publisher').findFirst({ filters: { name: 'NXB Y Học' } });
    expect(nxb?.slug).toBe('nxb-y-hoc');
  });

  it('seeds 3 article-categories with generated slugs', async () => {
    const n = await seedArticleCategories(strapi);
    expect(n).toBe(3);
    const c = await strapi.documents('api::article-category.article-category').findFirst({ filters: { name: 'Kiến thức y học' } });
    expect(c?.slug).toBe('kien-thuc-y-hoc');
  });

  it('all three are idempotent on a second run', async () => {
    expect(await seedAuthors(strapi)).toBe(15);
    expect(await seedPublishers(strapi)).toBe(2);
    expect(await seedArticleCategories(strapi)).toBe(3);
    const authors = await strapi.documents('api::author.author').findMany({ pagination: { limit: -1 } });
    expect(authors).toHaveLength(15);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cms && bun run test tests/seed/steps-reference-entities.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the three modules**

`cms/scripts/seed/steps/authors.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { BOOKS_DATA, ARTICLES_DATA } from '../source';
import { slugify } from '../slugify';
import { upsertByKey } from '../upsert';

const UID = 'api::author.author';

/** Distinct verbatim author strings across BOOKS_DATA and ARTICLES_DATA. */
export async function seedAuthors(strapi: Core.Strapi): Promise<number> {
  const names = new Set<string>();
  for (const b of BOOKS_DATA) names.add(b.author);
  for (const a of ARTICLES_DATA) names.add(a.author);
  for (const name of names) {
    await upsertByKey(strapi, UID, 'name', name, { name, slug: slugify(name) });
  }
  return names.size;
}
```

`cms/scripts/seed/steps/publishers.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { BOOKS_DATA } from '../source';
import { slugify } from '../slugify';
import { upsertByKey } from '../upsert';

const UID = 'api::publisher.publisher';

/** Distinct verbatim book.publisher strings. */
export async function seedPublishers(strapi: Core.Strapi): Promise<number> {
  const names = new Set<string>();
  for (const b of BOOKS_DATA) names.add(b.publisher);
  for (const name of names) {
    await upsertByKey(strapi, UID, 'name', name, { name, slug: slugify(name) });
  }
  return names.size;
}
```

`cms/scripts/seed/steps/article-categories.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { ARTICLES_DATA } from '../source';
import { slugify } from '../slugify';
import { upsertByKey } from '../upsert';

const UID = 'api::article-category.article-category';

/** Distinct article.category strings → { name, slug }. */
export async function seedArticleCategories(strapi: Core.Strapi): Promise<number> {
  const names = new Set<string>();
  for (const a of ARTICLES_DATA) names.add(a.category);
  for (const name of names) {
    await upsertByKey(strapi, UID, 'slug', slugify(name), { name, slug: slugify(name) });
  }
  return names.size;
}
```

(Note: article-category upserts **by slug** — its natural key per the spec — while authors/publishers upsert by `name`.)

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cms && bun run test tests/seed/steps-reference-entities.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add cms/scripts/seed/steps/authors.ts cms/scripts/seed/steps/publishers.ts cms/scripts/seed/steps/article-categories.ts cms/tests/seed/steps-reference-entities.test.ts
git commit -m "feat(cms): seed steps — authors, publishers, article-categories"
```

---

## Task 7: `steps/books.ts` — books with relations, TOC, publish

Upsert 12 books by `sku`; link `category` (by `categorySlug`), `authors[]` (the one verbatim author entity), and `publisher`; write `byline`, `coverUrl`, `downloadUrl`, TOC lines; publish. Fail loudly if a `categorySlug` has no matching category (spec §8).

**Files:**
- Create: `cms/scripts/seed/steps/books.ts`
- Test: `cms/tests/seed/steps-books.test.ts` (integration)

**Interfaces:**
- Consumes: `BOOKS_DATA`, `upsertByKey`; requires categories/authors/publishers already seeded.
- Produces: `seedBooks(strapi): Promise<number>` → 12.

- [ ] **Step 1: Write the failing test**

`cms/tests/seed/steps-books.test.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';
import { seedCategories } from '../../scripts/seed/steps/categories';
import { seedAuthors } from '../../scripts/seed/steps/authors';
import { seedPublishers } from '../../scripts/seed/steps/publishers';
import { seedBooks } from '../../scripts/seed/steps/books';

let strapi: Core.Strapi;
beforeAll(async () => {
  strapi = await setupStrapi();
  await seedCategories(strapi);
  await seedAuthors(strapi);
  await seedPublishers(strapi);
});
afterAll(async () => { await teardownStrapi(); });

describe('seedBooks', () => {
  it('creates 12 published books with resolved relations, byline, and TOC', async () => {
    const n = await seedBooks(strapi);
    expect(n).toBe(12);
    const published = await strapi.documents('api::book.book').findMany({ status: 'published', pagination: { limit: -1 } });
    expect(published).toHaveLength(12);

    const b1 = await strapi.documents('api::book.book').findFirst({
      status: 'published', filters: { sku: 'MED-NOI-001' },
      populate: ['authors', 'publisher', 'category', 'tableOfContents'],
    });
    expect(b1?.byline).toBe('PGS.TS. Châu Ngọc Hoa (Chủ biên)');
    expect((b1 as any).authors[0].name).toBe('PGS.TS. Châu Ngọc Hoa (Chủ biên)');
    expect((b1 as any).publisher.name).toBe('NXB Y Học');
    expect((b1 as any).category.slug).toBe('noi-khoa/noi-tong-quat');
    expect((b1 as any).tableOfContents).toHaveLength(7);
    expect((b1 as any).tableOfContents[0].text).toBe('Chương 1: Nguyên tắc tiếp cận bệnh nhân nội khoa');
    expect(b1?.coverUrl).toContain('images.unsplash.com');
    expect((b1 as any).cover ?? null).toBeNull(); // media field left empty
    expect(b1?.language).toBe('Tiếng Việt');
    expect(b1?.downloadUrl).toBe('/files/dieu-tri-hoc-noi-khoa-tap-1.pdf');
  });

  it('is idempotent (second run: still 12)', async () => {
    expect(await seedBooks(strapi)).toBe(12);
    const published = await strapi.documents('api::book.book').findMany({ status: 'published', pagination: { limit: -1 } });
    expect(published).toHaveLength(12);
  });

  it('throws loudly if a categorySlug is missing', async () => {
    await expect(
      seedBooks(strapi, [{ ...({} as any), sku: 'X', title: 'X', slug: 'x', categorySlug: 'no-such/cat',
        author: 'A', publisher: 'NXB Y Học' } as any]),
    ).rejects.toThrow(/categor/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cms && bun run test tests/seed/steps-books.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`cms/scripts/seed/steps/books.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { BOOKS_DATA, type Book } from '../source';
import { upsertByKey } from '../upsert';

const UID = 'api::book.book';

async function resolveId(strapi: Core.Strapi, uid: string, filters: Record<string, unknown>, label: string): Promise<string> {
  const found = await strapi.documents(uid as any).findFirst({ filters: filters as any });
  if (!found) throw new Error(`Seed books: missing ${label} for ${JSON.stringify(filters)} — seed its step first / fix source`);
  return found.documentId;
}

/** Upsert books by sku with resolved category/authors/publisher relations. */
export async function seedBooks(strapi: Core.Strapi, data: Book[] = BOOKS_DATA): Promise<number> {
  for (const b of data) {
    const categoryId = await resolveId(strapi, 'api::category.category', { slug: b.categorySlug }, 'category');
    const authorId = await resolveId(strapi, 'api::author.author', { name: b.author }, 'author');
    const publisherId = await resolveId(strapi, 'api::publisher.publisher', { name: b.publisher }, 'publisher');

    await upsertByKey(strapi, UID, 'sku', b.sku, {
      title: b.title,
      slug: b.slug,
      byline: b.author,
      editor: b.editor,
      authors: [authorId],
      publisher: publisherId,
      category: categoryId,
      description: b.description,
      tableOfContents: (b.tableOfContents ?? []).map((text) => ({ text })),
      year: b.year,
      pages: b.pages,
      fileSize: b.fileSize,
      format: b.format,
      language: b.language,
      sku: b.sku,
      rating: b.rating,
      ratingCount: b.ratingCount,
      downloadCount: b.downloadCount,
      dateAdded: b.dateAdded,
      isFeatured: b.isFeatured ?? false,
      isNew: b.isNew ?? false,
      coverUrl: b.cover,
      downloadUrl: b.downloadUrl,
    }, { publish: true });
  }
  return data.length;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cms && bun run test tests/seed/steps-books.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add cms/scripts/seed/steps/books.ts cms/tests/seed/steps-books.test.ts
git commit -m "feat(cms): seed step — books with relations, TOC, publish"
```

---

## Task 8: `steps/articles.ts` — articles with relations, publishedDate, publish

Upsert 3 articles by `slug`; link `category` (article-category, by name) and `author` (by verbatim byline string); parse `publishedAt` (`dd/mm/yyyy`) → `publishedDate` (ISO); write `byline`, `coverUrl`, `content` verbatim; publish.

**Files:**
- Create: `cms/scripts/seed/steps/articles.ts`
- Test: `cms/tests/seed/steps-articles.test.ts` (integration)

**Interfaces:**
- Consumes: `ARTICLES_DATA`, `parseSeedDate`, `upsertByKey`; requires article-categories + authors seeded.
- Produces: `seedArticles(strapi): Promise<number>` → 3.

- [ ] **Step 1: Write the failing test**

`cms/tests/seed/steps-articles.test.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';
import { seedAuthors } from '../../scripts/seed/steps/authors';
import { seedArticleCategories } from '../../scripts/seed/steps/article-categories';
import { seedArticles } from '../../scripts/seed/steps/articles';
import { ARTICLES_DATA } from '../../scripts/seed/source';

let strapi: Core.Strapi;
beforeAll(async () => {
  strapi = await setupStrapi();
  await seedAuthors(strapi);
  await seedArticleCategories(strapi);
});
afterAll(async () => { await teardownStrapi(); });

describe('seedArticles', () => {
  it('creates 3 published articles with relations, publishedDate, verbatim content', async () => {
    const n = await seedArticles(strapi);
    expect(n).toBe(3);
    const a1 = await strapi.documents('api::article.article').findFirst({
      status: 'published',
      filters: { slug: 'cap-nhat-huong-dan-chan-doan-dieu-tri-tang-huyet-ap-2024' },
      populate: ['author', 'category'],
    });
    expect(a1?.byline).toBe('BS. Nguyễn Văn Hùng');
    expect((a1 as any).author.name).toBe('BS. Nguyễn Văn Hùng');
    expect((a1 as any).category.name).toBe('Kiến thức y học');
    expect(a1?.publishedDate).toBe('2024-02-25');
    expect(a1?.readTime).toBe('7 phút đọc');
    expect(a1?.coverUrl).toContain('images.unsplash.com');
    // content stored byte-faithfully (no trimming/normalization)
    const src = ARTICLES_DATA.find((a) => a.slug === a1?.slug)!;
    expect(a1?.content).toBe(src.content);
  });

  it('is idempotent (second run: still 3)', async () => {
    expect(await seedArticles(strapi)).toBe(3);
    const all = await strapi.documents('api::article.article').findMany({ status: 'published', pagination: { limit: -1 } });
    expect(all).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cms && bun run test tests/seed/steps-articles.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`cms/scripts/seed/steps/articles.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { ARTICLES_DATA, type Article } from '../source';
import { parseSeedDate } from '../date';
import { upsertByKey } from '../upsert';

const UID = 'api::article.article';

async function resolveId(strapi: Core.Strapi, uid: string, filters: Record<string, unknown>, label: string): Promise<string> {
  const found = await strapi.documents(uid as any).findFirst({ filters: filters as any });
  if (!found) throw new Error(`Seed articles: missing ${label} for ${JSON.stringify(filters)} — seed its step first / fix source`);
  return found.documentId;
}

/** Upsert articles by slug with author + article-category relations and parsed publishedDate. */
export async function seedArticles(strapi: Core.Strapi, data: Article[] = ARTICLES_DATA): Promise<number> {
  for (const a of data) {
    const authorId = await resolveId(strapi, 'api::author.author', { name: a.author }, 'author');
    const categoryId = await resolveId(strapi, 'api::article-category.article-category', { name: a.category }, 'article-category');

    await upsertByKey(strapi, UID, 'slug', a.slug, {
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      content: a.content, // verbatim, no trimming
      author: authorId,
      byline: a.author,
      category: categoryId,
      publishedDate: parseSeedDate(a.publishedAt),
      coverUrl: a.cover,
      readTime: a.readTime,
    }, { publish: true });
  }
  return data.length;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cms && bun run test tests/seed/steps-articles.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add cms/scripts/seed/steps/articles.ts cms/tests/seed/steps-articles.test.ts
git commit -m "feat(cms): seed step — articles with relations, publishedDate, publish"
```

---

## Task 9: `steps/branding.ts` — branding single type from DEFAULT_THEME

Populate the branding single type: `name`, `accentLabel`, `description`, and the nested `light`/`dark` `branding.theme-tokens` components from `DEFAULT_THEME`. Populate-only; the frontend keeps reading its own theme until Phase 4.

**Files:**
- Create: `cms/scripts/seed/steps/branding.ts`
- Test: `cms/tests/seed/steps-branding.test.ts` (integration)

**Interfaces:**
- Consumes: `DEFAULT_THEME` (source).
- Produces: `seedBranding(strapi): Promise<void>` (single type; upsert-in-place).

- [ ] **Step 1: Write the failing test**

`cms/tests/seed/steps-branding.test.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';
import { seedBranding } from '../../scripts/seed/steps/branding';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('seedBranding', () => {
  it('populates the single type with light/dark token sets', async () => {
    await seedBranding(strapi);
    const b = await strapi.documents('api::branding.branding').findFirst({ populate: ['light', 'dark'] });
    expect(b?.name).toBe('Oxford Medical Sapphire');
    expect(b?.accentLabel).toBe('Xanh Sapphire Y Khoa');
    expect((b as any).light.primary).toBe('#1d4ed8');
    expect((b as any).light.focusRing).toBe('#3b82f6');
    expect((b as any).dark.primary).toBe('#3b82f6');
    expect((b as any).dark.accentContrast).toBe('#0b1120');
  });

  it('is idempotent (single type stays single)', async () => {
    await seedBranding(strapi);
    const all = await strapi.documents('api::branding.branding').findMany({});
    expect(all.length).toBeLessThanOrEqual(1);
    const b = await strapi.documents('api::branding.branding').findFirst({ populate: ['light'] });
    expect((b as any).light.primary).toBe('#1d4ed8'); // converged, not duplicated
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cms && bun run test tests/seed/steps-branding.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`cms/scripts/seed/steps/branding.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { DEFAULT_THEME } from '../source';

const UID = 'api::branding.branding';

/**
 * Populate the branding single type from DEFAULT_THEME. The theme's light/dark
 * ColorTokens are a 1:1 match for the branding.theme-tokens component's 16 fields,
 * so they can be assigned directly. Upsert-in-place (single type).
 */
export async function seedBranding(strapi: Core.Strapi): Promise<void> {
  const data = {
    name: DEFAULT_THEME.name,
    description: DEFAULT_THEME.description,
    accentLabel: DEFAULT_THEME.accentLabel,
    light: { ...DEFAULT_THEME.light },
    dark: { ...DEFAULT_THEME.dark },
  };

  const existing = await strapi.documents(UID).findFirst({});
  if (existing) {
    await strapi.documents(UID).update({ documentId: existing.documentId, data: data as any });
  } else {
    await strapi.documents(UID).create({ data: data as any });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cms && bun run test tests/seed/steps-branding.test.ts`
Expected: PASS. (The 16 `ColorTokens` keys — `bg`, `surface`, `surfaceMuted`, `border`, `text`, `textMuted`, `primary`, `primaryHover`, `primaryContrast`, `accent`, `accentContrast`, `success`, `warning`, `danger`, `info`, `focusRing` — match the component attributes exactly, so the spread assigns cleanly.)

- [ ] **Step 5: Commit**

```bash
git add cms/scripts/seed/steps/branding.ts cms/tests/seed/steps-branding.test.ts
git commit -m "feat(cms): seed step — branding single type from DEFAULT_THEME"
```

---

## Task 10: `reflatten.ts` — CMS entry → frontend shape (pure)

Pure mappers that turn a relation-populated CMS entry back into the frontend `Book`/`Article` shape (minus `id`). Used by verification (Task 12) and de-risks the Phase-3 mapper. Optional source keys must be included **only when present/true** so a deep-equal against `source minus id` holds.

**Files:**
- Create: `cms/scripts/seed/reflatten.ts`
- Test: `cms/tests/seed/reflatten.test.ts` (unit — hand-built fixtures, no Strapi)

**Interfaces:**
- Consumes: `formatSeedDate` (from `date.ts`), source types.
- Produces:
  - `reflattenBook(entry): Omit<Book, 'id'>`
  - `reflattenArticle(entry): Omit<Article, 'id'>`

- [ ] **Step 1: Write the failing test**

`cms/tests/seed/reflatten.test.ts`:

```ts
import { reflattenBook, reflattenArticle } from '../../scripts/seed/reflatten';
import { BOOKS_DATA, ARTICLES_DATA } from '../../scripts/seed/source';

describe('reflattenBook', () => {
  it('reconstructs a child-category book equal to source (minus id)', () => {
    const src = BOOKS_DATA.find((b) => b.sku === 'MED-NOI-001')!;
    const entry = {
      slug: src.slug, title: src.title, editor: src.editor, byline: src.author,
      publisher: { name: src.publisher }, category: { slug: src.categorySlug, name: src.categoryName, parent: { slug: src.parentCategorySlug } },
      year: src.year, pages: src.pages, fileSize: src.fileSize, format: src.format, language: src.language,
      sku: src.sku, rating: src.rating, ratingCount: src.ratingCount, downloadCount: src.downloadCount,
      dateAdded: src.dateAdded, isFeatured: true, isNew: true,
      coverUrl: src.cover, description: src.description,
      tableOfContents: src.tableOfContents!.map((text) => ({ text })), downloadUrl: src.downloadUrl,
    };
    const { id, ...expected } = src;
    expect(reflattenBook(entry)).toEqual(expected);
  });

  it('omits parentCategorySlug/isFeatured/isNew for a top-level, unflagged book', () => {
    const src = BOOKS_DATA.find((b) => b.sku === 'MED-ENG-008')!; // sach-tieng-anh, isFeatured only
    const entry = {
      slug: src.slug, title: src.title, editor: src.editor, byline: src.author,
      publisher: { name: src.publisher }, category: { slug: src.categorySlug, name: src.categoryName, parent: null },
      year: src.year, pages: src.pages, fileSize: src.fileSize, format: src.format, language: src.language,
      sku: src.sku, rating: src.rating, ratingCount: src.ratingCount, downloadCount: src.downloadCount,
      dateAdded: src.dateAdded, isFeatured: true, isNew: false,
      coverUrl: src.cover, description: src.description,
      tableOfContents: src.tableOfContents!.map((text) => ({ text })), downloadUrl: src.downloadUrl,
    };
    const out = reflattenBook(entry);
    expect(out).not.toHaveProperty('parentCategorySlug');
    expect(out).not.toHaveProperty('isNew');
    expect(out.isFeatured).toBe(true);
    const { id, ...expected } = src;
    expect(out).toEqual(expected);
  });
});

describe('reflattenArticle', () => {
  it('reconstructs an article equal to source (minus id)', () => {
    const src = ARTICLES_DATA[0];
    const entry = {
      slug: src.slug, title: src.title, excerpt: src.excerpt, content: src.content,
      byline: src.author, category: { name: src.category }, publishedDate: '2024-02-25',
      coverUrl: src.cover, readTime: src.readTime,
    };
    const { id, ...expected } = src;
    expect(reflattenArticle(entry)).toEqual(expected);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cms && bun run test tests/seed/reflatten.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`cms/scripts/seed/reflatten.ts`:

```ts
import type { Book, Article } from './source';
import { formatSeedDate } from './date';

/** A relation-populated book entry as returned by the Document Service. */
type PopulatedBook = Record<string, any>;
type PopulatedArticle = Record<string, any>;

/** CMS book entry (category/authors/publisher/tableOfContents populated) → frontend Book minus id. */
export function reflattenBook(entry: PopulatedBook): Omit<Book, 'id'> {
  const out: Omit<Book, 'id'> = {
    slug: entry.slug,
    title: entry.title,
    author: entry.byline,
    publisher: entry.publisher?.name,
    year: entry.year,
    pages: entry.pages,
    fileSize: entry.fileSize,
    format: entry.format,
    language: entry.language,
    sku: entry.sku,
    rating: entry.rating,
    ratingCount: entry.ratingCount,
    categorySlug: entry.category?.slug,
    categoryName: entry.category?.name,
    cover: entry.coverUrl,
    description: entry.description,
    downloadCount: entry.downloadCount,
    downloadUrl: entry.downloadUrl,
    dateAdded: entry.dateAdded,
  } as Omit<Book, 'id'>;

  if (entry.editor != null) out.editor = entry.editor;
  const parentSlug = entry.category?.parent?.slug;
  if (parentSlug != null) out.parentCategorySlug = parentSlug;
  const toc = (entry.tableOfContents ?? []).map((t: any) => t.text);
  if (toc.length > 0) out.tableOfContents = toc;
  if (entry.isFeatured) out.isFeatured = true;
  if (entry.isNew) out.isNew = true;

  return out;
}

/** CMS article entry (author/category populated) → frontend Article minus id. */
export function reflattenArticle(entry: PopulatedArticle): Omit<Article, 'id'> {
  return {
    slug: entry.slug,
    title: entry.title,
    category: entry.category?.name,
    excerpt: entry.excerpt,
    content: entry.content,
    author: entry.byline,
    publishedAt: formatSeedDate(entry.publishedDate),
    cover: entry.coverUrl,
    readTime: entry.readTime,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cms && bun run test tests/seed/reflatten.test.ts`
Expected: PASS. (Key-ordering does not matter for Jest `toEqual`; only key presence + values.)

- [ ] **Step 5: Commit**

```bash
git add cms/scripts/seed/reflatten.ts cms/tests/seed/reflatten.test.ts
git commit -m "feat(cms): reflatten mappers (CMS entry → frontend shape)"
```

---

## Task 11: `seed.ts` orchestrator + `seed` script

`runSeed(strapi)` runs the steps in dependency order and returns counts. A CLI `main()` applies the env guard, boots Strapi, runs, reports, optionally verifies (`--verify`), and tears down. The importable `runSeed` is what the integration test exercises (proven harness); the boot wrapper is CLI-only glue.

**Files:**
- Create: `cms/scripts/seed.ts`
- Modify: `cms/package.json` (add `"seed"` script)
- Test: `cms/tests/seed/seed-pipeline.test.ts` (integration — the spec §6 capstone)

**Interfaces:**
- Consumes: all step modules, `assertSafeDatabase`, the test harness pattern from `cms/tests/helpers/strapi.ts`.
- Produces: `runSeed(strapi): Promise<Record<string, number>>` with keys `categories, articleCategories, authors, publishers, books, articles` (consumed by Task 12 report + tests).

- [ ] **Step 1: Write the failing test**

`cms/tests/seed/seed-pipeline.test.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';
import { runSeed } from '../../scripts/seed';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('runSeed (full pipeline)', () => {
  it('seeds every collection to the expected counts', async () => {
    const counts = await runSeed(strapi);
    expect(counts).toMatchObject({
      categories: 56, articleCategories: 3, authors: 15, publishers: 2, books: 12, articles: 3,
    });
    expect(await strapi.documents('api::category.category').findMany({ pagination: { limit: -1 } })).toHaveLength(56);
    expect(await strapi.documents('api::book.book').findMany({ status: 'published', pagination: { limit: -1 } })).toHaveLength(12);
    expect(await strapi.documents('api::article.article').findMany({ status: 'published', pagination: { limit: -1 } })).toHaveLength(3);
  });

  it('is idempotent: a second run produces no duplicates and no drift', async () => {
    const counts = await runSeed(strapi);
    expect(counts).toMatchObject({
      categories: 56, articleCategories: 3, authors: 15, publishers: 2, books: 12, articles: 3,
    });
    expect(await strapi.documents('api::author.author').findMany({ pagination: { limit: -1 } })).toHaveLength(15);
    expect(await strapi.documents('api::book.book').findMany({ status: 'published', pagination: { limit: -1 } })).toHaveLength(12);
    const branding = await strapi.documents('api::branding.branding').findMany({});
    expect(branding.length).toBeLessThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cms && bun run test tests/seed/seed-pipeline.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`cms/scripts/seed.ts`:

```ts
import { createStrapi, compileStrapi } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';
import { assertSafeDatabase } from './seed/guard';
import { seedCategories } from './seed/steps/categories';
import { seedArticleCategories } from './seed/steps/article-categories';
import { seedAuthors } from './seed/steps/authors';
import { seedPublishers } from './seed/steps/publishers';
import { seedBooks } from './seed/steps/books';
import { seedArticles } from './seed/steps/articles';
import { seedBranding } from './seed/steps/branding';

/** Run all seed steps in dependency order and return per-collection counts. */
export async function runSeed(strapi: Core.Strapi): Promise<Record<string, number>> {
  const categories = await seedCategories(strapi);
  const articleCategories = await seedArticleCategories(strapi);
  const authors = await seedAuthors(strapi);
  const publishers = await seedPublishers(strapi);
  const books = await seedBooks(strapi);
  const articles = await seedArticles(strapi);
  await seedBranding(strapi);
  return { categories, articleCategories, authors, publishers, books, articles };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const client = process.env.DATABASE_CLIENT ?? 'sqlite';
  assertSafeDatabase(client, {
    force: argv.includes('--force'),
    allowProd: process.env.SEED_ALLOW_PROD === '1',
  });

  const strapi = await createStrapi(await compileStrapi()).load();
  try {
    const counts = await runSeed(strapi);
    // eslint-disable-next-line no-console
    console.log('Seed complete:', JSON.stringify(counts));
    if (argv.includes('--verify')) {
      const { verify } = await import('./seed-verify');
      const result = await verify(strapi);
      // eslint-disable-next-line no-console
      console.log(result.ok ? 'Verify: OK' : `Verify FAILED:\n${result.errors.join('\n')}`);
      if (!result.ok) process.exitCode = 1;
    }
  } finally {
    await strapi.destroy();
  }
}

if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cms && bun run test tests/seed/seed-pipeline.test.ts`
Expected: PASS (both cases).

- [ ] **Step 5: Add the `seed` script**

In `cms/package.json` `scripts`, add:

```json
    "seed": "bun ./scripts/seed.ts",
```

- [ ] **Step 6: Commit**

```bash
git add cms/scripts/seed.ts cms/package.json cms/tests/seed/seed-pipeline.test.ts
git commit -m "feat(cms): seed orchestrator (runSeed) + bun run seed"
```

---

## Task 12: `seed-verify.ts` — verification + `seed:verify` script

`verify(strapi)` asserts (1) per-collection counts and (2) a re-flatten deep-equal of every book/article against its source object. A CLI `main()` boots Strapi, runs `verify`, prints results, and exits non-zero on failure. This is spec §5.

**Files:**
- Create: `cms/scripts/seed-verify.ts`
- Modify: `cms/package.json` (add `"seed:verify"` script)
- Test: `cms/tests/seed/seed-verify.test.ts` (integration)

**Interfaces:**
- Consumes: `runSeed` (to populate), `reflattenBook` / `reflattenArticle`, source arrays.
- Produces: `verify(strapi): Promise<{ ok: boolean; errors: string[] }>`.

- [ ] **Step 1: Write the failing test**

`cms/tests/seed/seed-verify.test.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';
import { runSeed } from '../../scripts/seed';
import { verify } from '../../scripts/seed-verify';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); await runSeed(strapi); });
afterAll(async () => { await teardownStrapi(); });

describe('verify', () => {
  it('passes cleanly after a real seed', async () => {
    const result = await verify(strapi);
    if (!result.ok) throw new Error('verify errors:\n' + result.errors.join('\n'));
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cms && bun run test tests/seed/seed-verify.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`cms/scripts/seed-verify.ts`:

```ts
import type { Core } from '@strapi/strapi';
import { BOOKS_DATA, ARTICLES_DATA, CATEGORIES_TREE } from './seed/source';
import { reflattenBook, reflattenArticle } from './seed/reflatten';

const EXPECTED_CATEGORIES =
  CATEGORIES_TREE.reduce((n, top) => n + 1 + (top.children?.length ?? 0), 0); // 56

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Verify counts and re-flatten round-trip against the source arrays. */
export async function verify(strapi: Core.Strapi): Promise<{ ok: boolean; errors: string[] }> {
  const errors: string[] = [];

  const check = async (uid: string, expected: number, label: string, published = false) => {
    const rows = await strapi.documents(uid as any).findMany({
      pagination: { limit: -1 }, ...(published ? { status: 'published' as const } : {}),
    });
    if (rows.length !== expected) errors.push(`count ${label}: expected ${expected}, got ${rows.length}`);
  };

  await check('api::category.category', EXPECTED_CATEGORIES, 'categories');
  await check('api::article-category.article-category', new Set(ARTICLES_DATA.map((a) => a.category)).size, 'article-categories');
  await check('api::author.author',
    new Set([...BOOKS_DATA.map((b) => b.author), ...ARTICLES_DATA.map((a) => a.author)]).size, 'authors');
  await check('api::publisher.publisher', new Set(BOOKS_DATA.map((b) => b.publisher)).size, 'publishers');
  await check('api::book.book', BOOKS_DATA.length, 'books', true);
  await check('api::article.article', ARTICLES_DATA.length, 'articles', true);

  // Re-flatten diff — books.
  for (const src of BOOKS_DATA) {
    const entry = await strapi.documents('api::book.book').findFirst({
      status: 'published', filters: { sku: src.sku },
      populate: { authors: true, publisher: true, category: { populate: ['parent'] }, tableOfContents: true } as any,
    });
    if (!entry) { errors.push(`book ${src.sku}: not found`); continue; }
    const { id, ...expected } = src;
    const got = reflattenBook(entry);
    if (!deepEqual(got, expected)) errors.push(`book ${src.sku}: re-flatten mismatch\n  expected: ${JSON.stringify(expected)}\n  got:      ${JSON.stringify(got)}`);
  }

  // Re-flatten diff — articles.
  for (const src of ARTICLES_DATA) {
    const entry = await strapi.documents('api::article.article').findFirst({
      status: 'published', filters: { slug: src.slug }, populate: ['author', 'category'],
    });
    if (!entry) { errors.push(`article ${src.slug}: not found`); continue; }
    const { id, ...expected } = src;
    const got = reflattenArticle(entry);
    if (!deepEqual(got, expected)) errors.push(`article ${src.slug}: re-flatten mismatch\n  expected: ${JSON.stringify(expected)}\n  got:      ${JSON.stringify(got)}`);
  }

  return { ok: errors.length === 0, errors };
}

async function main(): Promise<void> {
  const { createStrapi, compileStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi(await compileStrapi()).load();
  try {
    const result = await verify(strapi);
    // eslint-disable-next-line no-console
    console.log(result.ok ? 'Verify: OK' : `Verify FAILED:\n${result.errors.join('\n')}`);
    if (!result.ok) process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
}

if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cms && bun run test tests/seed/seed-verify.test.ts`
Expected: PASS. If a `re-flatten mismatch` fires, the error names the exact field that differs — fix the offending step's mapping (or `reflatten`) until the diff is clean; do not weaken the comparison.

- [ ] **Step 5: Add the `seed:verify` script**

In `cms/package.json` `scripts`, add:

```json
    "seed:verify": "bun ./scripts/seed-verify.ts",
```

- [ ] **Step 6: Run the full seed test suite once**

Run: `cd cms && bun run test tests/seed`
Expected: all Phase-2 unit + integration tests PASS.

- [ ] **Step 7: Commit**

```bash
git add cms/scripts/seed-verify.ts cms/package.json cms/tests/seed/seed-verify.test.ts
git commit -m "feat(cms): seed verification (counts + re-flatten diff) + bun run seed:verify"
```

---

## Notes for the executor

- **Runtime risk (CLI wrappers only):** the `seed.ts` / `seed-verify.ts` `main()` functions boot Strapi under `bun`. All *logic* is tested under the proven Jest+node harness via the exported `runSeed` / `verify` / step functions, so a bun-boot hiccup cannot hide a logic bug. If `bun ./scripts/seed.ts` fails to boot Strapi at runtime (not in tests), the fallback is to add `tsx` as a devDep and change the scripts to `tsx ./scripts/seed.ts` — this is a runtime-glue change only and needs no logic edits. Record it as a ruling if taken.
- **`findMany` default limit:** always pass `pagination: { limit: -1 }` when asserting full-collection counts — the Document Service defaults to a page size (25) that would silently pass the 12/15 asserts but could mask a >25 category regression.
- **Do not touch the frontend** (Phase 3) or add media upload (Phase 5) — see spec §7 "Out".
```