# Latency budget — downloadsachyhoc-com

`operation, measured_ms, feedback_mechanism, blocking?, sync_or_async`

| operation | measured_ms | feedback_mechanism | blocking? | sync_or_async |
|---|---|---|---|---|
| page load (cached) | ~fast (LiteSpeed x-litespeed-cache: hit) | full page | yes | sync |
| open login modal | instant | modal appears | no | sync |
| ajax recommendation rail | n/a (errored logged-out) | inline error "Lỗi tải nội dung." | no | async |
| WOOF catalog filter | not measured | inferred inline refresh | partial | async (admin-ajax) |
| search (native) | not measured | server page | yes | sync |
| login (username+password) | not measured | modal → resume download | yes | sync |
| book download | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN (R1) |
| ~~(checkout)~~ | — | — | — | out of scope — no payment, no tiers |

## Rebuild budgets (targets)
| operation | our budget | our feedback |
|---|---|---|
| page load | < 1s | skeleton if slower |
| filter/search | < 300ms | instant/optimistic list update |
| download start | < 1s | button → progress, tokenized URL |

The download latency is UNKNOWN because the member area was not exercised — the BRIEF measures the
actual login and download timings (no checkout to measure — no payment/tiers).
