# Coverage — downloadsachyhoc-com — blind spots

Headline: **49 features · observed 19 (39%) · inferred 27 (55%) · guessed 3 (6%) · ratio 1.6:1**

The 1.6:1 ratio is below the typical 2–3:1. Cause here is NOT under-delivered recon of the
public surface (that is well covered) — it is that this is a content/commerce WordPress site
whose customer-facing pages are mostly browsable, with **one concentrated blind spot: the
logged-in member area**, which recon could not reach (session logged out).

## Routes — all mapped
Every route template in `routes.txt` maps to a feature row (catalog, category, author, library,
packages, my-account, search, blog, static pages). None orphaned.

## String namespaces — all mapped
`nav.* auth.* product.* plan.* widget.* cat.*` each map to feature rows.

## Unmapped / uncertain — the actual blind spots

| Blind spot | Why it matters | Status |
|---|---|---|
| Account dashboard internals (tabs, layout) | core member UX for parity | inferred (logged out) |
| Downloads area — how a member finds & re-downloads books | central to the value prop | inferred |
| Checkout / payment flow & gateways (VND: bank transfer? card? momo?) | monetization; payment method unknown | inferred — NOT seen |
| Membership status & expiry UI | renewal/upgrade UX | inferred |
| Tier upgrade flow (pro-rated? credit?) | pricing FAQ says allowed, mechanics unknown | inferred |
| Book-request form (fields, quota per tier) | member perk | inferred |
| Video-courses catalog & player | secondary product line, unquantified | inferred (count unknown) |
| Review/rating submission | only display seen | guessed |
| Protected PDF delivery mechanism | anti-piracy; unverified | guessed |
| Per-book tier assignment UI/label | the access rule surfaced to users | inferred |
| Admin/back-office (catalog mgmt, tier assignment) | WP-admin, out of clean-room scope | not analyzed (intentional) |

## Endpoints
`admin-ajax.php` carries the dynamic behavior (WOOF filter, quick-view, widgets, add-to-cart)
but exact action names/payloads were not captured (logged out; widgets errored). Listed in
`endpoints.csv` as inferred.

## To lift the ceiling
User logs into this Chrome session → step 05 (UX) exercises the member flows and upgrades the
inferred rows to observed. Payment method is the single highest-value unknown for a parity clone.
