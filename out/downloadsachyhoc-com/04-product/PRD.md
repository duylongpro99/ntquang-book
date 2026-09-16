# PRD — Medical e-book membership library (parity clone of downloadsachyhoc.com)

> Reverse-engineered from `https://downloadsachyhoc.com/` on `2026-09-16`. Evidence: `out/downloadsachyhoc-com/`

## 0. Evidence basis — read before trusting anything below

```
EVIDENCE BASIS — downloadsachyhoc-com — 2026-09-16 (rev after 02-domain)
Features:  52   observed 19 (37%) · inferred 29 (56%) · guessed 4 (8%)
Ratio:     inferred+guessed : observed = 1.7 : 1
Blocked:   WP REST API disabled (/wp-json/) · no SPA/i18n bundle (server-rendered WP) ·
           AUTHENTICATED SURFACE NOT CAPTURED — provided browser session was logged out
Ceiling:   The entire logged-in MEMBER experience is INFERRED ONLY, never exercised:
           account dashboard, downloads area, order/checkout flow, membership status &
           expiry, tier UPGRADE flow, book-REQUEST form, video-courses catalog & bonus
           grant, and review submission. Per-book tier gating and protected file delivery
           are inferred/guessed (delivery path unverified). Public catalog, book detail,
           pricing/packages page, login/register modal and support widgets ARE observed.
           A relatively high observed share (37%) reflects that this is a shallow-surface
           WordPress commerce site, not deep observation of the member area.
```

Scope rows marked `[UNVERIFIED]` in §4 rest on evidence that was never exercised live — now a
smaller set: the **account half** (protected delivery, account home, My library), since the
**tier/monetization half has been cut entirely** (no tiers, no payment, no social login). The
basis block above still describes the *reference*, whose member area we never captured; several of
its "inferred only" items (tier upgrade, checkout, courses/bonus) are simply **not built** now.
R1 (protected delivery) in `risks.md` is the one retiring experiment that still matters.

## 1. Problem and user

- **Primary user:** Vietnamese medical **students & residents** who need affordable, fast access
  to specialty textbooks and references (the reference's own audience: "cán bộ y tế" + students).
- **Situation today:** target books are expensive, scattered, or pirated ad-hoc; the reference
  aggregates ~1,085 titles behind a cheap membership but runs on a dated, opaque WordPress stack.
- **Why now:** the model is proven (the reference is a going concern with active promos and a
  living catalog); the opportunity is a cleaner, more trustworthy execution of the same loop.

## 2. Success

| Metric | Baseline | Target | By when |
|---|---|---|---|
| 6-month success metric | — | **TBD — blocks some scope prioritization** | TBD |

The user has not set a 6-month number. Recorded as TBD per pipeline rule rather than invented.
This blocks trade-off calls on the Later roadmap (e.g. how early to build courses, requests, or
richer merchandising). Revisit before committing that roadmap.

## 3. Constraints

No firm constraints given (team / deadline / budget open). **Recommendation, revised for the
simplified scope:** with no tiers, no payment and no social login, a full **WooCommerce + membership
plugin** stack is now oversized — the product is a catalog + login-gated file download + a small
account area. Options: (a) **WordPress without WooCommerce** — a custom post type for books, a
taxonomy for specialties, standard WP auth (username+password), and a protected-download handler;
or (b) a lightweight custom stack if Bets 1–2 (§6) justify it. Default recommend: (a) — cheapest
path to parity now that the commerce half is gone. Compliance: digital-goods delivery must still be
access-controlled to logged-in users (R1). **No payment gateway. No tier/entitlement engine.**

## 4. Scope

**Scope decisions:** no payment integration · marketing-page removed · **no membership tiers** ·
**no social login**. Access is **binary**: browse is public; **download requires a username+password
login and nothing more — any logged-in user downloads any book.** There is no tier to buy, gate,
upgrade or display; "membership" just means having an account (self-serve register).

**In (MVP):** see `mvp-scope.md` — **21 features** (browse → log in → download → My library + table stakes).
**Out, deliberately:** 16 Later (merchandising, growth, courses, requests, blog/SEO), **15 Never**
(all tier/membership/payment features, Google login, order history, Google CSE, "no-ads"). See `mvp-scope.md`.
**Cut line rationale:** the on-site product is one honest loop — discover a book, log in, download,
find it again in My library. `Now` is **40%** (at the guide, down from 46% after cutting the tier
half), fine for a **parity clone**. The remaining `[UNVERIFIED]` core (protected delivery, account
home, My library) is behind the login wall — retire R1 (step 05 / BRIEF) before estimating.
Tier-gating and payment risks no longer apply — those halves are cut.

## 5. Core jobs

See `job-stories.md` (5 jobs — the tier/status/renew jobs are gone):
1. Find a specific book fast · 2. Judge a book before committing · 3. Register / log in (username +
password) so I can download · 4. Download any book once logged in · 5. Get back to my books later
(My library).

## 6. Differentiation

See `differentiation.md`. Two modest bets, each with a number (tier/payment bets dropped — out of scope):
1. **Deep-catalog findability** — reference up to 4 clicks + authors unreachable → target ≤ 2 clicks to any book.
2. **Trustworthy download center** — reference's login gate + ambiguous per-book "tier note" →
   target one honest rule (logged in ⇒ every book) surfaced as a single "My library" view, 0 dead ends.

## 7. Domain model

See `domain.md`. ERD inlined there. The domain is now small — the only access rule is:
- **Access (binary):** browse is public; **download requires login; a logged-in user downloads any
  book.** No entitlement lookup, no per-book check. (state-machines.md §0.)
- The reference's **Membership.status**, **Book.min_tier ladder** and **Order.status** are all
  **out of scope** — no tiers, no payment. Retained in domain.md only as reconnaissance.

## 8. Screens

See `screens.csv` (24 screens) and `patterns.md`. **The real UI estimate is 6 layout patterns**,
not 24 screens: list-grid, product-detail, article, account-dashboard, form, modal-overlay.
(marketing-page, tier and payment screens removed.) Hi-fi exemplars in `06-ui/hifi/`.

## 9. UX commitments

To be finalized in `05-ux/` (needs the logged-in session). Product-level decisions already implied:
- The download CTA has exactly two outcomes: logged in → file downloads; logged out → **contextual
  login modal**, then resume the download. No third "you need a higher tier" state exists — Bet 2.
- The login/register modal asks for **username + password only** (no Google button).
- The account home leads with **My library** (re-download history), not a status/tier card (J5).

## 10. Risks

See `risks.md`. Cutting tiers removed two former top risks (R3 gating, R4 expiry). What remains:
- **R1 Protected-delivery mechanism unknown** (M×H) → download one reference book, inspect the file
  URL/auth. The one risk still retired by a logged-in session (step 05 / BRIEF).
- **R7 Download abuse without tiers** (L×M) → with no caps and every book free to any account, one
  account could scrape the catalog; decide a per-account throttle at the delivery layer.
- R2 (payment), R3 (tier gating), R4 (expiry) are all **out of scope**.

## 11. Open questions

- **6-month success metric** — owner: user; blocks Later-roadmap prioritization. **TBD.**
- **Protected file-delivery mechanism** — owner: step 05 (R1); blocks catalog/delivery build.
- **Download throttle / abuse policy** — with no tiers and every book free to any account, is there
  any per-account rate limit, or truly unlimited? (R7) — owner: user; blocks delivery design.
- **Video-courses scope** (count, player) — owner: user; deferred (Later). No pricing (no payment).
- ~~How is membership arranged off-site?~~ — **resolved by this change**: no tiers to arrange.
  "Membership" is now just self-serve registration (username + password); there is no off-site step.

### Naive-reader check (external, 2026-09-16)
A fresh engineering-lead agent read only PRD.md + mvp-scope.md. **Verdict: could not give a
confident estimate — the correct finding then**, because (a) the monetization + access half was
`[UNVERIFIED]` and (b) the stack was open. Conditional estimate at the time: ~8–14 pw on WooCommerce
(low), ~20–35 pw custom (very low). Its top 5 and their current status after the tier/payment cut:
1. **WooCommerce/plugin vs custom build?** — still open, but the answer shifts: WooCommerce is now
   oversized (no commerce) → lean WP-without-Woo or lightweight custom (§3). (owner: user)
2. **Protected-delivery mechanism?** — **still the top tech risk (R1).** (owner: step 05)
3. ~~Which payment gateway / `on_hold` flow?~~ — **moot: no payment.**
4. **Has the logged-in recon (step 05) happened?** — still pending; now only R1 rests on it (the
   tier/entitlement questions it would have answered are cut). (owner: this pipeline)
5. **"Unlimited downloads" — truly unlimited or throttled?** — still open, now framed as abuse
   control (R7) rather than entitlement design. (owner: user/step 05)

**Post-simplification note.** Removing tiers, payment and social login shrinks the build materially:
the estimate should come **down** from the WooCommerce figure above, and the biggest `[UNVERIFIED]`
risk (tier×book gating correctness) is gone. Re-run the naive-reader check after a stack is chosen.

## 12. Non-goals

- **No membership tiers** — no free/thuong/vip/gold/diamond ladder, no per-book gating, no upgrade,
  no expiry/renewal. Access is binary: logged in ⇒ download any book.
- **No payment integration** — nothing is sold on-site; there is no order, checkout or receipt.
- **No social login** — authentication is username + password only (no Google/OAuth).
- **No marketing-page** — no on-site pricing/compare page, promo campaigns, or referral program.
- Not carrying the reference's ad model ("no-ads" is a non-feature here).
- Not running two search systems (native search replaces Google CSE).
- Not building video courses, book-requests, or blog in v1.
- Not modeling the reference's internal DB — only the exposed domain.
