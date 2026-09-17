# Screen states — downloadsachyhoc-com

Filled from observation (public) + screens.csv. `not reached` = requires login (see BRIEF).

| Screen | empty | loading | error | forbidden | overflow | offline |
|---|---|---|---|---|---|---|
| Home | n/a (curated) | full-page cache, instant | not reached | n/a | rails capped | browser default |
| Book detail | n/a | server + ajax widgets | **observed: "Lỗi tải nội dung." on rails** | download → login modal (login only, no tier) | related capped | not reached |
| Category | empty-category note (not reached) | server render | not reached | n/a | pagination (inferred) | not reached |
| Search results | "no results" (not reached) | server render | not reached | n/a | pagination | not reached |
| Login modal | n/a | inline | inline field error (not reached) | n/a | n/a | not reached |
| Register modal | n/a | inline | inline field error (not reached) | n/a | n/a | not reached |
| Account dashboard | new-member state → prompt to browse (not reached) | not reached | not reached | members only | n/a | not reached |
| My library (downloads) | "no downloads yet" → CTA to catalog (not reached) | not reached | not reached | members only (all books) | pagination (not reached) | not reached |
| Account details | n/a | inline | inline validation (not reached) | members only | n/a | not reached |

`not reached` cells are design decisions the rebuild must make without reference precedent — the
account column is unreached and needs explicit attention (BRIEF §3.2). **No tier-gate/upsell, orders
or membership-status states exist** — those screens are cut (no tiers, no payment). The download
"forbidden" state is simply the login modal.
