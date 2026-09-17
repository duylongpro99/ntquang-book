# CMS Phase 1 — Content Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Define the full Strapi 5 content model for the CMS — nine content types, two components, the user extension, and public read permissions — so later phases add only behavior, not schema migrations.

**Architecture:** Code-first content types. Each collection is a `schema.json` plus factory controller/route/service under `cms/src/api/<name>/`. Components live under `cms/src/components/<category>/`. Relations are **one-directional** (defined only on the owning type) so each collection is self-contained and task ordering is simple. Verification uses a Jest suite that boots a real Strapi instance against a throwaway SQLite DB and drives the document service + REST/GraphQL.

**Tech Stack:** Strapi 5.54.0, TypeScript, Bun (package manager — `bun.lock` present), SQLite (test/local), Jest + ts-jest + supertest, `@strapi/plugin-graphql`.

**Spec:** `docs/superpowers/specs/2026-09-17-cms-phase-1-content-model-design.md` (read it alongside this plan).

## Global Constraints

- **Strapi version:** 5.54.0. All plugin deps pinned to `5.54.0`.
- **Package manager:** Bun. Install with `bun add`, run scripts with `bun run`.
- **Draft/Publish:** enabled on `book` and `article` ONLY (`options.draftAndPublish: true`). Every other type sets it `false`.
- **Enum safety (GraphQL):** enumeration values MUST be valid GraphQL enum names (`^[_A-Za-z][_A-Za-z0-9]*$` — ASCII, no spaces, no diacritics). Therefore `format` (`PDF`/`EPUB`/`Chm`) and `book-request.status` are enums; **`book.language` is a plain `string`** holding the exact display values `Tiếng Việt` / `English` / `Song ngữ` (an enum of those would break GraphQL). This is a deliberate deviation from the spec's "enum" wording, made to preserve exact values under GraphQL.
- **Relations:** one-directional — defined only on `book`/`article`/`download`/`book-request`/`category.parent`. No inverse fields on `author`/`publisher`/`category`/`article-category`. (Phase 6 archive pages filter the child side, e.g. `?filters[authors][id][$eq]=...`.)
- **Media + URL fallback:** `book.cover`+`book.coverUrl`, `book.file`+`book.downloadUrl`, `article.cover`+`article.coverUrl` coexist. Media field is single (`multiple:false`).
- **Category slug:** plain `string` (unique, required), NOT `uid` — preserves path form `noi-khoa/noi-tim-mach`.
- **`article.content`:** `richtext` field storing HTML (byte-faithful; Blocks deferred to Phase 6).
- **`category.count`:** NOT a field — derived later (Phase 3).
- **File layout:** each API type has exactly four files: `content-types/<name>/schema.json`, `controllers/<name>.ts`, `routes/<name>.ts`, `services/<name>.ts`. The three `.ts` files are one-line factory calls.
- **Tests:** `bun run test` boots one Strapi instance per test file against `.tmp/test.db` (wiped each run), `--runInBand`. Tests create uniquely-keyed rows and assert by filter — never by absolute row count (files share the DB).

---

## File Structure

**Test infrastructure (Task 1):**
- Create: `cms/jest.config.js` — Jest config (ts-jest, node env, long timeout, globalSetup).
- Create: `cms/tests/helpers/strapi.ts` — boot/teardown a shared Strapi instance.
- Create: `cms/tests/helpers/global-setup.ts` — wipe `.tmp/test.db` before the run.
- Modify: `cms/package.json` — add dev deps + `test` script.
- Modify: `cms/tsconfig.json` — ensure `tests/**` is compiled by ts-jest (exclude from build).

**Content types (`cms/src/api/<name>/`):** `author`, `publisher`, `article-category`, `category`, `book`, `article`, `branding` (singleType), `download`, `book-request` — each with `content-types/<name>/schema.json` + `controllers/<name>.ts` + `routes/<name>.ts` + `services/<name>.ts`.

**Components (`cms/src/components/`):** `toc/line.json`, `branding/theme-tokens.json`.

**User extension:** `cms/src/extensions/users-permissions/content-types/user/schema.json`.

**Bootstrap / plugins (Task 9):**
- Modify: `cms/src/index.ts` — grant public read permissions in `bootstrap`.
- Modify: `cms/package.json` — add `@strapi/plugin-graphql`.

**Generated types (Task 10):** `cms/types/generated/*.d.ts` (committed).

**Test files:** `cms/tests/api/<name>.test.ts` per collection, plus `cms/tests/api/permissions.test.ts`.

---

## Task 1: Test harness + `author` collection

Establishes the Jest+Strapi boot pattern and the first (simplest) collection end-to-end.

**Files:**
- Modify: `cms/package.json` (dev deps + `test` script)
- Create: `cms/jest.config.js`
- Create: `cms/tests/helpers/global-setup.ts`
- Create: `cms/tests/helpers/strapi.ts`
- Create: `cms/src/api/author/content-types/author/schema.json`
- Create: `cms/src/api/author/controllers/author.ts`
- Create: `cms/src/api/author/routes/author.ts`
- Create: `cms/src/api/author/services/author.ts`
- Test: `cms/tests/api/author.test.ts`

**Interfaces:**
- Produces: content type `api::author.author` with attributes `name:string(req)`, `slug:uid(name)`, `bio:text`, `avatar:media(images)`. Test helpers `setupStrapi(): Promise<Core.Strapi>` and `teardownStrapi(): Promise<void>`.
- Consumes: nothing.

- [ ] **Step 1: Install test tooling**

Run:
```bash
cd cms && bun add -d jest ts-jest @types/jest supertest @types/supertest
```

- [ ] **Step 2: Add the `test` script**

Modify `cms/package.json` `scripts` — add:
```json
"test": "NODE_ENV=test DATABASE_CLIENT=sqlite DATABASE_FILENAME=.tmp/test.db jest --runInBand --forceExit"
```

- [ ] **Step 3: Create Jest config**

Create `cms/jest.config.js`:
```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.ts'],
  testTimeout: 120000,
  globalSetup: '<rootDir>/tests/helpers/global-setup.ts',
  transform: { '^.+\\.ts$': ['ts-jest', { isolatedModules: true }] },
};
```

- [ ] **Step 4: Create the global setup (wipe test DB)**

Create `cms/tests/helpers/global-setup.ts`:
```ts
import fs from 'fs';
import path from 'path';

export default async function globalSetup(): Promise<void> {
  const dbPath = path.join(__dirname, '..', '..', '.tmp', 'test.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
}
```

- [ ] **Step 5: Create the Strapi boot helper**

Create `cms/tests/helpers/strapi.ts`:
```ts
import { createStrapi, compileStrapi } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';

let instance: Core.Strapi | null = null;

export async function setupStrapi(): Promise<Core.Strapi> {
  if (!instance) {
    const appContext = await compileStrapi();
    // @ts-expect-error compiled context is accepted by createStrapi at runtime
    instance = await createStrapi(appContext).load();
    await instance.server.mount();
  }
  return instance;
}

export async function teardownStrapi(): Promise<void> {
  if (instance) {
    await instance.destroy();
    instance = null;
  }
}
```

- [ ] **Step 6: Write the failing test**

Create `cms/tests/api/author.test.ts`:
```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;

beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('author content type', () => {
  it('is registered with the expected attributes', () => {
    const ct = strapi.contentType('api::author.author');
    expect(ct).toBeTruthy();
    expect(ct.attributes.name.type).toBe('string');
    expect(ct.attributes.slug.type).toBe('uid');
    expect(ct.attributes.bio.type).toBe('text');
    expect(ct.attributes.avatar.type).toBe('media');
  });

  it('accepts a create via the document service', async () => {
    const created = await strapi.documents('api::author.author').create({
      data: { name: 'Author T1', slug: 'author-t1' },
    });
    expect(created.name).toBe('Author T1');
    expect(created.slug).toBe('author-t1');
  });
});
```

- [ ] **Step 7: Run the test to verify it fails**

Run: `cd cms && bun run test tests/api/author.test.ts`
Expected: FAIL — `strapi.contentType('api::author.author')` throws / returns undefined (type not defined yet).

- [ ] **Step 8: Create the author schema**

Create `cms/src/api/author/content-types/author/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "authors",
  "info": { "singularName": "author", "pluralName": "authors", "displayName": "Author" },
  "options": { "draftAndPublish": false },
  "pluginOptions": {},
  "attributes": {
    "name": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "name", "required": true },
    "bio": { "type": "text" },
    "avatar": { "type": "media", "multiple": false, "allowedTypes": ["images"] }
  }
}
```

- [ ] **Step 9: Create the factory controller/route/service**

Create `cms/src/api/author/controllers/author.ts`:
```ts
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::author.author');
```
Create `cms/src/api/author/routes/author.ts`:
```ts
import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::author.author');
```
Create `cms/src/api/author/services/author.ts`:
```ts
import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::author.author');
```

- [ ] **Step 10: Run the test to verify it passes**

Run: `cd cms && bun run test tests/api/author.test.ts`
Expected: PASS (both cases). If ts-jest complains about `@strapi/strapi` types, confirm `isolatedModules: true` is set in `jest.config.js`.

- [ ] **Step 11: Commit**

```bash
git add cms/package.json cms/bun.lock cms/jest.config.js cms/tests cms/src/api/author
git commit -m "test(cms): jest+strapi harness and author collection"
```

---

## Task 2: `publisher` + `article-category` collections

Two trivial reference collections that share the author pattern. Reviewed together.

**Files:**
- Create: `cms/src/api/publisher/content-types/publisher/schema.json` (+ controller/route/service)
- Create: `cms/src/api/article-category/content-types/article-category/schema.json` (+ controller/route/service)
- Test: `cms/tests/api/publisher.test.ts`, `cms/tests/api/article-category.test.ts`

**Interfaces:**
- Produces: `api::publisher.publisher` (`name:string(req)`, `slug:uid(name)`); `api::article-category.article-category` (`name:string(req)`, `slug:uid(name)`).
- Consumes: test helpers from Task 1.

- [ ] **Step 1: Write the failing tests**

Create `cms/tests/api/publisher.test.ts`:
```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('publisher content type', () => {
  it('is registered with name + slug', () => {
    const ct = strapi.contentType('api::publisher.publisher');
    expect(ct.attributes.name.type).toBe('string');
    expect(ct.attributes.slug.type).toBe('uid');
  });
  it('accepts a create', async () => {
    const p = await strapi.documents('api::publisher.publisher').create({
      data: { name: 'NXB Test', slug: 'nxb-test' },
    });
    expect(p.name).toBe('NXB Test');
  });
});
```
Create `cms/tests/api/article-category.test.ts`:
```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('article-category content type', () => {
  it('is registered with name + slug', () => {
    const ct = strapi.contentType('api::article-category.article-category');
    expect(ct.attributes.name.type).toBe('string');
    expect(ct.attributes.slug.type).toBe('uid');
  });
  it('accepts a create', async () => {
    const c = await strapi.documents('api::article-category.article-category').create({
      data: { name: 'Kiến thức y học', slug: 'kien-thuc-y-hoc' },
    });
    expect(c.name).toBe('Kiến thức y học');
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `cd cms && bun run test tests/api/publisher.test.ts tests/api/article-category.test.ts`
Expected: FAIL — content types not registered.

- [ ] **Step 3: Create the publisher type**

Create `cms/src/api/publisher/content-types/publisher/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "publishers",
  "info": { "singularName": "publisher", "pluralName": "publishers", "displayName": "Publisher" },
  "options": { "draftAndPublish": false },
  "pluginOptions": {},
  "attributes": {
    "name": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "name", "required": true }
  }
}
```
Create `cms/src/api/publisher/controllers/publisher.ts`, `routes/publisher.ts`, `services/publisher.ts` — same three one-line factory files as Task 1 Step 9, with `api::publisher.publisher` (use `createCoreController` / `createCoreRouter` / `createCoreService` respectively).

- [ ] **Step 4: Create the article-category type**

Create `cms/src/api/article-category/content-types/article-category/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "article_categories",
  "info": { "singularName": "article-category", "pluralName": "article-categories", "displayName": "Article Category" },
  "options": { "draftAndPublish": false },
  "pluginOptions": {},
  "attributes": {
    "name": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "name", "required": true }
  }
}
```
Create `cms/src/api/article-category/controllers/article-category.ts`, `routes/article-category.ts`, `services/article-category.ts` — factory files with `api::article-category.article-category`.

- [ ] **Step 5: Run to verify they pass**

Run: `cd cms && bun run test tests/api/publisher.test.ts tests/api/article-category.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add cms/src/api/publisher cms/src/api/article-category cms/tests/api/publisher.test.ts cms/tests/api/article-category.test.ts
git commit -m "feat(cms): publisher and article-category collections"
```

---

## Task 3: `category` collection (self-relation, path-style slug)

**Files:**
- Create: `cms/src/api/category/content-types/category/schema.json` (+ controller/route/service)
- Test: `cms/tests/api/category.test.ts`

**Interfaces:**
- Produces: `api::category.category` (`name:string(req)`, `slug:string(req,unique)`, `parent:relation manyToOne → api::category.category`).
- Consumes: test helpers.

- [ ] **Step 1: Write the failing test**

Create `cms/tests/api/category.test.ts`:
```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('category content type', () => {
  it('has a plain-string path slug and a self parent relation', () => {
    const ct = strapi.contentType('api::category.category');
    expect(ct.attributes.slug.type).toBe('string');
    expect(ct.attributes.parent.type).toBe('relation');
    expect((ct.attributes.parent as any).target).toBe('api::category.category');
  });

  it('preserves a path-style slug and links parent → child', async () => {
    const parent = await strapi.documents('api::category.category').create({
      data: { name: 'Nội Khoa', slug: 'noi-khoa' },
    });
    const child = await strapi.documents('api::category.category').create({
      data: { name: 'Nội tim mạch', slug: 'noi-khoa/noi-tim-mach', parent: parent.documentId },
      populate: ['parent'],
    });
    expect(child.slug).toBe('noi-khoa/noi-tim-mach');
    expect((child as any).parent.slug).toBe('noi-khoa');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd cms && bun run test tests/api/category.test.ts`
Expected: FAIL — type not registered.

- [ ] **Step 3: Create the category type**

Create `cms/src/api/category/content-types/category/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "categories",
  "info": { "singularName": "category", "pluralName": "categories", "displayName": "Category" },
  "options": { "draftAndPublish": false },
  "pluginOptions": {},
  "attributes": {
    "name": { "type": "string", "required": true },
    "slug": { "type": "string", "required": true, "unique": true },
    "parent": { "type": "relation", "relation": "manyToOne", "target": "api::category.category" }
  }
}
```
Create `cms/src/api/category/controllers/category.ts`, `routes/category.ts`, `services/category.ts` — factory files with `api::category.category`.

- [ ] **Step 4: Run to verify it passes**

Run: `cd cms && bun run test tests/api/category.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add cms/src/api/category cms/tests/api/category.test.ts
git commit -m "feat(cms): category collection with self-relation and path slug"
```

---

## Task 4: `toc.line` component + `book` collection

The core collection: all 25 fields, enums, relations, media+URL, repeatable TOC, Draft/Publish.

**Files:**
- Create: `cms/src/components/toc/line.json`
- Create: `cms/src/api/book/content-types/book/schema.json` (+ controller/route/service)
- Test: `cms/tests/api/book.test.ts`

**Interfaces:**
- Produces: `api::book.book` (Draft/Publish) with the attributes in Step 4; component `toc.line` (`text:string(req)`).
- Consumes: `api::author.author`, `api::publisher.publisher`, `api::category.category`.

- [ ] **Step 1: Write the failing test**

Create `cms/tests/api/book.test.ts`:
```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('book content type', () => {
  it('has draft/publish and the key field shapes', () => {
    const ct = strapi.contentType('api::book.book');
    expect(ct.options?.draftAndPublish).toBe(true);
    expect(ct.attributes.slug.type).toBe('uid');
    expect(ct.attributes.format.type).toBe('enumeration');
    expect((ct.attributes.format as any).enum).toEqual(['PDF', 'EPUB', 'Chm']);
    expect(ct.attributes.language.type).toBe('string'); // NOT enum (GraphQL-safe)
    expect(ct.attributes.tableOfContents.type).toBe('component');
    expect(ct.attributes.cover.type).toBe('media');
    expect(ct.attributes.coverUrl.type).toBe('string');
    expect((ct.attributes.authors as any).relation).toBe('manyToMany');
    expect((ct.attributes.publisher as any).relation).toBe('manyToOne');
  });

  it('links authors/publisher/category, stores TOC + Vietnamese language', async () => {
    const author = await strapi.documents('api::author.author').create({ data: { name: 'Rel Auth', slug: 'rel-auth' } });
    const pub = await strapi.documents('api::publisher.publisher').create({ data: { name: 'Rel Pub', slug: 'rel-pub' } });
    const cat = await strapi.documents('api::category.category').create({ data: { name: 'Rel Cat', slug: 'rel-cat-path' } });
    const book = await strapi.documents('api::book.book').create({
      data: {
        title: 'Rel Book', slug: 'rel-book', sku: 'SKU-REL-1',
        byline: 'PGS.TS. Châu Ngọc Hoa (Chủ biên)',
        authors: [author.documentId], publisher: pub.documentId, category: cat.documentId,
        tableOfContents: [{ text: 'Chương 1' }, { text: 'Chương 2' }],
        format: 'PDF', language: 'Tiếng Việt', coverUrl: 'https://example.com/c.jpg', downloadCount: 0,
      },
      status: 'published',
      populate: ['authors', 'publisher', 'category', 'tableOfContents'],
    });
    expect((book as any).authors[0].name).toBe('Rel Auth');
    expect((book as any).publisher.name).toBe('Rel Pub');
    expect((book as any).category.slug).toBe('rel-cat-path');
    expect((book as any).tableOfContents).toHaveLength(2);
    expect((book as any).tableOfContents[0].text).toBe('Chương 1');
    expect(book.language).toBe('Tiếng Việt');
    expect(book.byline).toBe('PGS.TS. Châu Ngọc Hoa (Chủ biên)');
  });

  it('hides drafts from the published document status', async () => {
    await strapi.documents('api::book.book').create({ data: { title: 'Pub One', slug: 'pub-one', sku: 'SKU-PUB-1' }, status: 'published' });
    await strapi.documents('api::book.book').create({ data: { title: 'Draft One', slug: 'draft-one', sku: 'SKU-DRAFT-1' }, status: 'draft' });
    const published = await strapi.documents('api::book.book').findMany({
      status: 'published', filters: { sku: { $in: ['SKU-PUB-1', 'SKU-DRAFT-1'] } },
    });
    const skus = published.map((b: any) => b.sku);
    expect(skus).toContain('SKU-PUB-1');
    expect(skus).not.toContain('SKU-DRAFT-1');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd cms && bun run test tests/api/book.test.ts`
Expected: FAIL — `api::book.book` not registered.

- [ ] **Step 3: Create the `toc.line` component**

Create `cms/src/components/toc/line.json`:
```json
{
  "collectionName": "components_toc_lines",
  "info": { "displayName": "TOC Line", "icon": "bulletList" },
  "options": {},
  "attributes": {
    "text": { "type": "string", "required": true }
  }
}
```

- [ ] **Step 4: Create the book schema**

Create `cms/src/api/book/content-types/book/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "books",
  "info": { "singularName": "book", "pluralName": "books", "displayName": "Book" },
  "options": { "draftAndPublish": true },
  "pluginOptions": {},
  "attributes": {
    "title": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "title", "required": true },
    "byline": { "type": "string" },
    "editor": { "type": "string" },
    "authors": { "type": "relation", "relation": "manyToMany", "target": "api::author.author" },
    "publisher": { "type": "relation", "relation": "manyToOne", "target": "api::publisher.publisher" },
    "category": { "type": "relation", "relation": "manyToOne", "target": "api::category.category" },
    "description": { "type": "richtext" },
    "tableOfContents": { "type": "component", "repeatable": true, "component": "toc.line" },
    "year": { "type": "integer" },
    "pages": { "type": "integer" },
    "fileSize": { "type": "string" },
    "format": { "type": "enumeration", "enum": ["PDF", "EPUB", "Chm"] },
    "language": { "type": "string" },
    "sku": { "type": "string", "required": true, "unique": true },
    "rating": { "type": "decimal" },
    "ratingCount": { "type": "integer" },
    "downloadCount": { "type": "integer", "default": 0 },
    "dateAdded": { "type": "date" },
    "isFeatured": { "type": "boolean", "default": false },
    "isNew": { "type": "boolean", "default": false },
    "cover": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "coverUrl": { "type": "string" },
    "file": { "type": "media", "multiple": false, "allowedTypes": ["files"] },
    "downloadUrl": { "type": "string" }
  }
}
```

- [ ] **Step 5: Create the factory controller/route/service**

Create `cms/src/api/book/controllers/book.ts`, `routes/book.ts`, `services/book.ts` — factory files with `api::book.book`.

- [ ] **Step 6: Run to verify it passes**

Run: `cd cms && bun run test tests/api/book.test.ts`
Expected: PASS (all three cases).

- [ ] **Step 7: Commit**

```bash
git add cms/src/components/toc cms/src/api/book cms/tests/api/book.test.ts
git commit -m "feat(cms): book collection + toc.line component"
```

---

## Task 5: `article` collection

**Files:**
- Create: `cms/src/api/article/content-types/article/schema.json` (+ controller/route/service)
- Test: `cms/tests/api/article.test.ts`

**Interfaces:**
- Produces: `api::article.article` (Draft/Publish) with `title`, `slug:uid`, `excerpt:text`, `content:richtext`, `author:manyToOne → author`, `byline:string`, `category:manyToOne → article-category`, `cover:media`, `coverUrl:string`, `readTime:string`.
- Consumes: `api::author.author`, `api::article-category.article-category`.

- [ ] **Step 1: Write the failing test**

Create `cms/tests/api/article.test.ts`:
```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('article content type', () => {
  it('has draft/publish, richtext content and the right relations', () => {
    const ct = strapi.contentType('api::article.article');
    expect(ct.options?.draftAndPublish).toBe(true);
    expect(ct.attributes.content.type).toBe('richtext');
    expect((ct.attributes.author as any).relation).toBe('manyToOne');
    expect((ct.attributes.author as any).target).toBe('api::author.author');
    expect((ct.attributes.category as any).target).toBe('api::article-category.article-category');
  });

  it('stores HTML content and links author + category', async () => {
    const author = await strapi.documents('api::author.author').create({ data: { name: 'Art Auth', slug: 'art-auth' } });
    const cat = await strapi.documents('api::article-category.article-category').create({ data: { name: 'Cận lâm sàng', slug: 'can-lam-sang' } });
    const article = await strapi.documents('api::article.article').create({
      data: {
        title: 'Bài viết A', slug: 'bai-viet-a', excerpt: 'tóm tắt',
        content: '<p>Nội dung <strong>HTML</strong></p>', readTime: '7 phút đọc',
        byline: 'BS. Nguyễn Văn Hùng', author: author.documentId, category: cat.documentId,
      },
      status: 'published',
      populate: ['author', 'category'],
    });
    expect(article.content).toContain('<strong>HTML</strong>');
    expect((article as any).author.name).toBe('Art Auth');
    expect((article as any).category.slug).toBe('can-lam-sang');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd cms && bun run test tests/api/article.test.ts`
Expected: FAIL — `api::article.article` not registered.

- [ ] **Step 3: Create the article schema**

Create `cms/src/api/article/content-types/article/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "articles",
  "info": { "singularName": "article", "pluralName": "articles", "displayName": "Article" },
  "options": { "draftAndPublish": true },
  "pluginOptions": {},
  "attributes": {
    "title": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "title", "required": true },
    "excerpt": { "type": "text" },
    "content": { "type": "richtext" },
    "author": { "type": "relation", "relation": "manyToOne", "target": "api::author.author" },
    "byline": { "type": "string" },
    "category": { "type": "relation", "relation": "manyToOne", "target": "api::article-category.article-category" },
    "cover": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "coverUrl": { "type": "string" },
    "readTime": { "type": "string" }
  }
}
```

- [ ] **Step 4: Create the factory controller/route/service**

Create `cms/src/api/article/controllers/article.ts`, `routes/article.ts`, `services/article.ts` — factory files with `api::article.article`.

- [ ] **Step 5: Run to verify it passes**

Run: `cd cms && bun run test tests/api/article.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add cms/src/api/article cms/tests/api/article.test.ts
git commit -m "feat(cms): article collection"
```

---

## Task 6: `branding.theme-tokens` component + `branding` single type

**Files:**
- Create: `cms/src/components/branding/theme-tokens.json`
- Create: `cms/src/api/branding/content-types/branding/schema.json` (+ controller/route/service)
- Test: `cms/tests/api/branding.test.ts`

**Interfaces:**
- Produces: component `branding.theme-tokens` with the 16 token string fields (mirrors `ColorTokens` in `frontend/src/config/theme.ts`); single type `api::branding.branding` with `name`, `description`, `accentLabel`, `light`/`dark` (theme-tokens, non-repeatable), `logo:media`, `siteTitle`, `siteDescription`.
- Consumes: nothing.

- [ ] **Step 1: Write the failing test**

Create `cms/tests/api/branding.test.ts`:
```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('branding single type', () => {
  it('is a single type with light/dark token components', () => {
    const ct = strapi.contentType('api::branding.branding');
    expect(ct.kind).toBe('singleType');
    expect((ct.attributes.light as any).component).toBe('branding.theme-tokens');
    expect((ct.attributes.dark as any).component).toBe('branding.theme-tokens');
  });

  it('accepts a full light/dark token set', async () => {
    const tokens = {
      bg: '#f8fafc', surface: '#ffffff', surfaceMuted: '#f1f5f9', border: '#e2e8f0',
      text: '#0f172a', textMuted: '#475569', primary: '#1d4ed8', primaryHover: '#1e40af',
      primaryContrast: '#ffffff', accent: '#d97706', accentContrast: '#ffffff', success: '#16a34a',
      warning: '#d97706', danger: '#dc2626', info: '#0284c7', focusRing: '#3b82f6',
    };
    const entry = await strapi.documents('api::branding.branding').update({
      documentId: undefined as any, // single type: create-or-update
      data: { name: 'Oxford Medical Sapphire', accentLabel: 'Xanh Sapphire Y Khoa', light: tokens, dark: tokens },
      populate: ['light', 'dark'],
    } as any);
    expect((entry as any).light.primary).toBe('#1d4ed8');
    expect((entry as any).dark.focusRing).toBe('#3b82f6');
  });
});
```
> Note: for a single type the document service uses `update` without a `documentId` to create-or-update the singleton. If the installed API rejects the `undefined` documentId form, replace the create call with the REST-based single-type upsert used in Task 9's harness, or `strapi.db.query('api::branding.branding').create({ data: {...} })`. Keep the assertions identical.

- [ ] **Step 2: Run to verify it fails**

Run: `cd cms && bun run test tests/api/branding.test.ts`
Expected: FAIL — `api::branding.branding` not registered.

- [ ] **Step 3: Create the theme-tokens component**

Create `cms/src/components/branding/theme-tokens.json`:
```json
{
  "collectionName": "components_branding_theme_tokens",
  "info": { "displayName": "Theme Tokens", "icon": "paint" },
  "options": {},
  "attributes": {
    "bg": { "type": "string", "required": true },
    "surface": { "type": "string", "required": true },
    "surfaceMuted": { "type": "string", "required": true },
    "border": { "type": "string", "required": true },
    "text": { "type": "string", "required": true },
    "textMuted": { "type": "string", "required": true },
    "primary": { "type": "string", "required": true },
    "primaryHover": { "type": "string", "required": true },
    "primaryContrast": { "type": "string", "required": true },
    "accent": { "type": "string", "required": true },
    "accentContrast": { "type": "string", "required": true },
    "success": { "type": "string", "required": true },
    "warning": { "type": "string", "required": true },
    "danger": { "type": "string", "required": true },
    "info": { "type": "string", "required": true },
    "focusRing": { "type": "string", "required": true }
  }
}
```

- [ ] **Step 4: Create the branding single type**

Create `cms/src/api/branding/content-types/branding/schema.json`:
```json
{
  "kind": "singleType",
  "collectionName": "branding",
  "info": { "singularName": "branding", "pluralName": "brandings", "displayName": "Branding" },
  "options": { "draftAndPublish": false },
  "pluginOptions": {},
  "attributes": {
    "name": { "type": "string", "required": true },
    "description": { "type": "text" },
    "accentLabel": { "type": "string" },
    "light": { "type": "component", "repeatable": false, "component": "branding.theme-tokens" },
    "dark": { "type": "component", "repeatable": false, "component": "branding.theme-tokens" },
    "logo": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "siteTitle": { "type": "string" },
    "siteDescription": { "type": "text" }
  }
}
```
Create `cms/src/api/branding/controllers/branding.ts`, `routes/branding.ts`, `services/branding.ts` — factory files with `api::branding.branding`.

- [ ] **Step 5: Run to verify it passes**

Run: `cd cms && bun run test tests/api/branding.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add cms/src/components/branding cms/src/api/branding cms/tests/api/branding.test.ts
git commit -m "feat(cms): branding single type + theme-tokens component"
```

---

## Task 7: `download` + `book-request` collections

Two collections that reference the built-in user. Not publicly exposed.

**Files:**
- Create: `cms/src/api/download/content-types/download/schema.json` (+ controller/route/service)
- Create: `cms/src/api/book-request/content-types/book-request/schema.json` (+ controller/route/service)
- Test: `cms/tests/api/download.test.ts`, `cms/tests/api/book-request.test.ts`

**Interfaces:**
- Produces: `api::download.download` (`user:manyToOne → plugin::users-permissions.user`, `book:manyToOne → api::book.book`, `downloadedAt:datetime`, `bookTitle:string`); `api::book-request.book-request` (`title:string(req)`, `language:string`, `requester:manyToOne → user`, `status:enum default submitted`, `note:text`).
- Consumes: `api::book.book`, `plugin::users-permissions.user`.

- [ ] **Step 1: Write the failing tests**

Create `cms/tests/api/download.test.ts`:
```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('download content type', () => {
  it('relates to user and book with a snapshot title', () => {
    const ct = strapi.contentType('api::download.download');
    expect((ct.attributes.user as any).target).toBe('plugin::users-permissions.user');
    expect((ct.attributes.book as any).target).toBe('api::book.book');
    expect(ct.attributes.downloadedAt.type).toBe('datetime');
    expect(ct.attributes.bookTitle.type).toBe('string');
  });
});
```
Create `cms/tests/api/book-request.test.ts`:
```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('book-request content type', () => {
  it('has the status enum defaulting to submitted', () => {
    const ct = strapi.contentType('api::book-request.book-request');
    expect(ct.attributes.status.type).toBe('enumeration');
    expect((ct.attributes.status as any).enum).toEqual(['submitted', 'in_review', 'fulfilled', 'rejected']);
    expect((ct.attributes.status as any).default).toBe('submitted');
  });
  it('defaults status when omitted', async () => {
    const r = await strapi.documents('api::book-request.book-request').create({
      data: { title: 'Sách cần tìm', language: 'Tiếng Việt' },
    });
    expect(r.status).toBe('submitted');
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `cd cms && bun run test tests/api/download.test.ts tests/api/book-request.test.ts`
Expected: FAIL — types not registered.

- [ ] **Step 3: Create the download type**

Create `cms/src/api/download/content-types/download/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "downloads",
  "info": { "singularName": "download", "pluralName": "downloads", "displayName": "Download" },
  "options": { "draftAndPublish": false },
  "pluginOptions": {},
  "attributes": {
    "user": { "type": "relation", "relation": "manyToOne", "target": "plugin::users-permissions.user" },
    "book": { "type": "relation", "relation": "manyToOne", "target": "api::book.book" },
    "downloadedAt": { "type": "datetime" },
    "bookTitle": { "type": "string" }
  }
}
```
Create `cms/src/api/download/controllers/download.ts`, `routes/download.ts`, `services/download.ts` — factory files with `api::download.download`.

- [ ] **Step 4: Create the book-request type**

Create `cms/src/api/book-request/content-types/book-request/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "book_requests",
  "info": { "singularName": "book-request", "pluralName": "book-requests", "displayName": "Book Request" },
  "options": { "draftAndPublish": false },
  "pluginOptions": {},
  "attributes": {
    "title": { "type": "string", "required": true },
    "language": { "type": "string" },
    "requester": { "type": "relation", "relation": "manyToOne", "target": "plugin::users-permissions.user" },
    "status": { "type": "enumeration", "enum": ["submitted", "in_review", "fulfilled", "rejected"], "default": "submitted", "required": true },
    "note": { "type": "text" }
  }
}
```
Create `cms/src/api/book-request/controllers/book-request.ts`, `routes/book-request.ts`, `services/book-request.ts` — factory files with `api::book-request.book-request`.

- [ ] **Step 5: Run to verify they pass**

Run: `cd cms && bun run test tests/api/download.test.ts tests/api/book-request.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add cms/src/api/download cms/src/api/book-request cms/tests/api/download.test.ts cms/tests/api/book-request.test.ts
git commit -m "feat(cms): download and book-request collections"
```

---

## Task 8: `users-permissions.user` extension

Add `hospital`, `specialty`, `avatar`, `joinedDate` to the built-in user via the extensions folder.

**Files:**
- Create: `cms/src/extensions/users-permissions/content-types/user/schema.json`
- Test: `cms/tests/api/user-extension.test.ts`

**Interfaces:**
- Produces: `plugin::users-permissions.user` gains `hospital:string`, `specialty:string`, `avatar:media(images)`, `joinedDate:date` (merged with the plugin's existing attributes).
- Consumes: nothing.

- [ ] **Step 1: Write the failing test**

Create `cms/tests/api/user-extension.test.ts`:
```ts
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('user extension', () => {
  it('keeps built-in fields and adds profile fields', () => {
    const ct = strapi.contentType('plugin::users-permissions.user');
    expect(ct.attributes.email.type).toBe('email'); // built-in preserved
    expect(ct.attributes.hospital.type).toBe('string');
    expect(ct.attributes.specialty.type).toBe('string');
    expect(ct.attributes.avatar.type).toBe('media');
    expect(ct.attributes.joinedDate.type).toBe('date');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd cms && bun run test tests/api/user-extension.test.ts`
Expected: FAIL — `hospital` etc. undefined on the user content type.

- [ ] **Step 3: Create the extension schema (additions only)**

Create `cms/src/extensions/users-permissions/content-types/user/schema.json`:
```json
{
  "attributes": {
    "hospital": { "type": "string" },
    "specialty": { "type": "string" },
    "avatar": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "joinedDate": { "type": "date" }
  }
}
```
> Strapi deep-merges this with the plugin's user schema, so only the additions are listed. If the boot log warns the schema is invalid (older merge behavior), copy the plugin's full `user` schema from `node_modules/@strapi/plugin-users-permissions/dist/server/content-types/user/schema.json` and add the four attributes into it. The test in Step 1 (which asserts `email` is still present) catches a bad merge.

- [ ] **Step 4: Run to verify it passes**

Run: `cd cms && bun run test tests/api/user-extension.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add cms/src/extensions/users-permissions cms/tests/api/user-extension.test.ts
git commit -m "feat(cms): extend users-permissions user with profile fields"
```

---

## Task 9: GraphQL + public read permissions

Enable GraphQL and grant the public role find/findOne on published content only; verify drafts and private types are not exposed.

**Files:**
- Modify: `cms/package.json` (add `@strapi/plugin-graphql`)
- Modify: `cms/src/index.ts` (bootstrap public permissions)
- Test: `cms/tests/api/permissions.test.ts`

**Interfaces:**
- Produces: public role has `find`/`findOne` on `book`, `article`, `category`, `article-category`, `author`, `publisher`, and `find` on `branding`; GraphQL endpoint at `/graphql`.
- Consumes: all content types from Tasks 1–8.

- [ ] **Step 1: Install GraphQL plugin**

Run:
```bash
cd cms && bun add @strapi/plugin-graphql@5.54.0
```

- [ ] **Step 2: Write the failing test**

Create `cms/tests/api/permissions.test.ts`:
```ts
import request from 'supertest';
import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('public read permissions', () => {
  it('serves published books but hides drafts over public REST', async () => {
    await strapi.documents('api::book.book').create({ data: { title: 'Vis', slug: 'vis-book', sku: 'SKU-VIS-1' }, status: 'published' });
    await strapi.documents('api::book.book').create({ data: { title: 'Hid', slug: 'hid-book', sku: 'SKU-HID-1' }, status: 'draft' });
    const res = await request(strapi.server.httpServer)
      .get('/api/books?filters[sku][$in][0]=SKU-VIS-1&filters[sku][$in][1]=SKU-HID-1');
    expect(res.status).toBe(200);
    const skus = res.body.data.map((b: any) => b.sku);
    expect(skus).toContain('SKU-VIS-1');
    expect(skus).not.toContain('SKU-HID-1');
  });

  it('forbids public access to downloads', async () => {
    const res = await request(strapi.server.httpServer).get('/api/downloads');
    expect(res.status).toBe(403);
  });

  it('answers a GraphQL query for books', async () => {
    const res = await request(strapi.server.httpServer)
      .post('/graphql')
      .send({ query: '{ books { documentId title } }' });
    expect(res.status).toBe(200);
    expect(res.body.data.books).toBeDefined();
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `cd cms && bun run test tests/api/permissions.test.ts`
Expected: FAIL — public `GET /api/books` returns 403 (no permission yet) and/or `/graphql` 404.

- [ ] **Step 4: Grant public permissions in bootstrap**

Read the current `cms/src/index.ts` first (it has empty `register`/`bootstrap`). Replace the `bootstrap` function body so it calls the helper below, keeping any existing content. Full file:
```ts
import type { Core } from '@strapi/strapi';

const PUBLIC_READ: Record<string, string[]> = {
  'api::book.book': ['find', 'findOne'],
  'api::article.article': ['find', 'findOne'],
  'api::category.category': ['find', 'findOne'],
  'api::article-category.article-category': ['find', 'findOne'],
  'api::author.author': ['find', 'findOne'],
  'api::publisher.publisher': ['find', 'findOne'],
  'api::branding.branding': ['find'],
};

async function setPublicReadPermissions(strapi: Core.Strapi): Promise<void> {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!publicRole) return;

  for (const [uid, actions] of Object.entries(PUBLIC_READ)) {
    for (const action of actions) {
      const actionId = `${uid}.${action}`;
      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action: actionId, role: publicRole.id } });
      if (!existing) {
        await strapi.db
          .query('plugin::users-permissions.permission')
          .create({ data: { action: actionId, role: publicRole.id } });
      }
    }
  }
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await setPublicReadPermissions(strapi);
  },
};
```

- [ ] **Step 5: Run to verify it passes**

Run: `cd cms && bun run test tests/api/permissions.test.ts`
Expected: PASS (all three cases).

- [ ] **Step 6: Run the full suite**

Run: `cd cms && bun run test`
Expected: every test file passes. (Boots Strapi once per file — allow a few minutes.)

- [ ] **Step 7: Commit**

```bash
git add cms/package.json cms/bun.lock cms/src/index.ts cms/tests/api/permissions.test.ts
git commit -m "feat(cms): enable graphql and public read permissions"
```

---

## Task 10: Generate types + document the read-only API token

Generate the Strapi content-type TS types (used by the seed script in Phase 2 and referenced by Phase 3), and document the manual read-only token step the automated tests don't cover.

**Files:**
- Create: `cms/types/generated/*.d.ts` (generated)
- Modify: `cms/README.md` (Phase 1 section: token + env)

**Interfaces:**
- Produces: committed generated types; documented `CMS_API_TOKEN` provisioning.
- Consumes: all types from Tasks 1–9.

- [ ] **Step 1: Generate types**

Run:
```bash
cd cms && bun run strapi ts:generate-types
```
Confirm `cms/types/generated/contentTypes.d.ts` and `components.d.ts` now include `api::book.book`, `api::article.article`, `branding.theme-tokens`, `toc.line`, and the extended user.

- [ ] **Step 2: Document the read-only token + env**

Append a "Phase 1 — content model" section to `cms/README.md` covering:
- The nine content types + user extension now exist; Draft/Publish is on book & article.
- To provision the frontend's read-only access: start the CMS (`bun run dev`), open Admin → Settings → API Tokens → Create token, type **Read-only**, copy it into the frontend env as `CMS_API_TOKEN` (server-side only), with `CMS_URL` pointing at the CMS origin.
- Public REST/GraphQL already serves published content anonymously; the token is for authenticated/rate-limited server fetches.

Actual text to add:
```markdown
## Phase 1 — Content model

Nine content types (book, article, category, article-category, author, publisher,
download, book-request) plus a branding single type and profile fields on the
users-permissions user. Draft/Publish is enabled on **book** and **article** only.

Public REST (`/api/...`) and GraphQL (`/graphql`) expose **published** book,
article, category, article-category, author, publisher, and branding. `download`
and `book-request` are not publicly readable.

### Read-only API token (for the frontend)
1. `bun run dev`, open the admin at `/admin`.
2. Settings → API Tokens → Create new token → Token type: **Read-only**.
3. Copy the token into the frontend env: `CMS_API_TOKEN=<token>` and
   `CMS_URL=<cms-origin>`. Keep it server-side only.
```

- [ ] **Step 3: Verify types compile**

Run:
```bash
cd cms && bun run build
```
Expected: build succeeds with the generated types in place.

- [ ] **Step 4: Commit**

```bash
git add cms/types cms/README.md
git commit -m "chore(cms): generate content-type types and document read-only token"
```

---

## Self-Review

**1. Spec coverage:**
- §2 ERD / all nine types + user extension → Tasks 1–8 (author, publisher, article-category, category, book, article, branding, download, book-request) + Task 8 (user). ✓
- §3.1 book 25 fields, enums, media+URL, TOC, Draft/Publish → Task 4. ✓
- §3.2 article HTML content, relations, Draft/Publish → Task 5. ✓
- §3.3 category string path slug + self parent → Task 3. ✓
- §3.4 article-category, §3.5 author, §3.6 publisher → Tasks 2, 1, 2. ✓
- §4.1 branding + theme-tokens (16 keys) → Task 6. ✓
- §4.2 download, §4.3 book-request → Task 7. ✓
- §4.4 user extension → Task 8. ✓
- §5 components (`toc.line`, `branding.theme-tokens`) → Tasks 4, 6. ✓
- §6 public read (published only), REST+GraphQL, roles/token → Task 9 (permissions/GraphQL) + Task 10 (token doc). Admin Editor/Admin role split is an admin-UI config noted for editorial hardening in Phase 6; Phase 1's automated gate is public-vs-private, covered by Task 9. ✓
- §8 verification (types exist, editor creates book/article/category, published fetchable, drafts hidden, TS types committed) → Tasks 4/5/3 create+publish tests, Task 9 draft-hiding, Task 10 type generation. ✓

**2. Placeholder scan:** No TBD/TODO/"handle edge cases". Every schema and test is spelled out. The two conditional notes (single-type upsert in Task 6, user-merge fallback in Task 8) give concrete alternative code paths, not placeholders. ✓

**3. Type consistency:** Relation targets match created UIDs (`api::author.author`, `api::publisher.publisher`, `api::category.category`, `api::book.book`, `api::article-category.article-category`, `plugin::users-permissions.user`). Helper names `setupStrapi`/`teardownStrapi` used identically across all test files. Component UIDs `toc.line` and `branding.theme-tokens` match their file paths and references. `language` is consistently a string (not enum) in schema and test. ✓
