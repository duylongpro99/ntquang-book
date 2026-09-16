# Component inventory — downloadsachyhoc-com

Derived from the **6 layout patterns** (03-ia/patterns.md), unioned and deduped. **24 components**
cover ~90% of the 24 screens. Removed with scope cuts: marketing-page (PricingTable, PriceTag,
Accordion, PromoBanner) and now **TierBadge** and **MembershipCard** (no tiers). States listed as
default/hover/focus/active/disabled/loading/error where applicable.

## Global chrome (all patterns)
| # | Component | Purpose | Variants | Key states | Used by patterns | Screens |
|---|---|---|---|---|---|---|
| 1 | AppHeader | logo, value-props, nav, search, auth links | logged-out / member | default, sticky | all | all |
| 2 | MegaMenu | 79-category specialty tree dropdown | — | default, hover, open | all | header |
| 3 | GlobalSearch | catalog search input | inline / full | default, focus, loading, no-results | all | header, search |
| 4 | AppFooter | about, quick links, socials | — | default | all | all |
| 5 | AuthModal | login/register overlay — **username + password only (no social button)** | login / register | default, validating, error | modal-overlay | login, register |
| 6 | SocialProofToast | live signup notification (no tier wording) | — | enter, auto-dismiss | all | global |
| 7 | ChatLauncher | support chat entry | — | default | all | global |
| 8 | Breadcrumb | taxonomy path | — | default | list-grid, product-detail | category, book |

## list-grid
| 9 | BookCard | cover, title, editor, rating, quick-view | book / course / compact | default, hover, loading(skeleton) | list-grid | home, library, category, search, author |
| 10 | RatingStars | X/5 display (+ input variant) | display / input | default, half, empty | list-grid, product-detail | cards, book |
| 11 | FilterSidebar | WOOF-style facets (category/author/language) | — | default, applied, empty | list-grid | library, category |
| 12 | Pagination | page through results | numbered / load-more | default, disabled | list-grid | library, category, search |
| 13 | CardGrid | responsive grid wrapper | 2/3/4-col | default, empty, loading | list-grid | all list screens |
| 14 | Rail | horizontal curated strip ("Sách mới cập nhật") | — | default, loading, **error(owned)** | list-grid, product-detail | home, book |
| 15 | EmptyState | no-results / no-data | search / category / generic | default (with CTA) | list-grid, account-dashboard | search, My library |
| 16 | SortControl | order results | — | default, open | list-grid | library, category |

## product-detail
| 17 | MediaViewer | cover + lightbox zoom | — | default, zoomed | product-detail | book, course |
| 18 | MetaList | editor/language/publisher/SKU fields | — | default | product-detail | book |
| 19 | PrimaryCTA | "Tải sách" download action | download | default, hover, focus, loading; **logged-out → opens AuthModal, then resumes** | product-detail | book |
| 20 | ShareBar | social share buttons | — | default | product-detail | book |
| 21 | TabGroup | recommended EN/VN, description tabs | — | default, active, loading, error | product-detail, account-dashboard | book, account |

*No TierBadge — there is no tier to show. The download CTA has exactly two outcomes: download, or
open the login modal.*

## ~~marketing-page~~ — REMOVED
PricingTable, PriceTag, Accordion, PromoBanner dropped (feature not supported). **TierBadge also
dropped** — no tiers to display anywhere.

## account-dashboard
| 22 | AccountNav | tab/side nav (**my library · requests · details · logout**) | — | default, active | account-dashboard | account* |
| 23 | DataTable | **My library** (downloaded books) list | downloads | default, empty, loading, paginated | account-dashboard | acc-downloads |

*No MembershipCard, no Orders table — no tiers, no payment.*

## form
| 24 | FormField | labeled input + validation | text/email/password/select/textarea | default, focus, error, disabled | form, modal-overlay | contact, details, auth |

## Merge notes
- Course/article cards are BookCard variants, not new components.
- **No tier/membership/checkout/payment components** and **no social-login button** in AuthModal.
- PromoBanner removed; SocialProofToast kept (growth widget), stripped of "VIP" wording.
- 24 ≤ 50 ✓. No instance-cataloguing.

## Gaps pending BRIEF (member area unobserved)
The **My library** DataTable shape (columns, empty state, re-download control) is specified from
inference — confirm against the live member area (R1 delivery + the account view, BRIEF §3.2/§3.4)
before building the account pattern. No upsell/TierGate state exists to verify (no tiers); payment
(R2) does not apply.
