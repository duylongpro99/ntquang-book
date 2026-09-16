---
name: cris-re-ux
description: Step 05 of the reverse-engineering pipeline. Produce the UX spec for a reference webapp - branch-complete flow diagrams, friction log with step counts, per-screen state catalog, microcopy corpus, onboarding path, interaction rules and latency budget. Also generates a self-contained handoff brief so a separate browser-driving agent can do the live probing. Use when the user asks for UX spec, user flows, friction log, "dac ta UX", or wants to hand UX probing to another agent.
---

# cris-re-ux — what happens, not what it looks like

Read `../cris-reverse-engineer/references/conventions.md` first.

UI is what it looks like. **UX is what happens: time, sequence, state, and failure.** A
wireframe shows one screen in one state; this step captures the branches a wireframe cannot
express.

**Input:** `features.csv`, `state-machines.md`, `screens.csv`, `strings.txt`.

## Two modes — pick one, ask the user if unclear

### Mode A — generate the handoff brief (default when the user has a separate browser agent)

Produce a **self-contained** brief that another agent can execute with only the reference
URL and browser tools. Read `templates/ux-spec-brief.md`, fill every `<...>` placeholder
from the evidence, and write it to `out/<slug>/05-ux/BRIEF.md`.

Filling it means doing the desk work here so the browsing agent does not have to:

1. **Rank the features** with the rubric below and embed the chosen top N *by name* in the
   brief. Do not make the other agent re-derive the ranking — it lacks the evidence bundle.
2. **Embed the per-feature context** each probe needs: known states from
   `state-machines.md`, known screens from `screens.csv`, known limits from the pricing
   matrix. These are the hypotheses the agent goes to verify.
3. **Embed the account situation**: what credentials exist, which roles, what tier.
4. Keep the brief standalone. Assume the receiving agent sees no other file.

The brief is the deliverable in this mode. Hand the path to the user and stop.

### Mode B — run the probing directly

Execute `templates/ux-spec-brief.md` yourself using the `claude-in-chrome` tools, following
the same protocol, and write the full output set.

## Feature ranking rubric

Score each `features.csv` row 0-2 per criterion; take the top 5-7:

| Criterion | 2 points |
|---|---|
| Activation path | user must do it in their first session |
| Navigation prominence | primary nav item |
| Endpoint density | 5+ endpoints touch it |
| Workflow depth | its entity has a 4+ state machine |
| Tier gating | it is what a paid tier sells |
| String density | 40+ strings in its namespace |
| Frequency | a daily-use task, not a one-time setup |

Ties break toward workflow depth — deep workflows hide the most branches.

## Outputs

`out/<slug>/05-ux/`:

| File | Contains |
|---|---|
| `ux-spec.md` | the assembled spec — see `templates/ux-spec.md` |
| `flows/<feature>.md` | one per probed feature: happy path + every branch found |
| `friction-log.md` | every moment of hesitation, backtrack, or misread, timestamped |
| `step-count.csv` | `task,steps,screen_changes,fields,waits,friction_points` |
| `states.md` | screen x {empty, loading, error, forbidden, overflow, offline} |
| `microcopy.md` | verbatim corpus with a note on *why* each string exists at that moment |
| `onboarding.md` | the empty-account journey to first value, step by step |
| `interaction-rules.md` | system-wide conventions inferred from repeated behavior |
| `latency-budget.md` | per operation: measured time, feedback mechanism, sync/async |

## Why friction-log + step-count come first

The user wants to *improve* on the reference. Improvement needs a baseline, and
`step-count.csv` is the only artifact in the pipeline that produces one. It converts
"our UX is better" — unfalsifiable — into "report creation: reference 11 steps, ours 4".

`friction-log.md` then feeds directly into `04-product/differentiation.md`.

## Definition of done

- Each probed feature has a flow doc with **at least 4 branches beyond the happy path**.
  Fewer than 4 almost always means shallow probing, not a simple feature.
- Every state in `state-machines.md` is either reached and recorded, or explicitly listed as
  unreachable-with-this-account.
- `step-count.csv` has a row per job story.
- `microcopy.md` explains intent, not just text. Verbatim strings are evidence here and must
  be rewritten before they reach the new product — see Boundaries in conventions.
- MANIFEST.md updated.

## Do not

- Do not carry reference microcopy into the new product's design. Record it, learn the
  intent, rewrite it.
- Do not report a branch as observed if it was reasoned about rather than triggered.
