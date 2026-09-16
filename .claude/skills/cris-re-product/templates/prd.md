# PRD — <product name>

> Reverse-engineered from `<reference url>` on `<date>`. Evidence: `out/<slug>/`

## 0. Evidence basis — read before trusting anything below

<!-- Inline 01-features/EVIDENCE-BASIS.md VERBATIM. Do not summarize, do not soften.
     Regenerate it first if a later step changed the ratio. -->

```
EVIDENCE BASIS — <slug> — <date>
Features:  N   observed N (N%) · inferred N (N%) · guessed N (N%)
Blocked:   <blocked sources>
Ceiling:   <what is inferred-only and was never exercised>
```

Scope rows marked `[UNVERIFIED]` in §4 rest on evidence that was never exercised live.
Treat their estimates accordingly.

## 1. Problem and user

- **Primary user:**
- **Situation today:**
- **Why now:**

## 2. Success

| Metric | Baseline | Target | By when |
|---|---|---|---|

## 3. Constraints

Team · deadline · budget · stack · compliance

## 4. Scope

**In (MVP):** see `mvp-scope.md` — N features
**Out, deliberately:** the N features we are not building and why
**Cut line rationale:** one paragraph

## 5. Core jobs

Link `job-stories.md`. List the 5-7 story titles inline for readability.

## 6. Differentiation

Link `differentiation.md`. State each bet in one line with its number.

## 7. Domain model

Link `domain.md`. Inline the ERD. Call out the 2-3 workflows that carry the most complexity.

## 8. Screens

Link `screens.csv` and `patterns.md`. State the pattern count — that is the real UI estimate.

## 9. UX commitments

Link `ux-spec.md`. Inline the interaction rules that are product decisions rather than
visual ones (undo vs confirm, optimistic vs pessimistic, async job feedback).

## 10. Risks

Link `risks.md`. Inline the top 3 with their retiring experiment.

## 11. Open questions

Things genuinely undecided. Each with an owner and a date by which it blocks work.
Include the naive-reader check's top questions — they are the gaps a fresh reader actually
hit, not the ones we imagined they would.

## 12. Non-goals

Explicit list, so nobody relitigates.
