# Architecture — Medical e-book library (build of downloadsachyhoc-com clone)

> Companion to `PRD.md`. Where the PRD says *what to build*, this says *how to build it*.
> Scope is the **binary-access** model: browse is public; **download requires a
> username+password login; any logged-in account downloads any book.** No tiers, no payment,
> no social login, no marketing-page. (See `PRD.md` §4, `mvp-scope.md`.)

> **Evidence caveat (read first).** The reference's **protected-delivery mechanism was never
> observed** (login wall — see `PRD.md` §0, `risks.md` R1). The delivery design in §4 is the
> *recommended* design for our build, not a description of the reference. R1 must be retired
> (step 05 / `05-ux/BRIEF.md`) before the delivery layer is locked. Nothing else here depends
> on unobserved reference internals — we are building our own stack, not porting theirs.

---

## 1. Tech stack — DECIDED (2026-09-16)

The reference runs **WordPress 5.6 + WooCommerce 3.5.3 + LiteSpeed** (`00-recon/tech-observations.md`).
Once tiers, payment and social login are cut, **WooCommerce is dead weight** — there is nothing to
sell. What remains is: a catalog, faceted search over ~1,085 books, a username+password login, a
gated file download, and a small account area. We build this **clean-room as a modern custom app**
(the WordPress-without-WooCommerce alternative was considered and rejected — no commerce means no
reason to run a large CMS).

**The committed stack:**

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router, TypeScript)** | SSG/ISR for the ~1,085 catalog + category pages (SEO); API routes host member auth + download. Reads content from Strapi at build/ISR. |
| Language | **TypeScript** end-to-end | Pages, API, and the migration scripts. |
| **Admin / CMS** | **Strapi 5** (separate Node service) | Owns content (Book/Category/Author/Collection) + admin UI + RBAC. Catalog management surface — see §8. |
| Database | **PostgreSQL** — **Strapi** owns content tables, **Drizzle ORM** owns app tables (users/sessions/downloads) | One instance, two table sets; `unaccent` extension powers VN search (R6). |
| **Book files (PDF)** | **Cloudflare R2 — private bucket** | Delivered by short-TTL **presigned URL** after auth; VPS carries no bytes — see §4. (Google Drive dropped; keep only as optional offline backup.) |
| **Book covers** | **Cloudflare R2 — public bucket** + CDN | Public image assets; R2 = no egress fees. Separate bucket from PDFs. |
| Search | **PostgreSQL full-text + `unaccent`** | Diacritic-insensitive. Criteria in §6. Meilisearch only if FTS ranking proves insufficient (deferred). |
| Auth | **Own username+password**, argon2id, DB-backed session cookie (httpOnly/Secure/SameSite) | No OAuth. **No email → no self-serve reset yet** (§5). |
| Rate limiting | **`rate-limiter-flexible`** (Postgres or in-memory store) | Enforces the R7 download throttle at the delivery layer. |
| Email | **NONE (v1)** | Deferred by decision — see §5. No provider, no transactional mail. |
| Hosting | **Existing VPS** — two Node services (Next.js app + Strapi) behind nginx (PM2/systemd or Docker) | Not Vercel. Static/ISR pages cached at nginx; file bytes go direct from R2 (§4). |

**Consequences of the storage + hosting choices (important):**
- Both PDFs and covers live on **R2**, so the **VPS never carries file bytes** — critical, because
  the VPS is resource-constrained. The VPS only authorizes a download and issues a `302` to a
  presigned URL; R2 serves the bytes directly, egress-free (§4).
- Two R2 buckets: **private** (PDFs, presigned-only) and **public** (covers, CDN). Never mix them —
  a public PDF bucket would leak the catalog.
- **Two Node services on the VPS** (Next.js + Strapi) + Postgres — real memory cost. Mitigated by the
  public hot path being static files (Strapi is out of it, §8); still, cap Strapi's resources and
  size the box for both. This is the price of an off-the-shelf CMS.
- Google Drive was rejected as the **delivery** store: it has **no short-TTL signed URL**, so it
  would force streaming every book through the constrained VPS. It plays a **backup-only** role
  (below). R2 is primary + delivery.
- **Backup/archive tier = pooled Google Drive (multiple accounts).** Master PDFs are copied from R2
  to Drive as a redundant, effectively-free backup (multi-account pooling gives ~unlimited free space
  at 15 GB/account). It is **backup only** — never in the delivery path, so the presigned-R2 design
  (§4) is untouched. Operational cost: track which file lives in which account, and mind each
  account's Drive API quota (fine for a periodic backup job, not for hot reads). R2 remains the
  source of truth; Drive is the copy.

### Package versions

Resolved from the **npm registry on 2026-09-16** (`npm view <pkg> version`) — actual latest, not a
guess. Re-run the install command to pick up anything newer at build time.

```jsonc
// package.json — dependencies
{
  "dependencies": {
    "next": "^16.3.5",
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "drizzle-orm": "^0.45.2",
    "postgres": "^3.4.9",                 // postgres.js driver
    "argon2": "^0.45.1",                  // password hashing
    "jose": "^6.2.12",                    // signed session cookie (or use a DB session token)
    "@aws-sdk/client-s3": "^3.1133.0",    // Cloudflare R2 (S3-compatible) — PDFs (private) + covers (public)
    "@aws-sdk/s3-request-presigner": "^3.1133.0", // mint short-TTL presigned download URLs (§4)
    "zod": "^4.6.5",                      // input validation on API routes
    "rate-limiter-flexible": "^11.2.0"    // R7 download throttle
  },
  "devDependencies": {
    "typescript": "^7.0.2",               // TS 7 (native compiler) is current
    "drizzle-kit": "^0.31.10",            // migrations
    "@types/node": "^22.20.3",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0"
  }
}
```

> **Notes:** Next.js **16** (App Router) and TypeScript **7** are the current majors — confirm your
> VPS Node version meets Next 16's minimum before pinning. `googleapis` is **not** a dependency —
> PDFs are on R2, not Drive (§4).
>
> **Re-resolve latest at install:**
> ```bash
> npm install next@latest react@latest react-dom@latest drizzle-orm@latest postgres@latest \
>   argon2@latest jose@latest @aws-sdk/client-s3@latest @aws-sdk/s3-request-presigner@latest \
>   zod@latest rate-limiter-flexible@latest
> npm install -D typescript@latest drizzle-kit@latest @types/node@latest \
>   @types/react@latest @types/react-dom@latest
> # verify any single package:  npm view <pkg> version
> ```

No email, search, or payment libraries are listed **by design**: email is deferred (§5), search is
native Postgres FTS (no dependency), and there is no payment (`PRD.md` §12).

---

## 2. System context

```
                       ┌────────────────────────────────────────────┐
                       │                 CDN / edge                  │
                       │   (SSG catalog pages, static assets)        │
                       └───────────────┬────────────────────────────┘
                                       │
        public browse (no auth)        │        authed actions (session cookie)
   ┌───────────────────────────────────┴───────────────────────────────────┐
   │                            Web app (Next.js)                           │
   │  catalog pages · search · book detail · auth modal · account area      │
   └───────┬───────────────────────┬───────────────────────┬───────────────┘
           │                       │                        │
   ┌───────▼───────┐      ┌────────▼────────┐      ┌────────▼─────────┐
   │  PostgreSQL   │      │  Search index   │      │ Object storage   │
   │  books, users │      │  (Meili/FTS)    │      │  (PRIVATE bucket)│
   │  downloads    │      │                 │      │  book PDFs       │
   └───────────────┘      └─────────────────┘      └────────┬─────────┘
                                                            │ signed URL / streamed
                                                   only after auth check (R1)
   ┌──────────────────────────────────────────────────────────────────────┐
   │  Email provider (transactional only: register-confirm, password-reset)│
   └──────────────────────────────────────────────────────────────────────┘
```

There is **no payment gateway, no OAuth provider, no entitlement/tier service** — those boxes exist
in the reference and are deliberately absent (`PRD.md` §12).

---

## 3. Data model (in-scope entities only)

From `02-domain/entities.csv` — in-scope rows only. Out-of-scope reference entities
(`Plan`, `Membership`, `Order`, `CourseGrant`, `Promotion`, `User.google_id`) are **not** in the
schema; they are retained in the domain doc as reconnaissance.

**Schema ownership:** **Strapi** owns `Book`, `Category`, `Author`, `Collection` (content — defined
as Strapi content-types, §8). **Drizzle** owns `User`, `Session`, `Download` (app tables). Both on
one Postgres. `Download.book_id` is a **soft reference** to a Strapi book id (no cross-owner FK).

**Core (MVP):**

- **Book** — `id, title, slug, cover_image, editor_author, language(vi|en|translated), publisher,
  sku, description(html), file(pointer to private object), rating_avg, download_count, year(label
  only), created_at`. `file` is the pointer to the private object-storage key — never a public URL.
- **Category** — `id, name, slug, parent_id(self-ref, 3 levels), book_count`. Specialty tree
  (79 categories).
- **Author** — `id, name, slug`. 666 terms; free-text `editor_author` on Book plus normalized Author.
- **Collection** — `id, name` (tags: "sách hay" / "tải nhiều").
- **User** — `id, username(login id), email, password_hash(argon2/bcrypt), display_name,
  role(visitor|member|admin), registered_at`. **No `google_id`, no tier/plan/expiry field.**
  `role=member` means simply "any logged-in account" — it grants download of every book.
- **Download** — `id, user_id→User, book_id→Book, downloaded_at`. Append-only event log; **powers
  My library** (Differentiation Bet 2) and `download_count`.

**Relations (in-scope ERD):**

```
Category ──parent──┐
   ▲               │
   └── Book ──many──┴── Category        Book ──many── Author
        │                               Book ──many── Collection
        └── Download ──many── User      (User 1──many Download)
```

**Later (do not build in v1, schema stubs only when triggered):** `BookRequest`, `Review`, `Post`,
`Course` — see `mvp-scope.md` Later column and `entities.csv` rows 39–59.

---

## 4. Protected file delivery (R1 — the load-bearing design)

**This is the one subsystem that must be right.** PDFs live in a **private R2 bucket** (decided §1);
delivery uses the **presigned-URL + redirect** pattern so the **VPS carries zero download bytes** —
essential on a constrained VPS.

1. PDFs live in a **private R2 bucket** (no public read). The Strapi Book record's **`pdf_key`**
   field stores the **R2 object key** (§8 — PDFs are not Strapi Media Library items), never a
   public URL. Covers live in a **separate public** R2 bucket (Strapi Media → public bucket).
2. The app holds the R2 credentials server-side only. On an authed `GET /api/books/:id/file`:
   - verify a valid logged-in session (binary model — no per-book entitlement check; the only
     question is "is this request authenticated?");
   - check the **R7 rate limit** for this user (below);
   - mint a **short-TTL presigned GET URL** (e.g. 60–300 s) for the object using
     `@aws-sdk/s3-request-presigner`, and **`302`-redirect** the client to it.
3. R2 streams the bytes **directly to the client**; they never pass through the VPS. The presigned
   URL is unguessable and expires quickly, so it cannot be a permanent shareable link. R2 egress is
   free, so this costs nothing per download.
4. Every mint writes a **Download** row (drives My library + `download_count`). Log at mint time
   (the redirect), since R2 serves the bytes out of band.

**Residual sharing risk (accepted):** within the TTL window a user could hand the presigned URL to
someone else — the standard trade for any signed-URL scheme. Keep the TTL short and lean on the R7
rate limit; this is acceptable for our threat model (no per-book entitlements to protect anyway).

**R7 (abuse) hooks here:** with every book free to any account, enforce a per-account download
**rate limit** (`rate-limiter-flexible`) inside this route — N/hour, M/day (exact numbers = open
decision, `PRD.md` §11). It gates URL *minting*, which is the only step on our infrastructure.

**Still worth the R1 probe:** whether the reference leaks files from a guessable
`/wp-content/uploads/...` path (`00-recon/tech-observations.md` §Delivery). We are not copying the
reference — but if its files are already public, we must treat the migrated catalog as
**already-exposed** and rely on our R2 private copies being the protected ones.
Retire R1 before Phase 1 (`05-ux/BRIEF.md` §3.2).

---

## 5. Auth

- Username + password only. Passwords hashed with argon2id. httpOnly, Secure, SameSite session
  cookie (DB-backed session, or signed with `jose`). No OAuth, no social buttons anywhere in the UI
  (`06-ui/components.md` AuthModal).
- Flows in v1: **register** (username + password; email is an optional profile field, **not**
  verified) and **login**. Roles: `visitor` (anonymous — browse only), `member` (any logged-in
  account — download anything), `admin` (catalog management, out of the public app). No tier dimension.
- **No email in v1 (decided §1) → two consequences:**
  - **No register email confirmation** — accounts are active immediately on registration.
  - **No self-serve password reset** — `auth.password-reset` and `notify.transactional-email` are
    **deferred out of v1** (were `Now`; now blocked on email). Interim: **admin-assisted reset**
    (an admin sets a new password). Re-add self-serve reset when email lands.
- The download CTA has exactly **two** outcomes (`PRD.md` §9): logged in → deliver; logged out →
  contextual login modal → resume download. No third "upgrade" state exists.

---

## 6. Search & catalog

**Search engine (R6):** Vietnamese diacritic-insensitive matching is mandatory ("chan doan" must
match "chẩn đoán"). Implementation: Postgres `unaccent` + full-text (a `tsvector` column, GIN
index), refreshed on write. Meilisearch/Typesense only if FTS ranking or typo-tolerance proves
insufficient (deferred, no dependency added now). Replaces the reference's Google CSE
(`search.gcse` = Never).

**What the free-text query matches** (single search box), by weight:

| Weight | Field(s) | Source |
|---|---|---|
| A (highest) | **Book title** | `Book.title` |
| B | **Author** (both the free-text `Chủ biên` and the normalized author) | `Book.editor_author` + `Author.name` |
| C | **Category / specialty name** (so a specialty term finds its books) | `Book.categories → Category.name` |
| C | **Publisher** | `Book.publisher` |
| D (lowest, phase 2) | **Description** | `Book.description` (stripped of HTML) |

All of the above are folded through `unaccent` + lowercased before indexing and querying.

**Facet filters** (`catalog.faceted-filter` — combine with or without a text query):

| Facet | Values | From |
|---|---|---|
| **Category** | specialty tree, hierarchical (79, 3 levels) | `Category` |
| **Author** | author terms (666) | `Author` |
| **Language** | `vi` \| `en` \| `translated` (sách dịch) | `Book.language` |
| **Year** | year label (display/filter only — no tier meaning) | `Book.year` |
| **Collection / tag** | e.g. "sách hay", "tải nhiều" | `Collection` |

**Sort options:** relevance (default when a query is present) · newest (`created_at`) · most-downloaded
(`download_count`). The reference did facets via WOOF + admin-ajax; we run them as filtered SQL
queries. `catalog.faceted-filter` is `[UNVERIFIED]` in scope — facet behavior was inferred, not
deeply observed.

**Findability target (Bet 1):** ≤ 2 clicks to any book. Author archives are reachable (the reference
left 666 author terms effectively unreachable). Catalog pages are SSG/SSR for SEO
(`seo.sitemaps` in Now); the ~1,085 detail pages + category pages are the SEO surface.

---

## 7. Non-functional

| Concern | Decision |
|---|---|
| **Performance** | Catalog is read-mostly → SSG/ISR, cached at nginx on the VPS; **both covers and PDFs served from R2** (off the VPS). The VPS handles only HTML/API + auth checks + URL minting — **no file bytes**, which is what keeps a small VPS viable. |
| **SEO** | Server-rendered catalog, XML sitemaps, clean `/sach/{slug}` + `/danh-muc-sach/...` routes preserved for parity/redirects. |
| **Security** | PDFs in a **private** R2 bucket, reachable only via short-TTL presigned URL after auth (R1, §4); per-account download rate-limit (R7); auth hardening (argon2id, CSRF on mutations, secure cookies); no PII in URLs; R2 credentials are a server-side secret, never shipped to the client; keep PDF and cover buckets separate. |
| **Data migration (R5)** | ~1,085 books × metadata × **cover → R2 public** × **PDF → R2 private** must be imported. REST API is disabled on the reference → scraping/manual pipeline that uploads each file to the right bucket. **Spike 20 books end-to-end before committing** (`risks.md` R5). |
| **Hosting/ops** | Single existing VPS: two Node services (Next.js + Strapi, §8) behind nginx; Postgres on the same box or managed. No Vercel/serverless. Files are on R2, so VPS backup = Postgres only. |
| **Backup** | Postgres: regular dumps. PDF masters: R2 → **pooled Google Drive** (multi-account, free redundant archive; backup-only, never in the delivery path — §1). Covers regenerable from masters. |
| **Observability** | Log download events (already a domain entity), auth events; basic error monitoring. |
| **i18n** | Vietnamese-first UI; content is Vietnamese. Not a multi-locale build. |
| **Multi-tenancy** | None — single-tenant content store (matches reference). |

---

## 8. Admin & content management (Strapi)

The catalog is managed in **Strapi 5** (`@strapi/strapi` ^5.54.0), run as a **separate Node service**
on the VPS. Strapi owns the content; the Next.js app reads it. This is the only "admin" surface —
it was scoped out of the public app (`screens.csv` is public + member only).

### Content-types (Strapi owns these)

| Content-type | Fields | Management operations |
|---|---|---|
| **Book** | title, slug (auto, unique), `cover` (Media → public R2), **`pdf_key`** (text — private-R2 object key, §4), editor_author, publisher, description (rich text), language(enum vi/en/translated), year, `categories` (relation, many), `authors` (relation, many), `collections` (relation, many). **`download_count` / `rating_avg` are computed in the app — not Strapi-edited.** | create / edit / draft-publish / unpublish |
| **Category** | name, slug, `parent` (self-relation), `children` | create / rename / **reparent** / reorder / delete. Lifecycle hook enforces **≤3 levels + no cycle**. `book_count` derived at read, not stored. |
| **Author** | name, slug | create / edit / **merge dupes** (custom action — 666 terms have migration dupes) |
| **Collection** | name, slug | flat CRUD ("sách hay", "tải nhiều") |

### File handling (the one custom piece)

Strapi has a **single global upload provider** and serves media by public URL — fine for **covers**
(`@strapi/provider-upload-aws-s3` → **public** R2 bucket, book `cover` field). But **PDFs must be
private** and delivered via presigned URL (§4), so they are **not** Strapi Media items:

- The Book carries a plain **`pdf_key`** field holding the private-R2 object key.
- **Bulk migration (R5)** uploads each PDF directly to private R2 and sets `pdf_key`.
- **New book added later:** a small **custom Strapi admin action / upload route** (the glue we build)
  puts the file in private R2 and writes `pdf_key`. This is the only bespoke admin code.
- Delivery is unchanged: the Next.js route reads `pdf_key` and mints the presigned URL (§4).

### How the public app consumes content (keeps the VPS light)

- Next.js pulls content from **Strapi's REST/GraphQL API at build + ISR revalidate**, so public page
  views hit **static files at nginx**, not Strapi. A Strapi **publish webhook** → Next.js
  revalidation endpoint refreshes changed pages. Strapi is out of the public hot path.
- Search (§6): the `tsvector` lives on the app side; keep it in sync from Strapi content on
  publish (webhook → reindex), or index at ISR build.

### Auth boundary

Strapi **admin users** (editors, RBAC inside Strapi) are entirely separate from public **members**
(username+password + session in the Next.js app, Drizzle — §5). Strapi's users-permissions plugin is
**not** used for members. Keep the Strapi admin panel on a restricted path / IP-limited.

### Strapi service — packages (its own `package.json`, not the Next.js app's)

Resolved from npm on 2026-09-16:

```jsonc
{
  "dependencies": {
    "@strapi/strapi": "^5.54.0",
    "@strapi/plugin-users-permissions": "^5.54.0",  // bundled; used for admin/API tokens, not members
    "@strapi/provider-upload-aws-s3": "^5.54.0",     // covers → public R2 (S3-compatible)
    "pg": "^8.23.0"                                   // Strapi's Postgres driver (knex)
  }
}
```

> Strapi 5 requires a current Node LTS — confirm the VPS Node version satisfies **both** Strapi 5
> and Next 16 before pinning. `@strapi/provider-upload-aws-s3` is configured with the R2
> S3-endpoint + the **public** bucket; the private PDF bucket is handled by our own `@aws-sdk` code
> (§4), not this provider.

---

## 9. What we are explicitly NOT building (architecture consequences)

Cut per `PRD.md` §12 — each removes a whole subsystem:

- **No payment gateway / order service** — no checkout, cart, order state machine, receipts.
- **No tier/entitlement engine** — no per-book access lookup, no plan/membership/expiry tables, no
  upgrade/renewal jobs, no renewal-reminder cron.
- **No OAuth integration** — no social-login provider, callback routes, or account-linking.
- **No marketing/pricing/referral surface.**

Removing these is the entire reason a lighter stack than the reference's is appropriate.

---

## 10. Open decisions that block architecture lock

**Decided (2026-09-16):** stack (§1 — Next.js 16/TS 7 · Postgres · **R2 for both PDFs (private) and
covers (public)** · presigned-URL delivery · Postgres FTS · own username+password auth · VPS hosting ·
**no email**). Remaining open items from `PRD.md` §11:

1. **R1 — verify the reference's delivery threat model** (owner: step 05 probe). Our delivery design
   (§4, R2 presigned URL) is set; the probe only tells us whether the reference's existing files are
   already public (→ treat migrated catalog as already-exposed). Do before Phase 1.
2. **R7 — download throttle numbers** (owner: user). Blocks §4 rate-limit config (N/hour, M/day).
3. **Catalog migration approach** (owner: build team; spike per R5). Writes Books/Categories/Authors
   into **Strapi** (via its Content API + admin token), uploads each cover to **public R2** and each
   PDF to **private R2** (setting `pdf_key`). Blocks import tooling.
4. **6-month success metric** (owner: user; `PRD.md` §2) — not architectural, but blocks Later
   sequencing in `roadmap.md`.
5. **When does email get added?** — gates re-adding self-serve password reset + register
   confirmation (§5). Deferred, not cancelled.
