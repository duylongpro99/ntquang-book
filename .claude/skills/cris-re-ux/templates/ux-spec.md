# UX Spec — <product name>

> Assembled from live probing of `<reference url>` on `<date>`.
> Probed features: N · Branches mapped: N · Friction points: N

<!-- Inline 01-features/EVIDENCE-BASIS.md verbatim here. Live probing in this step upgrades
     features from inferred to observed, so REGENERATE the basis block before inlining —
     the ratio you inherited from step 01 is now wrong in your favour. -->

```
EVIDENCE BASIS — <slug> — <date, post-probing>
```

## 1. Baseline

The reference's measured cost for each core task. This is what the rebuild is measured against.

| Task | Steps | Screen changes | Fields | Wait | Friction | Our target |
|---|---|---|---|---|---|---|

Source: `step-count.csv`.

## 2. Core flows

One subsection per feature. Inline the branch map; link the full doc in `flows/`.

Per flow, state the three things a designer needs before opening a canvas:
1. how many branches exist
2. which branch is most likely in real use (often not the happy path)
3. which branch the reference handles worst

## 3. Screen states

`states.md` inlined as one table. Any cell reading `not reached` is a design decision the
rebuild has to make without precedent — mark those, they need explicit attention.

## 4. Interaction rules

The system-wide conventions the rebuild will adopt, adapt or reject.

| Rule | Reference behavior | Our decision | Why |
|---|---|---|---|

Include the reference's own inconsistencies — they tell you which rule was retrofitted.

## 5. Onboarding

The path to first value, with the reference's step count and drop-off risks.

## 6. Latency budget

| Operation | Reference | Feedback used | Our budget | Our feedback |
|---|---|---|---|---|

## 7. Microcopy intent

Not their words — the moments where words are needed, and what job each one does.

| Moment | Job the copy does | Reference length | Our approach |
|---|---|---|---|

## 8. Friction inventory

`friction-log.md` summarized and ranked. The top items are the input to
`04-product/differentiation.md`.

| # | Friction | Severity | Root cause | Opportunity |
|---|---|---|---|---|

## 9. Open UX decisions

Branches the reference handles in a way we should not copy, and states it never handles at
all. Each needs an owner and a decision.
