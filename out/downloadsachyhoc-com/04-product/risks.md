# Risk register — downloadsachyhoc-com

Rated likelihood × impact (L/M/H). Each with the cheapest experiment to retire it.

| # | Risk | L | I | Why | Cheapest retiring experiment |
|---|---|---|---|---|---|
| R1 | **Protected download / anti-piracy mechanism unknown** — if PDFs are served from a guessable uploads URL, the whole catalog leaks (worse now: every logged-in user can reach every book, so a leaky URL leaks everything) | M | H | `download.protected-delivery` is `guessed`; reference delivery path never observed | Log into the reference (step 05), download one book, inspect the actual file URL + auth headers |
| ~~R2~~ | **OUT OF SCOPE — no payment.** No on-site checkout to build. | — | — | scope decision | — |
| ~~R3~~ | **OUT OF SCOPE — no tiers.** No tier×book entitlement to get right; access is binary (logged in ⇒ any book). This removes what was a top risk. | — | — | scope decision | — |
| ~~R4~~ | **OUT OF SCOPE — no tiers/expiry.** No 1yr cohort, no renewal, no reminder. | — | — | scope decision | — |
| R5 | **Catalog migration at scale** — importing ~1,085 books × metadata × cover × file | M | M | large dataset; source is a live site, not an export (REST disabled) | Scrape 20 books end-to-end as a pipeline spike; measure per-book effort |
| R6 | **Search quality for Vietnamese** — diacritics, synonyms; reference leans on Google CSE (Never) | M | M | native search must replace GCSE and handle VN tone marks | Prototype search on 100 titles; test accent-insensitive queries |
| R7 | **Download abuse without tiers** — with no per-account limits and every book free to any account, one account could scrape the whole catalog | L | M | `download.unlimited` — no cap modeled; throttle TBD | Decide a per-account rate/abuse limit; cheap to add at the delivery layer |
| R8 | **Video-courses line undefined** — unscoped secondary product (Later) could balloon | L | M | count, player all unknown | Defer; scope only when Later triggers |

Top risk to retire first: **R1 (protected delivery)** — retired by a single logged-in session on the
reference (step 05 / BRIEF), downloading one book and inspecting the file URL/auth. Dropping tiers
**removed the two other top risks** (R3 gating, R4 expiry). R7 (abuse) is the new risk that tiers
used to mask — worth an explicit throttle decision.
