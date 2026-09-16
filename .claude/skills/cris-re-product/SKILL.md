---
name: cris-re-product
description: Step 04 of the reverse-engineering pipeline. Assemble a PRD from reverse-engineering evidence - job stories, an explicit MVP cut line with drop reasons, differentiation bets, and a technical risk register. Use after cris-re-features/cris-re-domain/cris-re-ia, or when the user asks to turn a feature inventory into a PRD / product definition / "dinh nghia san pham" / MVP scope.
---

# cris-re-product — from inventory to PRD

Read `../cris-reverse-engineer/references/conventions.md` first.

**Input:** `features.csv`, `domain.md`, `screens.csv`, `patterns.md`, and — if it exists —
`out/<slug>/05-ux/friction-log.md`.

## What this step cannot do alone

The evidence gives you *what the reference does*. It does not give you *who you are building
for* or *what winning looks like*. Ask the user these four, and do not paper over missing
answers with plausible filler:

1. Who is the primary user, concretely? (not "teams" — "a 3-person ops team at a freight
   forwarder who currently does this in Excel")
2. What does success look like in 6 months, as a number?
3. Hard constraints: team size, deadline, budget, must-use stack?
4. Is the goal parity, a cheaper subset, or a different bet on one dimension?

Write the answers into the PRD verbatim. If the user cannot answer #2, record
`TBD — blocks scope decisions` rather than inventing a metric.

## Procedure

### 1. job-stories.md

Pick 5-7 core tasks. Format, per story:

```
When <situation>, I want to <motivation>, so I can <expected outcome>.

Reference does it in: N steps (see step-count.csv)
Touches: <entities>   Screens: <screen ids>   Features: <feature ids>
Failure modes that matter: <from state-machines.md>
```

Situation-anchored, not persona-anchored. "When an invoice is rejected and I only find out
from a customer email" beats "As a finance manager I want notifications".

### 2. mvp-scope.md

Three columns, every `features.csv` row assigned to exactly one, each with a one-line reason:

| Now | Later | Never |
|---|---|---|

Rules:
- **Now** should be 20-30% of the inventory. If you are above 40%, you are not cutting,
  you are cloning — say so plainly to the user.
- Every **Later** row needs a trigger ("when we have >50 orgs"), not just a vibe.
- **Never** is a real and valuable column. Features the reference carries for legacy or
  enterprise-sales reasons are not obligations you inherited.
- A `Now` row whose entity has an unfinished state machine in `state-machines.md` is a
  scoping trap. Flag it.
- **A `Now` row at `guessed` confidence, or at `inferred` with no live probe behind it, is an
  estimate built on an assumption.** Mark it `[UNVERIFIED]` inline. These are the rows that
  blow up estimates, and they are invisible once the feature name is sitting in a scope table
  looking like every other row.

### 3. differentiation.md

1-3 bets, no more. Each one:

```
Bet:        <one sentence>
Evidence:   <friction-log entry / step-count delta / coverage gap>
Measurable: reference = X, target = Y
Cost:       what it makes harder
```

A bet with no measurable column is a slogan. "Better UX" is not a bet. "Report creation in
4 steps vs their 11" is.

### 4. risks.md

Technical risk register. Seed it from:
- the 2-3 most complex state machines (concurrency, partial failure, rollback)
- anything in `tech-observations.md` marked realtime, background-job, or large-dataset
- integrations the reference has that you would need to rebuild
- `coverage.md` blind spots that sit inside `Now` scope

Rate each `likelihood x impact`, and name the cheapest experiment that would retire it.

### 5. PRD.md

Assemble using `templates/prd.md`. It is a cover document that links the artifacts — do not
duplicate the CSVs into it.

**Inline `01-features/EVIDENCE-BASIS.md` verbatim as §0, before the problem statement.** A
PRD built on a 70%-inferred base reads exactly like one built on direct observation, and the
person approving the budget is the one who most needs to know the difference. If the basis
block has gone stale because a later step exercised more features, regenerate it first.

## Output

`out/<slug>/04-product/` : `PRD.md`, `job-stories.md`, `mvp-scope.md`, `differentiation.md`,
`risks.md`.

## Definition of done

- §0 carries the current `EVIDENCE-BASIS.md` block verbatim.
- Every `features.csv` row appears in exactly one MVP column with a reason.
- Every `Now` row that is not `observed` is marked `[UNVERIFIED]`.
- `Now` is under 40% of rows, or the overage is explicitly justified to the user.
- Every differentiation bet has a number on both sides.
- **Naive-reader check (do it, do not assume it).** Hand `PRD.md` + `mvp-scope.md` — and
  nothing else, no evidence bundle, no reference URL — to a fresh subagent and ask it to
  produce a rough build estimate plus its top 5 questions. Two failure signals: it cannot
  estimate (the PRD describes what exists rather than what to build), or its questions are
  answered in documents you did not give it (the PRD is not standalone). Record the
  questions in §11 as open items. This is cheap and it is the only external check in the
  pipeline — everything else is self-graded.
- MANIFEST.md updated.
