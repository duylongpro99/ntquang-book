# Roadmap — Medical e-book library build

> Sequences `mvp-scope.md` (Now 21 / Later 16 / Never 15) into build phases, gated by the risks in
> `risks.md` and the open questions in `PRD.md` §11. Access model is **binary** (log in ⇒ download
> any book); there is no tier/payment/social-login work anywhere on this roadmap.

> **Sizing caveat.** No 6-month success metric is set (`PRD.md` §2 = TBD), so Later sequencing is
> ordered by dependency and risk, not by a target number. Durations are **relative effort bands**,
> not committed dates — the team's stack choice (`architecture.md` §1) and the R5 migration spike
> set the real calendar. Re-run the naive-reader estimate after the stack is chosen (`PRD.md` §11).

---

## Phase 0 — De-risk (do before committing the build plan)

The two cheapest experiments that move the biggest unknowns. **Neither is feature work.**

**Stack is decided** (`architecture.md` §1): Next.js 16/TS 7 · Postgres · **R2** (PDFs private +
covers public) · presigned-URL delivery · Postgres FTS · own username+password auth · **VPS**
hosting · **no email in v1**. What's left to de-risk:

| Item | Retires | Output |
|---|---|---|
| **R1 probe** — log into the reference, download one book, inspect file URL + auth headers | R1 (delivery threat model) — top risk | Whether the reference's files are already public → migration threat model |
| **R5 migration spike** — pull 20 books end-to-end (metadata + cover **→ R2 public** + PDF **→ R2 private**) | R5 (catalog migration at scale) | Per-book effort estimate → sizes the import |
| **R2 delivery spike** — authed route → mint presigned URL → `302`, one book | R1 mechanism on our stack | Proven presigned delivery; confirms VPS carries no bytes |
| **R7 policy call** — per-account download rate limit (owner: user) | R7 (scrape abuse) | A number to enforce at URL minting |

Exit criterion: R1 answered, presigned delivery proven (VPS byte-free), a per-book migration
estimate exists. **Do not start Phase 1 delivery work before the R2 presigned spike passes** — it is
the spine of the product.

---

## Phase 1 — Walking skeleton (the irreducible loop)

The one honest loop end-to-end for a **small seed catalog** (from the R5 spike's 20+ books), thin
but complete. Proves the architecture before scaling content.

- **Strapi content model:** define the Book / Category / Author / Collection content-types + the
  R2 upload provider (covers) + the custom `pdf_key` upload glue (`architecture.md` §8). This is the
  admin surface; it also unblocks the migration importer.
- **Auth:** `auth.register`, `auth.login` — username+password, session cookie, accounts active
  immediately (no email confirmation). `auth.password-reset` + `notify.transactional-email` are
  **deferred out of v1** (no email — `architecture.md` §5); interim reset is admin-assisted.
- **Catalog (read):** `catalog.book-detail`, `catalog.book-metadata`, `catalog.library-index`,
  `catalog.category-browse` — Next.js reading Strapi at build/ISR.
- **The core action:** `download.book-download` + `download.protected-delivery` (private bucket +
  signed URL / handler per `architecture.md` §4) + `download.unlimited` **with the R7 rate limit
  wired in from day one**.
- **My library:** `account.dashboard`, `account.downloads` (re-download history — Bet 2),
  `account.details`.

Exit criterion: a new user can register, log in, find a seeded book, download it (served only when
authed), and re-download it from My library. **This is the product's spine** — everything else is
breadth on top of it.

---

## Phase 2 — Catalog at scale + findability

Turn the skeleton into a real library over all ~1,085 books.

- **Migration:** run the full catalog import (R5 pipeline from the spike) — writes into **Strapi**
  via its Content API, covers → public R2, PDFs → private R2. Highest-effort single item on the
  roadmap; gate it behind Phase-0 sizing.
- **Search (R6):** `search.site-search` — Vietnamese diacritic-insensitive. Replaces Google CSE.
- **Filtering:** `catalog.faceted-filter` (category / author / language / year), `catalog.recently-updated`.
- **Findability (Bet 1):** author reachability, ≤ 2 clicks to any book.
- **SEO baseline:** `seo.sitemaps`, `infra.caching` (CDN/ISR).

Exit criterion: full catalog live, searchable with VN accents, ≤ 2 clicks to any title, indexed.

---

## Phase 3 — Table stakes to launch

Everything legally/operationally required to open to the public.

- `support.contact-form`, `content.static-pages` (terms / privacy / about).
- Hardening pass: download rate-limit tuning (R7), auth hardening, error/latency polish
  (`05-ux/latency-budget.md`), non-happy states across the 6 patterns (`05-ux/states.md`).

Exit criterion: publicly launchable — the browse → login → download → My-library loop, over the full
catalog, with support + legal pages and abuse controls.

--- LAUNCH LINE (MVP = the 21 Now features) ---

## Phase 4+ — Later (16 features, trigger-gated — build only when the trigger fires)

Ordered by the triggers already recorded in `mvp-scope.md`; **none are date-committed.**

| Trigger fires → | Build |
|---|---|
| Catalog SEO/browse depth matters | `catalog.author-archive`, `catalog.related-books`, `catalog.book-tags`, `catalog.new-badges` |
| We have real download data to rank | `catalog.most-downloaded`, `catalog.recommended` (>1k members) |
| Polish sprint | `catalog.quick-view`, `catalog.cover-lightbox` |
| Support can service them at volume | `requests.request-book` (any member — no gating) |
| There's review volume to show | `ratings.star-rating`, `ratings.submit-review` |
| Conversion / virality pass | `social.proof-toast` (no VIP wording), `social.share` |
| Support goes live on FB | `support.messenger-chat` |
| SEO content program | `content.blog` |
| A (free) video-course line launches | `courses.catalog` (scope only when triggered — R8) |
| **Email is added** (SMTP/provider on the VPS) | `auth.password-reset` (self-serve) + `notify.transactional-email` (register confirm) — deferred from Now, not Never |

## Never (15) — off the roadmap permanently

All tier/membership/payment features, Google OAuth, order history, Google CSE, "no-ads". See
`mvp-scope.md` Never column. These are not deferred — they are **not part of this product**.

---

## Critical path & dependencies

```
Phase 0 (R1 probe + R5 spike + stack + R7)   ← must complete first
        │
        ▼
Phase 1 walking skeleton  ──(delivery design from R1)──┐
        │                                              │
        ▼                                              │
Phase 2 catalog at scale  ──(R5 pipeline)──────────────┘
        │
        ▼
Phase 3 table stakes ─► LAUNCH ─► Phase 4+ Later (trigger-gated)
```

**Single biggest schedule risk:** Phase-2 catalog migration (R5) — 1,085 books, REST API disabled,
no export. Its size is unknown until the Phase-0 spike runs. Do not commit a launch date before it.

**Blocking open questions** (`PRD.md` §11): R1 mechanism, R7 throttle, stack A/B, 6-month metric.
The first three gate Phase 0→1; the metric gates Phase 4+ prioritization only.
