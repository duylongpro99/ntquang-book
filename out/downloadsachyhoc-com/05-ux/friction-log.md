# Friction log — downloadsachyhoc-com

Observed during the public (logged-out) pass. Member-area friction is deferred to the BRIEF.

| # | Feature | Moment | What I expected | What happened | Severity | Root cause |
|---|---|---|---|---|---|---|
| 1 | catalog.recommended | book page, logged out | recommended-books rail | dead "Lỗi tải nội dung." error blocks | hesitation | no feedback / gated silently |
| 2 | download.book-download | click "Tải sách" | a download or a clear "log in to download" | a bare login modal, no context why | hesitation | unclear label — modal doesn't say a login is all that's needed |
| 3 | search.site-search | type a query | forgiving search | placeholder demands correct diacritics ("gõ tiếng việt có dấu") | annoyance | accent-sensitive input |
| 4 | catalog.category-browse | drilling a specialty | 1–2 clicks to books | up to depth 4 (3 taxonomy levels + book) | annoyance | too many steps |
| 5 | content.blog | two blog entries | one news index | `/blog/` and `/tin-tuc/` both exist | annoyance | duplicate index (legacy) |
| 6 | download.book-download | anon on a book page | a plain "log in to download" promise | reference showed an ambiguous per-book "tier note" suggesting a login might still not be enough | hesitation | unclear promise |

Top items feeding differentiation.md: #2 + #6 (the gate/promise is ambiguous → Bet 2: **one honest
rule — logged in ⇒ any book**), #4 (deep nav → Bet 1). Our build removes the reference's tier-note
ambiguity entirely (no tiers). (Payment/tier friction removed — those halves are out of scope.)
