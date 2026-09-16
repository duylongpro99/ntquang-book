# Shared conventions (all `re-*` skills)

## Target slug

Derive from the reference URL hostname: lowercase, strip `www.`, replace `.` and `/` with `-`.
`https://www.linear.app/inbox` -> `linear-app`

## Output layout

Everything lands under `out/<slug>/`. Never write artifacts into the repo root.

```
out/<slug>/
  MANIFEST.md              # step status + timestamps + key counts
  00-recon/
    raw/                   # bundles, source maps, sitemap.xml, robots.txt, HAR
    strings.txt            # deduped i18n / UI label corpus
    routes.txt             # full route list
    endpoints.csv          # API surface
    pricing-matrix.md
    changelog.md
    tech-observations.md
    recon-report.md        # human summary of what was found and what was blocked
  01-features/
    features.csv           # THE master inventory
    coverage.md            # unmapped routes/strings/endpoints = gaps
  02-domain/
    domain.md              # prose + ERD (mermaid)
    entities.csv
    state-machines.md      # mermaid stateDiagram per enum
    events.md
    permissions.md
  03-ia/
    sitemap.md
    screens.csv
    orphan-routes.md
    patterns.md
  04-product/
    PRD.md
    job-stories.md
    mvp-scope.md
    differentiation.md
    risks.md
  05-ux/
    ux-spec.md             # the assembled spec
    flows/<feature>.md     # one per probed feature
    friction-log.md
    step-count.csv
    states.md
    microcopy.md
    onboarding.md
    interaction-rules.md
    latency-budget.md
  06-ui/
    tokens.json
    components.md
    design-notes.md
```

## MANIFEST.md

Every skill updates it on completion. One row per step:

```
| Step | Skill | Status | When | Key output |
|------|-------|--------|------|------------|
| 00 | cris-re-recon | done | 2026-09-16 | 142 routes, 2,310 strings, 187 endpoints |
| 01 | cris-re-features | done | 2026-09-16 | 163 features (48 seen / 115 inferred) |
```

Status values: `pending`, `partial`, `done`, `blocked`. Use `partial` honestly — a
blocked source (no source map, login wall) is a finding, not a failure to hide.

## Load-bearing invariants — do not "tidy" these

Two rules below carry the entire confidence story. Everything else in this file is plumbing
for them. A future editor compressing either one into a footnote, an aside, or a "nice to
have" silently breaks every downstream artifact while leaving all of them looking fine:

1. **The inferred:observed ratio is the headline of step 01, not a footnote.** Step 01's
   deliverable is a measure of the client's blind spots that happens to contain a feature
   list — not a feature list that happens to mention confidence. Demote it and the pipeline
   reverts to producing a confident-looking inventory of a system nobody actually examined.

2. **Blocked sources are findings, not failures.** They set the confidence ceiling. Presented
   as apologies, or omitted because they look like incomplete work, the ceiling never gets
   computed — and then there is nothing for `EVIDENCE-BASIS.md` to propagate and the whole
   mechanism below becomes ceremony.

Both are load-bearing precisely because nothing visibly breaks when they go. The artifacts
still generate; they are just quietly unreliable.

## Evidence discipline

Every derived claim carries a `source` and a `confidence`:

- `observed` — seen working in the live UI with your own eyes
- `inferred` — strong evidence (i18n cluster, endpoint, route) but not exercised
- `guessed` — plausible, no direct evidence. Must be flagged; never silently upgraded.

**`observed` requires a proof pointer.** Every row graded `observed` carries a `proof`
value naming the artifact that proves it: a screenshot path, a flow doc section, a captured
request. A row marked `observed` with an empty `proof` is invalid and must be downgraded to
`inferred` — no exceptions, no "I'm fairly sure I saw it".

This rule exists because steps 00-03 run unattended, and unattended work under pressure to
produce a complete inventory is exactly where `inferred` silently becomes `observed`. Making
the grade require a citation turns honesty from an intention into a field that is either
filled or empty.

The inferred:observed ratio is itself a headline result — it quantifies how much of the
system is invisible to casual browsing.

## Confidence ceiling — and carrying it forward

Blocked sources in step 00 cap how much *anything* downstream can be trusted. That cap is
asserted nowhere useful unless it physically travels with the artifacts, so:

`cris-re-features` writes `01-features/EVIDENCE-BASIS.md`, a short block in this exact shape:

```
EVIDENCE BASIS — <slug> — <date>
Features:  163   observed 48 (29%) · inferred 115 (70%) · guessed 2 (1%)
Blocked:   source maps stripped · Enterprise tier unreachable · /openapi.json 404
Ceiling:   claims about Enterprise-tier behaviour and about any workflow past the
           "approved" state are INFERRED ONLY and were never exercised.
```

Every downstream artifact **inlines this block verbatim, at the top**:

| Artifact | Where |
|---|---|
| `04-product/PRD.md` | §0, before the problem statement |
| `05-ux/ux-spec.md` | header, under the title |
| `06-ui/design-notes.md` | header |

Reason: a PRD built on a 70%-inferred base reads exactly like one built on direct
observation. Whoever approves the build budget deserves to see which one they are holding
without going to dig for `coverage.md`.

When a step materially changes the ratio — `cris-re-domain` exercising states, `cris-re-ux` probing
live features — it **regenerates** `EVIDENCE-BASIS.md` and the downstream copies go stale.
Re-inline on every regeneration; a stale basis block is worse than none.

## Boundaries

### Authorization — settle this before step 00 runs

Copyright clean-room is not the same question as permission to analyse. Many SaaS Terms of
Service prohibit competitive analysis, benchmarking, or automated access outright,
independently of anything you do with what you learn.

Before any fetching or browsing, confirm with the user and record the answer in
`00-recon/recon-report.md`:

```
AUTHORIZATION
  Relationship to target:  <own product / employer's / customer of / no relationship>
  ToS reviewed:            <yes — clause X permits/prohibits … | no>
  Automated access:        <permitted / prohibited / silent>
  Competitive analysis:    <permitted / prohibited / silent>
  Basis to proceed:        <one line>
```

If the user has not read the ToS, say so plainly and let them decide — it is their call, not
yours, and "silent" is a perfectly normal answer that people proceed on. But an unrecorded
answer is not acceptable: this is the first thing a legal reviewer asks, and reconstructing
it months later is far more expensive than one line now.

Where the ToS explicitly prohibits automated access, restrict step 00 to manual browsing with
the user's own account plus public marketing/docs pages, and note the restriction as a
blocked source — it lowers the confidence ceiling like any other.

### Clean room

Observe and learn from the reference; do not reproduce it.

- No copying source code, assets, icons, fonts, or brand identity.
- No copying marketing or UI copy verbatim into the new product. Record microcopy as
  *evidence of intent* ("they explain X at this moment, in ~12 words"), then rewrite.
- Public pages and your own authenticated account only. No credential sharing, no
  accessing other tenants' data, no scraping PII.
- Respect the site: no aggressive crawling, no load testing, honor robots.txt for
  bulk fetching.
- Never perform irreversible destructive actions on a live account (delete org, cancel
  billing). Open the confirm dialog, read the wording, cancel.

## Browser use

Browser-driven steps use the `claude-in-chrome` tools. Rules:

- Call `tabs_context_mcp` first; never reuse a tab id from a previous session.
- Create a new tab rather than hijacking the user's.
- Never trigger native `alert`/`confirm`/`prompt` — they freeze the extension.
- After 2-3 consecutive failures on the same action, stop and report. Do not grind.
- Prefer `read_page` / `get_page_text` over screenshots for extraction; use screenshots
  for layout and visual evidence.
