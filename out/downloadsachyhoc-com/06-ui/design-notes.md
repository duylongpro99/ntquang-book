# Design notes — downloadsachyhoc-com

```
EVIDENCE BASIS — downloadsachyhoc-com — 2026-09-16 (rev after 02-domain; UX ran logged-out, no upgrade)
Features:  52   observed 19 (37%) · inferred 29 (56%) · guessed 4 (8%)   ·  ratio 1.7:1
Blocked:   WP REST API disabled · no SPA/i18n bundle · AUTHENTICATED MEMBER AREA NOT CAPTURED
Ceiling:   All logged-in member behavior (account, downloads, review submission) is INFERRED
           ONLY; PDF delivery inferred/guessed. Public catalog, book detail, auth modal and
           support widgets are observed. The account & My-library artboards below are drawn
           from INFERENCE — verify against the live member area (05-ux/BRIEF.md, R1) before
           relying on them.
```

> **Scope note.** This design targets a build with **no membership tiers, no payment and no social
> login**. Access is binary: browse is public; **download requires only a username+password login;
> a logged-in user downloads any book.** The reference's tier/checkout/upgrade artboards are gone —
> several "inferred only" items in the basis block above are simply **not built**.

## Deliverables
- **Wireframes:** `06-ui/wireframes.html` — self-contained, open in any browser (**11 lo-fi
  artboards** in 3 flow rows). Source artboards in `06-ui/wireframes/*.dc.html` + `canvas.json`.
  (Kept local in the project per request — not published to a hosted canvas.)
- **Tokens:** `06-ui/tokens.json` — our own clinical-teal palette (NOT the reference's green).
- **Components:** `06-ui/components.md` — **24 components** across the 6 patterns.

## Coverage: every MVP pattern has an exemplar
Hi-fi exemplars (Gate C approved) are in `06-ui/hifi/` — open `06-ui/hifi/index.html`.
**Dropped:** marketing-page (pricing/promo/referral), payment/checkout, **membership tiers**
(no download-gating ladder — access is binary) and **social login** (username + password only).
**6 patterns.**

| Pattern | Lo-fi artboard(s) | Hi-fi exemplar |
|---|---|---|
| list-grid | Home, Category, Search (+empty) | `hifi/category.html` |
| product-detail | BookDetail (+loading) | `hifi/book.html` |
| modal-overlay | AuthModal (+error) | `hifi/login.html` |
| account-dashboard | Account, Downloads (+empty) | `hifi/account.html` |
| form | (contact / account-details) | reuse FormField from login; no checkout |
| article | static pages | blog/about — assembly from list-grid + prose |

## Rules a developer needs beyond the artboards

**Responsive (breakpoints from tokens.json):**
- ≥1024px: sidebar + grid as drawn (list-grid 3–4 cols; account 2-pane).
- 768–1023px: filter sidebar collapses to a top "Bộ lọc" drawer; grid 2–3 cols; account nav → top tabs.
- <768px: single column; mega-menu → full-screen category sheet; card grid 1–2 cols; sticky bottom CTA on book detail.

**Primary-action placement:** exactly one teal CTA per screen (**Tải sách** on book detail; **Đăng
nhập** in the auth modal). Never two competing primaries. On book detail mobile, the CTA sticks to
the bottom. No tier/purchase CTAs exist.

**Error presentation:** inline next to the field (see AuthError), never a bare error string.
The reference's leaked "Lỗi tải nội dung." rail becomes a skeleton that hides gracefully (BookLoading).

**Loading strategy (per latency-budget.md):** cached pages paint immediately; async rails/filter
use skeletons; the download action shows a progress affordance on the CTA.

**Download gate UX (Bet 2):** the download CTA has exactly two outcomes — logged in ⇒ the file
downloads; logged out ⇒ the **auth modal** (username + password) opens over the page and the
download resumes after login. **No tier badge, no upsell, no "you need a higher tier" state exists.**

**Auth modal:** username-or-email + password + submit + register/login toggle, and nothing else —
**no Google/social button**.

**Focus & keyboard:** modals trap focus, Esc closes (login/quick-view); visible focus ring uses
`--focusRing`; tab order follows visual order; the download CTA is reachable without a mouse.

**Motion:** minimal — modal fade/scale-in ~150ms; skeleton shimmer; toast slide-in. No decorative motion.

## Decisions taken at Gate C (updated after the tiers/payment/social-login cut)
1. **No tiers:** the download gate is login-only; TierGate artboard and TierBadge component removed.
2. **No payment:** checkout/order screens dropped.
3. **No social login:** auth modal is username + password only; Google button removed.
4. Account nav tabs (My library · Requests · Details · Logout) — inferred; confirm against the live
   member area (BRIEF §3.4) before build.
5. Download throttle/abuse policy (R7) — open; decide before shipping delivery.
