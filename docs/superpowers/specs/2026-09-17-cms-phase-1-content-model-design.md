# CMS Phase 1 — Content Model — Design Spec

> Scope: **Phase 1** of `docs/cms-plan.md` — define the full Strapi 5 content model.
> Status: **approved design, ready for implementation plan**. Owner: long.dao@maritime-ds.com.
> Date: 2026-09-17.

---

## 1. Goal & context

Phase 0 scaffolded the Strapi 5 service (`cms/`) with Users & Permissions (refresh JWT,
httpOnly sessions), an upload MIME allow/deny list, and multi-DB config (SQLite local /
Postgres prod). **No content types exist yet** (`cms/src/api` is empty).

Phase 1 defines every collection type, component, relation, enum, and permission so that the
schema is **stable and complete up front** — later phases add behavior (auth, branding wiring,
download flow) without new content-type migrations.

**Done when:** an editor can hand-create one book + one article + a category and fetch them via
the public API using a read-only token; all nine content types + the user extension exist and
generate committed TS types.

### Decisions locked during brainstorming

1. **Scope = all collections now.** Build the full schema (nine content types + user extension),
   not just the content-critical subset. Later phases wire logic only.
2. **Author/Publisher = relations + raw byline.** `book` has `authors`/`publisher` relations
   **and** keeps the raw `byline`/`editor` strings for exact display. Seed does best-effort name
   linking; the verbatim string always survives.
3. **Media = media field + URL fallback.** `cover`/`file` are media fields **and** carry
   `coverUrl`/`downloadUrl` string fallbacks. Seed keeps today's Unsplash/placeholder URLs; real
   uploads later fill the media field with zero schema change. Mapper prefers media, falls back
   to URL.
4. **Article category = separate `article-category` collection** (relation), not an enum.
5. **`tableOfContents` = repeatable component** `toc.line { text }`, maps back to `string[]`.
6. **Category slug = plain string** (unique, required), not Strapi `uid` — preserves the
   path-style `noi-khoa/noi-tim-mach` form (uid strips `/`).
7. **`article.content` = rich-text field storing HTML** for byte-faithful migration; converting
   to Strapi Blocks is deferred to Phase 6.
8. **`authors` = manyToMany** (a book may have several authors; an author appears on several books).

---

## 2. Entity model (ERD)

```
category ──parent──▶ category        (self; manyToOne, children oneToMany)
   ▲ manyToOne
   │
book ──authors─────▶ author          (manyToMany)
book ──publisher───▶ publisher       (manyToOne)
book ──category────▶ category        (manyToOne)

article ──author───▶ author          (manyToOne)
article ──category─▶ article-category (manyToOne)

download ──user────▶ users-permissions.user (manyToOne)
download ──book────▶ book            (manyToOne)
book-request ──requester──▶ user     (manyToOne, optional)

branding (single type)
```

Nine content types (`book`, `article`, `category`, `article-category`, `author`, `publisher`,
`download`, `book-request`, `branding`) + the built-in `users-permissions.user` (extended).

**Draft/Publish enabled on `book` and `article` only.** All other types are always-live.

---

## 3. Collection definitions

### 3.1 `book` (collection · Draft/Publish)

| Field | Type | Constraints / notes |
|---|---|---|
| `title` | string | required |
| `slug` | uid (target `title`) | required, unique |
| `byline` | string | raw author string, exact display (e.g. `"PGS.TS. Châu Ngọc Hoa (Chủ biên)"`) |
| `editor` | string | optional (e.g. `"GS.TS. Nguyễn Văn Huy (Hiệu đính)"`) |
| `authors` | relation → `author` | **manyToMany** |
| `publisher` | relation → `publisher` | manyToOne |
| `category` | relation → `category` | manyToOne |
| `description` | rich text | plain text today; rich-text field |
| `tableOfContents` | component `toc.line` | **repeatable**; `{ text }` per entry |
| `year` | integer | |
| `pages` | integer | |
| `fileSize` | string | keep `"45.2 MB"` form v1 |
| `format` | enum | `PDF` \| `EPUB` \| `Chm` |
| `language` | enum | `Tiếng Việt` \| `English` \| `Song ngữ` |
| `sku` | string | unique — seed idempotency key |
| `rating` | decimal | |
| `ratingCount` | integer | |
| `downloadCount` | integer | default `0` |
| `dateAdded` | date | **explicit** — do not reuse Strapi `createdAt` |
| `isFeatured` | boolean | default `false` |
| `isNew` | boolean | default `false` |
| `cover` | media (image, single) | primary; empty until real uploads |
| `coverUrl` | string | URL fallback (Unsplash today) |
| `file` | media (file, single) | primary; empty until real assets |
| `downloadUrl` | string | URL fallback (placeholder path today) |

### 3.2 `article` (collection · Draft/Publish)

| Field | Type | Notes |
|---|---|---|
| `title` | string | required |
| `slug` | uid (target `title`) | required, unique |
| `excerpt` | text | |
| `content` | rich text | **stores HTML** (byte-faithful; Blocks deferred to Phase 6) |
| `author` | relation → `author` | manyToOne |
| `byline` | string | raw author string (e.g. `"BS. Nguyễn Văn Hùng"`) |
| `category` | relation → `article-category` | manyToOne |
| `cover` | media (image, single) | |
| `coverUrl` | string | URL fallback |
| `readTime` | string | e.g. `"7 phút đọc"` |
| `publishedAt` | (native Draft/Publish) | seed parses today's `dd/mm/yyyy` strings to datetime |

### 3.3 `category` (collection · tree)

| Field | Type | Notes |
|---|---|---|
| `name` | string | required |
| `slug` | **string** | required, unique; path-style `noi-khoa/noi-tim-mach` |
| `parent` | relation → `category` | manyToOne (self); `children` inverse oneToMany |

- `count` is **not stored** — derived by the data-access layer (Phase 3) from related published books.

### 3.4 `article-category` (collection)

| Field | Type | Notes |
|---|---|---|
| `name` | string | required (e.g. `"Kiến thức y học"`, `"Cận lâm sàng"`) |
| `slug` | uid (target `name`) | required, unique |

### 3.5 `author` (collection)

| Field | Type | Notes |
|---|---|---|
| `name` | string | required |
| `slug` | uid (target `name`) | required, unique |
| `bio` | text | optional |
| `avatar` | media (image, single) | optional |

### 3.6 `publisher` (collection)

| Field | Type | Notes |
|---|---|---|
| `name` | string | required |
| `slug` | uid (target `name`) | required, unique |

---

## 4. Deferred-behavior collections (schema now, logic in owning phase)

### 4.1 `branding` (single type) — wired in Phase 4

| Field | Type | Notes |
|---|---|---|
| `name` | string | brand/site name |
| `accentLabel` | string | |
| `light` | component `branding.theme-tokens` | light token group |
| `dark` | component `branding.theme-tokens` | dark token group |
| `logo` | media (image) | |
| `siteTitle` | string | site meta |
| `siteDescription` | text | site meta |

`branding.theme-tokens` component fields mirror `frontend/src/config/theme.ts` `ThemeConfig`
token keys (to be enumerated against that file during implementation).

### 4.2 `download` (collection) — logic in Phase 5

| Field | Type | Notes |
|---|---|---|
| `user` | relation → `users-permissions.user` | manyToOne |
| `book` | relation → `book` | manyToOne |
| `downloadedAt` | datetime | |
| `bookTitle` | string | optional snapshot — feeds the Phase 3 mapper's denormalized `bookTitle` |

### 4.3 `book-request` (collection) — workflow is "Later"

| Field | Type | Notes |
|---|---|---|
| `title` | string | required |
| `language` | string | requested language |
| `requester` | relation → `users-permissions.user` | manyToOne, optional |
| `status` | enum | `submitted` \| `in_review` \| `fulfilled` \| `rejected`; default `submitted` |
| `note` | text | optional |

### 4.4 `users-permissions.user` extension — auth logic in Phase 5

Add fields: `hospital` (string), `specialty` (string), `avatar` (media image), `joinedDate` (date).

---

## 5. Components

| Component | Fields | Used by |
|---|---|---|
| `toc.line` | `text` (string, required) | `book.tableOfContents` (repeatable) |
| `branding.theme-tokens` | token keys mirrored from `ThemeConfig` | `branding.light`, `branding.dark` |

---

## 6. API exposure, tokens, roles

- **Public role** (`find`/`findOne`, published content only): `book`, `article`, `category`,
  `article-category`, `author`, `publisher`, `branding`.
- **No public access**: `download`, `book-request`, user PII.
- **Read-only API token** (Strapi "Read-only" preset) for the frontend's server-side fetch,
  consumed as `CMS_API_TOKEN`.
- Expose both **REST and GraphQL** for published content.
- **Admin roles**:
  - **Editor** — `book`, `article`, `category`, `article-category`, `author`, `publisher`.
  - **Admin** — `branding`, users, `download`, `book-request`, permissions.

---

## 7. Non-goals (explicitly out of Phase 1)

- No seed / data migration (Phase 2).
- No frontend data-access layer or mapper (Phase 3).
- No branding→theme wiring (Phase 4).
- No auth / download flow logic (Phase 5).
- No HTML→Blocks conversion, webhooks, or `count` computation (Phase 3/6).

---

## 8. Verification (Phase 1 "Done when")

1. `admin` UI shows all nine content types + the extended user fields.
2. An editor hand-creates one `category`, one `book` (with relations resolved), and one
   `article` (with `article-category`), and publishes them.
3. Published entries are fetchable via REST **and** GraphQL using the read-only token;
   unpublished (draft) entries are **not** returned to the public role.
4. Generated content-type TS types are committed under `cms/`.
