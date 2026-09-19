# Development Runbook

Developer guide for the **Sách Y Học Online** medical-book library — a two-service
monorepo: a Strapi 5 headless CMS (`cms/`) and a Next.js 16 frontend (`frontend/`).
The frontend reads all content from the CMS over REST using a server-side API token.

> New here? Read this top to bottom once, then use the [Cookbook](#8-cookbook)
> for day-to-day commands.

---

## 1. Architecture at a glance

```
┌────────────────────┐        REST /api/*  (Bearer API token)      ┌─────────────────┐
│  frontend/  (Next)  │  ───────────────────────────────────────▶  │  cms/  (Strapi) │
│  App Router, SSR/ISR│        server-side fetch only               │  REST + GraphQL │
│  port 3000          │  ◀─────────────────────────────────────    │  port 1337      │
└────────────────────┘        JSON (published content)             └─────────────────┘
        │                                                                    │
        │ browser                                                            │ sqlite (dev)
        ▼                                                                    ▼ postgres (prod)
     visitors                                                          media: public/uploads
```

- **Runtime:** Bun is the package manager for both packages; the **Strapi process runs on Node**
  (its bin has a `#!/usr/bin/env node` shebang). You still type every command as `bun run …`.
- **Data direction:** the CMS never calls the frontend. The frontend fetches **published** content
  server-side; the API token is **never** exposed to the browser.
- **No root workspace tooling** — each package installs and runs independently.

### Content model (9 types + branding)
`book`, `article`, `category` (self-relation tree), `article-category`, `author`, `publisher`,
`download`, `book-request`, plus a `branding` single type. **Draft/Publish is enabled on `book`
and `article` only** — the frontend requests `status: "published"`, so unpublished rows are
invisible until published.

---

## 2. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node | ≥ 20, ≤ 26 | runs Strapi |
| Bun  | latest  | package manager + task runner |
| Git  | any     | |
| openssl | any  | generating CMS secrets |

Postgres is **not** needed for local dev (CMS uses SQLite locally).

---

## 3. First-time setup (do this in order)

The frontend shows nothing until the CMS is running **and seeded** **and** an API token is wired.
Follow all four steps.

### 3.1 CMS — install, configure, run

```bash
cd cms
cp .env.example .env          # fill in the REQUIRED secrets (see below)
bun install                   # if prompted: bun pm trust @swc/core core-js-pure
bun run develop               # watch mode → http://localhost:1337/admin
```

Generate each secret with `openssl rand -base64 16` and paste into `.env`:
`APP_KEYS` (comma-separated, ≥2 keys), `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`,
`TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`. Leave `DATABASE_CLIENT=sqlite` for dev.

Create an admin user (no browser needed):

```bash
./node_modules/.bin/strapi admin:create-user \
  --firstname=Admin --lastname=Local --email=admin@local.dev --password='DevAdmin123'
```

On first boot, `src/index.ts` **auto-grants public read** permissions for the content types the
frontend needs — you do not configure REST permissions by hand.

### 3.2 CMS — seed the catalog

```bash
cd cms
bun run seed                  # idempotent: upserts by slug/sku/name
bun run seed:verify           # confirms counts + round-trip integrity
```

Seed source is **vendored** in `cms/scripts/seed/data/` (books, articles, categories, theme) and
runs in dependency order (categories → article-categories → authors → publishers → books →
articles → branding). It only writes to SQLite unless `--force` / `SEED_ALLOW_PROD=1` is set.

### 3.3 Mint the frontend API token

1. Open `http://localhost:1337/admin` → **Settings → API Tokens → Create new token**.
2. **Token type: `Read-only`.** Name it e.g. `frontend-read`. Copy the token now (shown once).

> ⚠️ In Strapi 5 an API token carries its **own** permission set, independent of the public role.
> Use **Read-only** so the token cannot read the private `download` / `book-request` collections.
> A `Full access` token would silently expose those.

### 3.4 Frontend — configure and run

```bash
cd frontend
cp .env.example .env.local     # then edit .env.local
```

Set in `.env.local`:

```
CMS_URL=http://localhost:1337        # no trailing slash
CMS_API_TOKEN=<the read-only token from 3.3>
```

```bash
bun install
bun run dev                    # → http://localhost:3000
```

Both `CMS_URL` and `CMS_API_TOKEN` are **required** — the data layer throws on startup if either
is missing. There is no `.env.local` in git (it holds a secret); every dev creates their own.

---

## 4. Day-to-day: running the two services

Open two terminals:

```bash
# terminal 1
cd cms && bun run develop      # :1337  (admin + API, autoreload)

# terminal 2
cd frontend && bun run dev     # :3000  (Next dev server)
```

Content edited in the CMS admin appears on the frontend within the ISR window
(`revalidate = 60s` on pages) — hard-refresh after ~1 min, or restart `bun run dev`.

---

## 5. Verification (run before every commit / PR)

| Package | Command | Gate |
|---------|---------|------|
| frontend | `bun run test` | vitest unit suite |
| frontend | `bunx tsc --noEmit` | types clean |
| frontend | `bun run lint` | Biome (see caveat) |
| cms | `bun run typecheck:seed` | seed scripts type-clean |
| cms | `bun run test` | API + seed jest suites (spins up Strapi on SQLite) |

> **Lint caveat:** `frontend` currently has a backlog of Biome findings (accessibility
> `useButtonType`, `<img>` vs `next/image`, array-index keys). These are **Phase 6 hardening**
> items, not wiring bugs. Keep *new* code clean — run `bun run lint:fix` on files you touch —
> but a red `lint` today reflects the backlog, not your change.

---

## 6. How the frontend talks to the CMS

All access goes through `frontend/src/lib/cms/`:

| File | Responsibility |
|------|----------------|
| `client.ts` | `cmsFetch()` — builds the URL, sends `Authorization: Bearer <token>`, sets ISR `revalidate`/tags. Throws on missing env or non-2xx. |
| `books.ts` / `categories.ts` / `articles.ts` / `branding.ts` | typed repositories (list/get/search, category tree, branding). |
| `mappers.ts` | reshapes raw Strapi entries into the app's `Book` / `Article` / `CategoryItem` / theme types. |
| `types.ts` | the content contract consumed by pages/components. |

**Add a new CMS-backed page/section:**
1. Add/extend a repository function in `src/lib/cms/*` (populate the relations you need; set a cache
   `tag`). 2. Map the response in `mappers.ts` — keep it null-safe (see §7). 3. Consume it in a
   Server Component under `app/`. 4. Add a unit test beside the repo/mapper.

**Resilience already built in (don't regress it):**
- Root `app/layout.tsx` fetches the category tree + branding with fallbacks, so a CMS outage
  degrades to an empty nav rather than a site-wide 500.
- `app/error.tsx` + `app/global-error.tsx` catch render errors.
- `getBranding()` falls back to `DEFAULT_THEME`; `formatCmsDate()` returns `""` on bad dates;
  numeric book fields default to `0`.

---

## 7. Conventions & gotchas

- **Vietnamese UI copy** (`lang="vi"`). Book content is bilingual VN/EN. **No** pricing, tiers,
  checkout, or Google-login UI (see `design.md`).
- **Theme/branding** comes from the CMS `branding` single type, rendered server-side into CSS
  variables in `layout.tsx`. Central token definitions live in `frontend/src/config/theme.ts`.
- **Null-safety in mappers is mandatory** — CMS fields can be null. Guard optional relations with
  `?.`, default numbers used with `.toLocaleString()`, and never let one bad row throw during render.
- **`category.slug` is a plain string, not a `uid`** — the seed supplies it explicitly.
- **Draft content is invisible** to the frontend until published. If new content "isn't showing,"
  check it's Published and wait out the 60s ISR window.
- **Secrets never leave the server:** `CMS_API_TOKEN` is used only in `src/lib/cms/*` (Server
  Components / route handlers). Never import the CMS client into a `"use client"` component.

---

## 8. Cookbook

```bash
# Reset local CMS data and re-seed
cd cms && rm -f .tmp/data.db && bun run develop   # (new terminal) then: bun run seed

# Re-seed without dropping the DB (idempotent upserts)
cd cms && bun run seed && bun run seed:verify

# Full local verification sweep
cd frontend && bun run test && bunx tsc --noEmit
cd ../cms && bun run typecheck:seed && bun run test

# Production build check (needs a reachable CMS + valid .env.local)
cd frontend && bun run build

# Create/refresh a CMS admin user
cd cms && ./node_modules/.bin/strapi admin:create-user \
  --firstname=Admin --lastname=Local --email=admin@local.dev --password='DevAdmin123'
```

---

## 9. Project status (what's done vs. pending)

Delivery is phased — see [`cms-plan.md`](./cms-plan.md).

| Phase | Scope | Status |
|-------|-------|--------|
| 0–2 | CMS scaffold, content model, data migration/seed | ✅ done |
| 3 | Frontend data-access layer; site fully CMS-driven | ✅ done |
| 4 | Branding/theme via CMS | ✅ done |
| **5** | **Real auth + login-gated downloads** (Strapi Users & Permissions) | ⛔ **not started** |
| **6** | **Hardening** (lint backlog, book-request workflow, ops) | ⛔ **not started** |

**Known non-production areas (Phase 5/6 — expected, by design):**
- `src/context/AuthContext.tsx` is a **client-side mock**: login/register accept any input, downloads
  produce a placeholder blob (not the real file), history is seeded with hardcoded records.
- Contact (`app/lien-he`) and profile (`app/tai-khoan/thong-tin`) forms are stubs — no POST.
- `SocialProofToast` shows fabricated activity.
- `book-request` has no create wired on either side.

Do not describe the site as production-complete until Phase 5 lands.

---

## 10. Deployment (summary)

Full CMS deploy steps live in [`../cms/README.md`](../cms/README.md). In short:

1. **CMS:** provision Postgres, set `DATABASE_CLIENT=postgres` + `DATABASE_URL`, fresh secrets, and
   `URL=https://cms.<domain>`. `bun install && bun run build && bun run start` under pm2/systemd,
   behind nginx/Caddy (TLS). Back up `public/uploads` with the DB. Seed once
   (`SEED_ALLOW_PROD=1 bun run seed` against the prod DB, or transfer from a seeded instance).
2. **Frontend:** set `CMS_URL=https://cms.<domain>` and a **read-only** `CMS_API_TOKEN` minted on
   the prod CMS; `bun run build && bun run start` (port 3000) behind the same proxy.
3. **CORS/security (Phase 6):** the CMS currently allows `*` origins and exposes `/graphql`
   publicly — tighten both before a public launch.
```
