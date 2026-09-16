---
name: cris-reverse-engineer
description: Run the full reverse-engineering pipeline on a reference webapp URL - recon, feature inventory, domain model, information architecture, PRD, UX spec, UI wireframes - to define and design a comparable product from scratch. Use when the user gives a reference URL and wants to rebuild something similar, discover hidden features, or produce PRD + architecture + UI/UX artifacts from an existing product. Triggers on "reverse engineer this site", "rebuild from reference", "phan tich va xay dung lai", "full pipeline". Individual steps are the cris-re-recon / cris-re-features / cris-re-domain / cris-re-ia / cris-re-product / cris-re-ux / cris-re-ui skills.
---

# cris-reverse-engineer — full pipeline orchestrator

Runs seven steps that turn a reference URL into a buildable product definition.

Read `references/conventions.md` (shared output layout, evidence discipline, boundaries,
browser rules) and `references/pipeline.md` (step contracts, gates, resume logic) before
starting.

## The pipeline

| Step | Skill | Produces | Needs browser |
|---|---|---|---|
| 00 | `cris-re-recon` | raw evidence: strings, routes, endpoints, pricing, bundles | optional |
| 01 | `cris-re-features` | `features.csv` — the master inventory + hidden-feature ratio | no |
| 02 | `cris-re-domain` | entities, ERD, state machines, events, permissions | no |
| 03 | `cris-re-ia` | sitemap, screen inventory, orphan routes, layout patterns | no |
| 04 | `cris-re-product` | PRD, job stories, MVP cut line, differentiation, risks | no |
| 05 | `cris-re-ux` | UX spec, or a handoff brief for a separate browsing agent | yes |
| 06 | `cris-re-ui` | tokens, component inventory, wireframe canvas | optional |

Steps 00-03 are evidence work and run without the user. **Steps 04-06 need the user's input**
and should not be guessed through.

## Before starting — ask five things

0. **Authorization.** Fill the `AUTHORIZATION` block from conventions. Nothing fetches until
   it is answered and recorded. See Gate 0 in `references/pipeline.md`.
1. **Reference URL.** Required; nothing starts without it.
2. **Access.** Any login/trial? A second account with a different role? (Doubles what 00 and
   05 can see.)
3. **Goal.** Parity, a cheaper subset, or a different bet on one dimension? (Sets the cut
   line in 04.)
4. **Depth.** Full pipeline, or stop after 01 to see the scale of the system first?

Question 4 matters: many users only need 00-02 to decide whether the project is worth doing
at all. Offer that as the default stopping point rather than assuming they want all seven.

## Execution

Run steps in order by invoking each skill. After **every** step:

1. Update `out/<slug>/MANIFEST.md`.
2. Report the headline number to the user in one line.
3. Check the gate in `references/pipeline.md` before continuing.

Four gates require stopping for the user, not just reporting:

- **Before 00** — authorization recorded. One line, before any fetch.
- **After 01** — show the observed/inferred ratio and total feature count. This is where the
  user decides whether the scope is viable. Do not blow past it.
- **After 04** — the MVP cut line is the user's decision, not yours. Present the three
  columns and get agreement.
- **After lo-fi in 06** — get wireframe review before hi-fi.

At Gate A also confirm `EVIDENCE-BASIS.md` is accurate: it gets inlined verbatim into the
PRD, the UX spec and the design notes, and it is the only thing standing between a
70%-inferred inventory and a build decision that looks fully informed.

## Parallelism

01, 02 and 03 all read 00 and can run concurrently as subagents when the evidence bundle is
large. 02 writes back into `features.csv` (the `entity` column), so if you parallelize, have
02 write `entity-map.csv` separately and merge after both finish — concurrent writes to
`features.csv` will corrupt it.

04 and 05 both depend on 03. 05 can run while the user reviews 04's cut line.

## Resume

The pipeline is resumable. On invocation, read `out/<slug>/MANIFEST.md`, report current
state, and start from the first `pending` or `partial` step. Never silently redo completed
work — ask if the user wants a step re-run.

## Honest reporting

A step is `partial` when a source was blocked, not `done`. Blocked sources are findings:
stripped source maps, a login wall, a tier you cannot reach, a ToS that forbids automated
access. They set the confidence ceiling for everything downstream, and hiding them makes
every later artifact quietly unreliable.

The ceiling only does its job if it travels. `EVIDENCE-BASIS.md` is inlined verbatim into
the PRD, the UX spec and the design notes, and is **regenerated** whenever a step changes the
ratio — `cris-re-domain` reaching new states, `cris-re-ux` probing features live. A stale basis block
overstates your confidence in your own favour, which is worse than having none.
