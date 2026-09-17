# Recon report — downloadsachyhoc-com

Reference: https://downloadsachyhoc.com/
Date: 2026-09-16

```
AUTHORIZATION
  Relationship to target:  no relationship — user registered a free account for access
  ToS reviewed:            no
  Automated access:        silent (ToS not reviewed)
  Competitive analysis:    silent (ToS not reviewed)
  Basis to proceed:        user directs the analysis; access limited to public pages plus
                           the user's own authenticated account; silent ToS proceeded on
                           at user's discretion. Gentle access only — no aggressive
                           crawling, robots.txt honored for any bulk fetch.
```

Goal: parity clone. Depth: full pipeline 00–06.

---

## What this is

**downloadsachyhoc.com — "Thư viện y học số 1 Việt Nam"** — a Vietnamese online **medical-book
library** on WordPress + WooCommerce. It sells **membership tiers** that unlock unlimited
downloads from a catalog of ~1,085 medical books organized by specialty. Secondary product
line: medical **video courses**. Monetization is subscription/access, not per-book sales.

## Headline counts

| Thing | Count |
|---|---|
| Books (products, `/sach/{slug}/`) | ~1,085 (1001 + 84 across 2 product sitemaps) |
| Book categories (hierarchical, 12 top-level) | 79 |
| Authors (product attribute `pa_tac-gia`) | 666 |
| Membership tiers | 4 (Thường / VIP / GOLD / DIAMOND) |
| Static pages | 6 |
| Blog posts / post categories | ~12 / 6 |
| Discovered route templates | 18 (see routes.txt) |

## Stack (see tech-observations.md)

WordPress 5.6 · WooCommerce 3.5.3 · LiteSpeed + LiteSpeed Cache · theme `medicalbook` (Flatsome-based) ·
WOOF product filter · Yoast SEO · Contact Form 7 · Google CSE search · Google OAuth login ·
FB Messenger chat · live social-proof toast · membership/download gating (plugin not fingerprinted).

## Observed (with proof)

- **Book product page** layout: cover, editor (Chủ biên), language, publisher, "Tải sách"
  CTA, specialty breadcrumb, tags, description, related books, ratings, sidebar of new books.
  — screenshot `ss_5320pbnv0`.
- **Download is login-gated**: clicking "Tải sách" opens a login modal (username/email +
  password + Google OAuth). — screenshot `ss_55920307d`.
- **Login/register surface** with Google OAuth on `/my-account/`. — screenshot `ss_2122cdwvo`.
- **Live social-proof toast** ("{name} vừa mới đăng ký Tài khoản VIP") — observed on product page.
- **Membership pricing** (`/goi-tai-khoan/`) — 4 tiers, prices, durations, benefit deltas, promo.

## Blocked / partial sources (set the confidence ceiling)

```
BLOCKED  WP REST API        /wp-json/ → "REST API is not working" (disabled) — no catalog dump
BLOCKED  i18n / SPA bundle  none — server-rendered WP; asset combination masks plugin handles
PARTIAL  authenticated area provided browser session was LOGGED OUT. Account dashboard
                            (downloads list, orders, membership status, book-request form,
                            video-courses area) is INFERRED from pricing + UI, not exercised.
BLOCKED  live API traffic   admin-ajax calls not captured while logged out (widgets errored)
INFERRED download delivery  actual PDF delivery path (protected file handler vs uploads dir)
                            not verified — login-gated.
```

To lift the PARTIAL ceiling: the user can log into this Chrome session, after which steps 05
(UX) can capture the account dashboard, download flow, and book-request form as `observed`.

## Files produced

`raw/` (sitemaps, robots, index.html, product/packages/account HTML, wp-json probe) ·
`routes.txt` (18 templates, nav/orphan marked) · `strings.txt` (146 lines — UI microcopy +
taxonomy; note: content site, not an i18n corpus) · `endpoints.csv` · `pricing-matrix.md` ·
`changelog.md` · `tech-observations.md`.
