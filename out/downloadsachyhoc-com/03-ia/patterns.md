# Layout patterns — downloadsachyhoc-com

**6 patterns** (marketing-page removed; no tiers, no payment, no social login). Building these
well is the whole UI job.

## 1. list-grid  (8 screens)
Home, Library, Category, Author, Search, Courses catalog (Later), News index, News category.
- **Skeleton:** header → (optional filter sidebar / WOOF facets) → responsive grid of cards →
  pagination. Book card = cover, title, editor, star rating, quick-view.
- **Varies:** presence of filter sidebar (Library/Category yes; Home no — uses curated rails),
  card type (book vs course vs article), curated rails vs raw list (Home vs Library).
- *(Dedicated Google-CSE results page dropped — native search only.)*

## 2. product-detail  (2 screens)
Book detail, Course detail (Later).
- **Skeleton:** media (cover/lightbox) + meta column (fields + primary CTA) → tags/breadcrumb →
  description → related grid → sidebar rail (recently updated). AJAX widget tabs below.
- **Varies:** CTA — book "Tải sách" (proceeds if logged in, else login modal — **no tier gate**);
  course "play". No price, no tier badge.

## ~~3. marketing-page~~ — REMOVED (feature not supported)
Pricing/packages, referral promo, promo campaign are out of scope, **and** with the tier ladder now
dropped there is nothing left to sell on-site: no membership pricing/marketing/sales page at all.
Membership is arranged off-site. Components PricingTable/PriceTag/PromoBanner/Accordion are dropped.

## 4. article  (5 screens)
Blog post, About, Terms, Privacy, Download guide.
- **Skeleton:** title → prose body (+ optional related). Single column, wide readable measure.
- **Varies:** related-posts rail on blog; static pages are body-only.
- *(Upgrade guide and Order-received dropped — no tiers, no payment.)*

## 5. account-dashboard  (3 screens)  — detail-with-tabs
My Account, My library (downloads), Book requests (Later).
- **Skeleton:** left/tab nav (my library · requests · details · logout) → content panel per tab.
  **My library** (re-download table) is the hero of the landing — Bet 2.
- **Varies:** panel content (a table, a status line). ALL inferred — member area not captured.
- *(Membership status, Orders, Order detail, My courses dropped — no tiers/payment.)*

## 6. form  (3 screens)
Contact, Account details, Password reset. (Checkout/upgrade removed — no payment, no tiers.)
- **Skeleton:** labeled fields → validation → submit → success state.
- **Varies:** field set per form.

## 7. modal-overlay  (3 screens)
Login, Register, Quick view.
- **Skeleton:** dimmed backdrop → centered card → close (Esc). **Login = username + password fields
  only** (no Google/social button).
- **Varies:** auth form vs product peek.

## Merge notes
marketing-page removed; tiers/payment/social-login gone. Remaining 6 patterns: list-grid,
product-detail, article, account-dashboard, form, modal-overlay. Nothing over-splits. 6 ≤ 8 ✓.
