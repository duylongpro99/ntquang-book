# MVP scope — downloadsachyhoc-com

Goal: **parity clone** for Vietnamese med students & residents. 52 features assigned to exactly
one column. `[UNVERIFIED]` = a `Now` row that is `inferred`/`guessed`, never exercised live
(the member area was logged out during recon) — these carry estimate risk.

**Scope decisions applied:** no payment integration · marketing-page removed · **no membership
tiers** · **no social login**. Access is **binary**: browse is public; **download requires a
username+password login and nothing more — any logged-in user downloads any book.** Membership (in
the sense of "having an account") is self-serve register; there is no tier to buy or arrange.

**Now = 21 / 52 (40%).** At the guide line, down from 46% — dropping the tier/access-ladder half
shrank the core. The on-site value is the irreducible loop *discover a book → log in → download
→ find it again in my library*. Everything monetization/tier/payment moved to Never.

## Now (21) — the browse→login→download loop + account + table stakes

| Feature | Reason | Flag |
|---|---|---|
| catalog.book-detail | the page users land on | observed |
| catalog.book-metadata | editor/language/publisher define a book | observed |
| catalog.category-browse | primary discovery over 79 specialties | |
| catalog.faceted-filter | 1,085 books are unusable without filters | [UNVERIFIED] |
| catalog.library-index | the "all books" entry | |
| catalog.recently-updated | homepage rail, main freshness signal | observed |
| search.site-search | keyword find is mandatory at this catalog size | |
| download.book-download | THE core action — login-gated only (no tiers) | observed |
| download.unlimited | every logged-in user downloads freely; throttle TBD | [UNVERIFIED] |
| download.protected-delivery | anti-piracy; serve file only to a logged-in user | [UNVERIFIED] guessed — scoping trap |
| auth.login | the single gate — username + password | observed |
| auth.register | acquisition entry — username + password | observed |
| auth.password-reset | table stakes | [UNVERIFIED] guessed |
| account.dashboard | member home | [UNVERIFIED] |
| account.downloads | My library — where members re-download (Bet 2) | [UNVERIFIED] |
| account.details | edit email/password | [UNVERIFIED] |
| support.contact-form | a support channel is mandatory | [UNVERIFIED] |
| content.static-pages | terms/privacy/about legally required | [UNVERIFIED] |
| notify.transactional-email | account emails (register confirm, password reset) | [UNVERIFIED] |
| seo.sitemaps | SEO baseline; near-free | observed |
| infra.caching | perf baseline for 1000s of pages | observed |

## Later (16) — merchandising, growth, secondary lines, SEO content

| Feature | Trigger to build |
|---|---|
| catalog.author-archive | when catalog SEO/browse depth matters (>launch) |
| catalog.related-books | when we optimize session depth |
| catalog.most-downloaded | when we have real download data to rank |
| catalog.recommended | when personalization is worth it (>1k members) |
| catalog.quick-view | polish sprint |
| catalog.cover-lightbox | polish sprint |
| catalog.book-tags | when curation/merch collections start |
| catalog.new-badges | with the freshness push (year labels only) |
| requests.request-book | when support can service requests at volume (any member) |
| ratings.star-rating | when there's review volume to show |
| ratings.submit-review | with ratings |
| social.proof-toast | first conversion-optimization pass (no VIP wording) |
| social.share | first virality pass |
| support.messenger-chat | quick add whenever support goes live on FB |
| content.blog | SEO content program |
| courses.catalog | if/when a (free) video-course line launches |

## Never (15) — do not build

| Feature | Why not |
|---|---|
| download.tier-gating | **no tiers** — access is binary (login = download anything) |
| membership.tiers | **no tiers** — no on-site pricing/compare page |
| membership.purchase | **no payment / no tiers** — nothing to buy on-site |
| membership.upgrade | **no tiers** — nothing to upgrade |
| membership.duration-expiry | **no tiers/expiry** — an account is simply active |
| membership.status | **no tiers** — nothing to display |
| membership.renewal | **no tiers/expiry** — nothing to renew |
| notify.renewal-reminder | **no tiers/expiry** — no reminders |
| membership.promo | **marketing-page removed** — no on-site promo campaigns |
| social.referral | **marketing-page removed** — no on-site referral program |
| courses.bonus-grant | **tier perk** — no tiers to grant against |
| account.orders | **no payment** — no order history |
| auth.google-oauth | **no social login** — username + password only |
| search.gcse | 3rd-party Google CSE is a legacy crutch; native search (Now) replaces it |
| membership.no-ads | a clean build has no ads to remove; "no ads" is a non-feature |

## Scoping traps flagged
- **download.protected-delivery** is `guessed` and in `Now`. The reference's actual anti-piracy
  mechanism was never observed. This is the highest-risk Now row — see risks.md R1.
- **The account half of Now is `[UNVERIFIED]`** (delivery, account home, My library). It was behind
  the login wall. Logging in (step 05 / BRIEF) retires most of this. Tier/payment risk no longer
  applies — those are out of scope entirely.
