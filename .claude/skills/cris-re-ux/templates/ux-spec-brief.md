# UX Probing Brief — `<product name>`

> **To the receiving agent:** this brief is self-contained. You need only the reference URL
> below, browser automation tools, and the credentials named in §2. Follow §4 exactly and
> produce the files in §6. Where this brief states a hypothesis, treat it as something to
> *verify*, not as fact — contradicting it is a valuable result.

---

## 1. Mission

Produce a **UX specification** of the reference webapp at `<REFERENCE URL>`.

Not a feature list. Not a visual description. Specifically: for each target feature, the
complete **branch map** — what happens on the happy path, and what happens on every
alternate, boundary, interrupted and failing path around it.

The client is rebuilding a comparable system and needs to know what to design for beyond
the obvious screen. **The branches are the deliverable.** A flow doc with only a happy path
has failed the brief.

## 2. Access

| | |
|---|---|
| Reference URL | `<url>` |
| Credentials | `<how the agent gets them: pre-logged-in Chrome profile / user will log in / public only>` |
| Account tier | `<free / trial / pro>` |
| Roles available | `<e.g. owner only, or owner + member>` |
| Tenancy | `<is the data a throwaway sandbox, or the client's real account?>` |

If the account holds real data, treat everything as production: read-only bias, no bulk
operations, no deletions.

## 3. Targets

Probe these features, in this order. Each carries the hypotheses already derived from
static analysis — go verify or refute them.

<!-- Repeat this block per feature. Fill from features.csv / state-machines.md /
     screens.csv / pricing-matrix.md. Delete the guidance comments when filling. -->

### 3.1 `<feature id>` — `<feature name>`

- **Entry points:** `<routes / nav items>`
- **Primary entity:** `<entity>`
- **Known/suspected states:** `<enum values from state-machines.md>`
- **Known transitions to exercise:** `<from -> to, who triggers>`
- **Suspected limits:** `<quota or tier gate from pricing-matrix.md>`
- **Strings suggesting undiscovered behavior:** `<2-5 verbatim strings from the corpus that
  imply a branch nobody has seen, e.g. "This invitation has expired">`
- **Specific question to answer:** `<the one thing the client most needs to know>`

### 3.2 ...

## 4. Probing protocol

For **each** target feature, run all twelve probes. Record the result of every one, including
"not reachable with this account" — a negative result is data.

| # | Probe | What to record |
|---|---|---|
| 1 | **Happy path** | Every click and field, in order. Count steps, screen changes, fields, waits. |
| 2 | **First-run / empty** | What an account with zero data sees. Verbatim empty-state copy. Is there a CTA, a sample, a template, a tour? |
| 3 | **Invalid input** | Blank required field, wrong format, too long, special characters. Where does validation fire — on keystroke, blur, or submit? Is the message next to the field or at the top? |
| 4 | **Boundary values** | 0, 1, max. Long strings, large numbers, past/future dates. |
| 5 | **Duplicate / conflict** | Create the same thing twice. Silent allow, block, merge, or warn? |
| 6 | **Permission boundary** | Repeat as a lower-privileged role if available. Is the feature hidden, visible-but-disabled, or does it fail only on submit? |
| 7 | **Quota / tier gate** | Approach the plan limit. Where is the block — before the flow starts, or after the user has done the work? (This is a strong signal of design quality.) |
| 8 | **Interruption** | Cancel halfway. Press browser Back mid-wizard. Refresh mid-form. Is progress saved, warned about, or lost? |
| 9 | **Deep link** | Open a mid-flow URL directly in a fresh tab. Does it work, redirect, or break? |
| 10 | **Long-running op** | Anything over ~1s. Spinner, skeleton, progress bar, optimistic update, or background job with later notification? Measure the actual wait. |
| 11 | **Large dataset** | The biggest list you can reach. Pagination style, default sort, search, filter persistence, bulk-select behavior. |
| 12 | **Destructive action** | Open the delete/cancel confirmation, **record the exact wording, then CANCEL**. Never execute it. Note whether the product offers undo instead of confirm. |

**Throughout, capture:**
- **Verbatim microcopy** — every label, error, empty state, tooltip, confirmation. Exact text.
- **Screenshot** at each branch point, named `<feature>-<probe>-<n>.png`.
- **Timing** for anything that makes you wait.
- **Your own hesitation.** Any moment you had to stop and think, re-read a label, guess at a
  word, hunt for a control, or backtrack — log it with a timestamp. This is the friction log
  and it is worth more than the screenshots.

## 5. Safety rules — non-negotiable

1. **Never execute an irreversible action.** Delete, cancel subscription, revoke access,
   transfer ownership, remove a member: open the dialog, read it, cancel.
2. **Never trigger a native `alert`/`confirm`/`prompt` dialog** — it freezes the browser
   extension and ends the session.
3. **Never send anything to a real person.** For invites/shares, use a plus-addressed
   mailbox you control. Never a real third party's address.
4. **Never enter real payment details.** Walk up to the payment step, record the flow, stop.
5. **Never access data outside the client's own account.** No tenant-hopping, no ID
   enumeration, no scraping other users' records.
6. **No load generation.** Sequential human-paced interaction only.
7. **Stop after 2-3 consecutive failures** on the same action and report. Do not grind.
8. **No copying of code, assets, fonts, icons or brand identity.** Microcopy is recorded as
   evidence of intent only; it must not be reused verbatim downstream.

If any probe would require breaking one of these, skip it and record
`SKIPPED — safety rule N` in the flow doc.

## 6. Deliverables

Write to `<output dir>`:

### `flows/<feature>.md` — one per target

````markdown
# Flow: <feature name>

## Happy path
| # | Action | Screen | Result | Wait |
Steps: N · Screen changes: N · Fields: N · Total wait: Ns

## Branch map
```mermaid
flowchart TD
```

## Branches
| # | Probe | Trigger | Observed behavior | Microcopy (verbatim) | Assessment |
|---|-------|---------|-------------------|----------------------|------------|

## Unreached
| State / branch | Why unreachable |

## Notes for the rebuild
Two or three sentences: what this feature gets right, what it gets wrong, what the
rebuild should do differently.
````

**Minimum 4 branches beyond the happy path per feature.** If you found fewer, you probed
too shallowly — go back to §4 and run the probes you skipped.

### `friction-log.md`

```
| # | Feature | Moment | What I expected | What happened | Severity | Root cause |
```
Severity: `blocker` / `hesitation` / `annoyance`. Root cause: `unclear label` /
`hidden control` / `no feedback` / `unexpected navigation` / `too many steps` / `lost work`.

### `step-count.csv`

`task,steps,screen_changes,fields,waits_seconds,friction_points,notes`

One row per target feature's happy path. This is the client's improvement baseline — measure
honestly, do not round in the reference's favor or against it.

### `states.md`

Table: screen x {empty, loading, error, forbidden, overflow, offline}. Fill every cell with
what you observed or `not reached`.

### `microcopy.md`

Grouped by moment (onboarding, validation, confirmation, error, empty, success). Per entry:
verbatim string, where it appears, word count, and **one line on why it exists at that
moment**. The intent is what transfers; the words do not.

### `onboarding.md`

The empty-account journey from signup to first moment of value. Number the steps, mark where
you got stuck, note total elapsed time and how many steps before the user sees something
useful.

### `interaction-rules.md`

System-wide conventions you can infer from repetition:
modal vs full page · confirm vs undo · optimistic vs pessimistic updates · toast vs inline
feedback · autosave vs explicit save · where the primary action sits · keyboard support ·
how destructive actions are styled · URL/back-button behavior.

State each rule, then note any screen that violates it — inconsistencies are findings.

### `latency-budget.md`

`operation, measured_ms, feedback_mechanism, blocking?, sync_or_async`

## 7. Acceptance criteria

Self-check before reporting done:

- [ ] Every target in §3 has a flow doc.
- [ ] Every flow doc has ≥4 branches beyond the happy path.
- [ ] Every one of the 12 probes has a recorded outcome per feature (result or `not reached`).
- [ ] Every "known state" listed in §3 is reached, or listed in `Unreached` with a reason.
- [ ] `step-count.csv` has a row per target.
- [ ] `friction-log.md` is non-empty. Zero friction on a real product means you were not
      paying attention; note where you looked if you truly found none.
- [ ] Every microcopy entry is verbatim and carries an intent note.
- [ ] Every §3 hypothesis is marked confirmed, refuted, or untested.
- [ ] No safety rule was broken; all skips are recorded with their rule number.

## 8. Reporting

Report what you observed, plainly. Specifically:

- Distinguish **observed** (you triggered it) from **inferred** (you reasoned about it).
  Never label the second as the first.
- Refuted hypotheses are the most valuable output in the brief. Lead with them.
- If access limits blocked a large part of the scope, say so in one clear line at the top of
  your summary rather than burying it.
