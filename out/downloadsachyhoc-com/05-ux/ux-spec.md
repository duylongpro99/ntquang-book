# UX Spec — Medical e-book membership library (parity clone of downloadsachyhoc.com)

> Assembled from static evidence + a logged-out public browser pass of `https://downloadsachyhoc.com/`
> on `2026-09-16`. Probed features: 3 public flows (observed) · member flows deferred to `BRIEF.md`.
> **No login this run** → member features were NOT upgraded inferred→observed; basis unchanged.

```
EVIDENCE BASIS — downloadsachyhoc-com — 2026-09-16 (rev after 02-domain; UX ran logged-out, no upgrade)
Features:  52   observed 19 (37%) · inferred 29 (56%) · guessed 4 (8%)   ·  ratio 1.7:1
Blocked:   WP REST API disabled · no SPA/i18n bundle · AUTHENTICATED MEMBER AREA NOT CAPTURED
Ceiling:   All logged-in member behavior (account, downloads, review submission) is INFERRED
           ONLY. PDF delivery inferred/guessed. Public catalog, book detail, auth modal and
           support widgets are observed. Run BRIEF.md (logged-in) to retire R1 (protected
           delivery) and regenerate this block.
```

> **Scope note.** This spec now targets a build with **no tiers, no payment and no social login**:
> browse is public; **download requires only a username+password login; a logged-in user downloads
> any book.** The basis block above describes the *reference* (whose tier/checkout/upgrade behavior
> we never captured) — those halves are simply not built, so most of the old `[UNVERIFIED]` weight
> is gone. Only R1 (file delivery) still needs the logged-in probe.

## 1. Baseline
Source: `step-count.csv`. Member-path counts are inferred (marked 999 wait = unobserved).

| Task | Steps | Screen chg | Fields | Wait | Friction | Our target |
|---|---|---|---|---|---|---|
| Find a book (search) | 3 | 2 | 1 | ~2s | 1 | 2 steps, accent-insensitive |
| Find a book (browse) | 4 | 3 | 0 | ~2s | 1 | ≤2 clicks (Bet 1) |
| Register/login to download | 2 | 0 | 3 | ~1s | 1 | username+password only, resume on the book |
| Download a book | 2* | 0 | 0 | ?* | 1 | 1 click (logged in) — any book, no tier check (Bet 2) |

*inferred — see BRIEF. (No purchase, no tiers — a logged-in user downloads anything.)

## 2. Core flows
Full docs in `flows/`. Two mapped (purchase & tier flows removed — out of scope):
- **browse-to-book** (OBSERVED) — 5 branches; worst branch: logged-out recommendation rails error out.
- **download-gate** (OBSERVED to the gate) — binary now: logged in ⇒ file; logged out ⇒ login modal
  ⇒ file. No not-entitled/upsell branch (no tiers). Only R1 (delivery) is left to verify.

## 3. Screen states
See `states.md`. The **account column** reads `not reached` (member area was logged out) — the
remaining precedent-free design decisions, to be filled by the BRIEF. There is no
checkout/tier/orders column at all now.

## 4. Interaction rules
See `interaction-rules.md`. Adopt: contextual auth modal (**username + password only, no Google**),
single high-contrast CTA, mega-menu. Reject: leaked async error strings, dual search systems, dual
blog indexes.

## 5. Onboarding
See `onboarding.md`. The old "register ≠ access" risk is **gone** — registration *is* access. The
whole path is: click download → register (username+password) → file downloads. Keep the modal from
losing the user's place so the download resumes on the same book.

## 6. Latency budget
See `latency-budget.md`. Money-path latencies UNKNOWN (unobserved).

## 7. Microcopy intent
See `microcopy.md`. Three jobs: authority, urgency, plain money-action naming. Rewrite words, keep jobs.

## 8. Friction inventory (ranked → differentiation.md)
| # | Friction | Severity | Root cause | Opportunity |
|---|---|---|---|---|
| 1 | Download gate's promise is ambiguous (bare modal / tier note) | hesitation | unclear promise | Bet 2 — one honest rule: log in ⇒ any book |
| 2 | Deep-4 category nav | annoyance | too many steps | Bet 1 ≤2 clicks |
| 3 | Logged-out rails error | hesitation | un-owned state | graceful degradation |
| 4 | Accent-sensitive search | annoyance | rigid input | forgiving search |
(Payment/tier friction removed — those halves are out of scope.)

## 9. Open UX decisions
- **Download throttle** — with no tiers, is any book truly unlimited per account, or rate-limited to
  curb scraping (R7)? (owner: user).
- **Registration friction** — email verification before first download, or after? Keep it to
  username + password + email (owner: user).
- **New-member empty states** — what My library and the account home show before the first download
  (owner: BRIEF §3.2).
- ~~Not-entitled download UX / free-tier taste / off-site acquisition~~ — **resolved: no tiers.**
  Every logged-in user downloads everything; there is no gated/free split and no off-site step.
